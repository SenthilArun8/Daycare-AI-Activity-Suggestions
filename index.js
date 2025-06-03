import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcrypt'; // for hashing password
import jwt from 'jsonwebtoken'; // for secure logins
import crypto from 'crypto'; 
import nodemailer from 'nodemailer';
import Student from './models/Student.js'; 
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;


dotenv.config(); // Load env variables from .env

const allowedOrigins = [
  'http://localhost:3000',
  'https://daycare-ai-activity-suggestions-qczyx1qmd.vercel.app',
  'https://daycare-ai-activity-suggestions-95i3vfwg9.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

await mongoose.connect('mongodb+srv://senthil:ebKehWK32zZReogC@cluster0.qfvdb5l.mongodb.net/Daycare')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Routes

app.get('/', (req, res) => {
  res.send('API is running');
});
// Health check endpoint

// Get all students
// Get students for the logged-in user
app.get('/students', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // <-- FIXED: use userId from JWT payload
    const students = await Student.find({ userId: userId });  
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});


// Get single student
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching student' });
  }
});

// Add a student
app.post('/students', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // <-- FIXED: use userId from JWT payload
    const newStudent = new Student({
      ...req.body,
      userId: userId,
    });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add student' });
  }
});


// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete student' });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'senthilarun08@gmail.com',    // Replace with your email
    pass: 'xirs uhqa yfml spnm',     // Replace with your email password
  },
});

// Example of sending an email
const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});

// User registration endpoint
app.post('/register', async (req, res) => {
  // console.log('Register request received:', req.body); // Log the incoming request

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err); // Log the error
    res.status(500).json({ error: 'Server error during registration' });
  }
});


// 
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Save the token and expiration date to the user's document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send the reset link to the user's email
    const resetLink = `https://daycare-ai-activity-suggestions-qczyx1qmd.vercel.app/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while processing your request' });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find the user by the reset token and check if it has expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new password and clear the reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during password reset' });
  }
});


// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'gen-lang-client-0993206169',
  location: 'global'
});
const model = 'gemini-2.0-flash-001';


// Set up generation config
const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 1,
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'OFF',
    }
  ],
};


app.post('/generate', async (req, res) => {
  const userInput = req.body.prompt;

  try {
    const chat = ai.chats.create({ model, config: generationConfig });
    const stream = await chat.sendMessageStream({ message: { text: userInput } });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.text) fullResponse += chunk.text;
    }

    res.json({ response: fullResponse });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// const msg1Text1 = {text: `{
//       "id": "87f2",
//       "toddler_id": "toddler_001",
//       "toddler_description": "2.5-year-old, physically active, curious, speaks in short sentences",
//       "name": "Liam",
//       "age_months": 30,
//       "gender": "male",
//       "personality": "adventurous, gets frustrated easily, loves music and animals",
//       "developmental_stage": "emerging language, starting to show independence",
//       "recent_activity": {
//         "name": "building with blocks",
//         "result": "failed",
//         "difficulty_level": "moderate",
//         "observations": "became frustrated when the tower fell"
//       },
//       "interests": ["music", "animals", "outdoor play"],
//       "preferred_learning_style": "hands-on",
//       "social_behavior": "enjoys parallel play, sometimes mimics older kids",
//       "energy_level": "high",
//       "daily_routine_notes": "naps in the afternoon, best mood in the morning",
//       "goals": [
//         "improve fine motor skills",
//         "build frustration tolerance",
//         "encourage collaborative play"
//       ],"activity_history": [
//         {
//           "name": "finger painting",
//           "result": "succeded",
//           "difficulty_level": "easy",
//           "date": "2025-05-15",
//           "notes": "enjoyed mixing colors, stayed focused for 20 minutes"
//         }
//       ]
//     },

// for the activity the toddler failed provide some diverse options of activities to choose from to enable success in the failed activity. Ensure the activities are varied and cater to different aspects of the toddler's development and interests. Present the options in the following format:

// **Title of Activity**
// -  *Why it works*
// - *skills and topics or whatever it works on*`};

const chat = ai.chats.create({
  model: model,
  config: generationConfig
});

async function sendMessage(message) {
  const response = await chat.sendMessageStream({
    message: message
  });
  process.stdout.write('stream result: ');
  for await (const chunk of response) {
    if (chunk.text) {
      process.stdout.write(chunk.text);
    } else {
      process.stdout.write(JSON.stringify(chunk) + '\n');
    }
  }
}

async function generateContent() {
  await sendMessage([
    msg1Text1
  ]);
}

// generateContent();