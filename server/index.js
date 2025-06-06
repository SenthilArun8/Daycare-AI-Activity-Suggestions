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
import { GoogleAuth } from 'google-auth-library'
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config(); // Load env variables from .env, must be before mongodb_uri

const app = express();
const port = 5000;
const MONGODB_URI = process.env.MONGODB_URI;
let keyFilePath = null;

if (process.env.GOOGLE_CREDENTIALS) {
  const credentialsObject = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const tempDir = os.tmpdir();
  keyFilePath = path.join(tempDir, 'gcloud-key.json');
  fs.writeFileSync(keyFilePath, JSON.stringify(credentialsObject));
  console.log('✅ Google credentials written to:', keyFilePath);
} else {
  console.warn('⚠️ GOOGLE_CREDENTIALS environment variable not set.');
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);



app.use(cors());
app.use(express.json());

await mongoose.connect(MONGODB_URI)
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

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'senthilarun08@gmail.com',    // Replace with your email
//     pass: 'xirs uhqa yfml spnm',     // Replace with your email password
//   },
// });

// // Example of sending an email
// const mailOptions = {
//   from: 'your-email@gmail.com',
//   to: 'recipient@example.com',
//   subject: 'Test Email',
//   text: 'This is a test email.',
// };

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log('Error sending email:', error);
//   } else {
//     console.log('Email sent:', info.response);
//   }
// });

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
  console.log('Login request received:', req.body);

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // This must be defined!
      { expiresIn: '1d' }
    );

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
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
    const resetLink = `daycare-ai-activity-suggestions.vercel.app/reset-password/${resetToken}`;
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

const auth = new GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'], // or a more specific one
});

// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'gen-lang-client-0993206169',
  location: 'global',
  authClient: auth
});
const model = 'gemini-2.0-flash-001';

const siText1 = {text: `If the toddler failed the activity, provide 5 diverse activity options that support success in the same area. If they succeeded then provide 5 diverse activity options to grow and develop the necessary skills depending on their developmental stage, goals, and other appropriate considerations. Ensure suggestions vary and match developmental needs. Avoid using the term "parents" or any other term that specifies the user's role. Use more general language to be inclusive of educators and other users. Only provide these three for each activity: Title of Activity, Why it works, Skills supported`};

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
  // responseMimeType: "application/json",
  // responseSchema: {
  //   "$schema": "https://json-schema.org/draft/2020-12/schema",
  //   "type": "object",
  //   "properties": {
  //     "Title of Activity": { "type": "string" },
  //     "Why it works": { "type": "string" },
  //     "How to": { "type": "string" },
  //     "Skills Supported": { "type": "string" }
  //   },
  //   "required": [
  //     "Title of Activity",
  //     "Why it works",
  //     "How to",
  //     "Skills Supported"
  //   ],
  //   "additionalProperties": false
  // },
  systemInstruction: {
    parts: [siText1]
  },
};


app.post('/generate', async (req, res) => {
  const userInput = req.body.prompt;

  console.log('User input:', userInput); // Log the user input for debugging
  if (!userInput) {
  return res.status(400).json({ error: 'Prompt is missing from the request body.' });
  }

  try {
    const chat = ai.chats.create({ model, config: generationConfig });
    const stream = await chat.sendMessageStream({ message: { text: userInput } });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.text) fullResponse += chunk.text;
    }

    // debugging to check 
    console.log('Response from AI:', fullResponse);
    try {
      const cleaned = fullResponse.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      res.json({ response: parsed });
    } catch (e) {
      console.error('JSON parse error:', e.message, '\nRaw response:', fullResponse);
      return res.status(500).json({ error: 'Model did not return valid JSON.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Update a student
app.put('/students/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found or not authorized' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update student' });
  }
});

// Save an activity to a student's activity_history
app.post('/students/:id/activity', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const studentId = req.params.id;
    const activity = req.body.activity;
    if (!activity) {
      return res.status(400).json({ error: 'No activity provided.' });
    }
    console.log(studentId);
    const student = await Student.findOne({ _id: studentId, userId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found or not authorized' });
    }
    // Append activity to activity_history
    student.activity_history = student.activity_history || [];
    student.activity_history.push(activity);
    await student.save();
    res.json({ message: 'Activity saved', activity });
  } catch (err) {
    console.error('Error saving activity:', err);
    res.status(500).json({ error: 'Failed to save activity' });
  }
});

// Delete an activity from a student's activity_history
app.delete('/students/:studentId/activity/:activityId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { studentId, activityId } = req.params;
    const student = await Student.findOne({ _id: studentId, userId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found or not authorized' });
    }
    student.activity_history = student.activity_history.filter(a => a._id.toString() !== activityId);
    await student.save();
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

app.listen(port, () => {
  const server = app.address ? app.address() : { address: 'localhost', port };
  console.log(`Server is running at http://${server.address}:${server.port}`);
});


// Client-side code to interact with the AI service

// const chat = ai.chats.create({
//   model: model,
//   config: generationConfig
// });

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
