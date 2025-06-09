import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Student from './models/Student.js';
import { GoogleGenAI } from '@google/genai';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config();

const app = express();
const port = 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Google Auth Configuration ---
let googleAuthClient;

if (process.env.NODE_ENV === 'production') {
  // Production environment: Use credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const tempFilePath = path.join(os.tmpdir(), 'google-credentials.json');
      fs.writeFileSync(tempFilePath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;
      console.log(`Service account credentials loaded from environment variable and written to: ${tempFilePath}`);
      googleAuthClient = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    } catch (error) {
      console.error('Error processing GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
      process.exit(1); // Exit if production credentials cannot be set
    }
  } else {
    console.error('CRITICAL: GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not found in production.');
    process.exit(1); // Exit if production credentials are missing
  }
} else {
  // Development environment: Use credentials from GOOGLE_CREDENTIALS
  if (process.env.GOOGLE_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      googleAuthClient = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      console.log('Google credentials loaded from GOOGLE_CREDENTIALS for development.');
    } catch (error) {
      console.error('Error parsing GOOGLE_CREDENTIALS:', error);
      console.warn('⚠️ Falling back to default Google application credentials lookup.');
      googleAuthClient = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    }
  } else {
    console.warn('⚠️ GOOGLE_CREDENTIALS env variable is not set for development. Relying on default ADC lookup order.');
    googleAuthClient = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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

// User registration endpoint
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation (can be enhanced with a validation library)
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Return a 409 Conflict status or 400 Bad Request with a clear message
            return res.status(409).json({ message: 'This email is already registered. Please use a different email or log in.' });

        }
       // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (err) {
        console.error('Error during registration:', err);
        // Generic server error for unexpected issues
        res.status(500).json({ message: 'Server error during registration. Please try again later.' });
    }
});


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
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Nodemailer transporter setup (moved here to ensure env variables are loaded)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

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
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Initialize Vertex AI with the dynamically set authClient
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'gen-lang-client-0993206169',
  location: 'global',
  authClient: googleAuthClient,
});
const model = 'gemini-2.0-flash-001';

const siText1 = { text: `If the toddler failed the activity, provide 5 diverse activity options that support success in the same area. If they succeeded then provide 5 diverse activity options to grow and develop the necessary skills depending on their developmental stage, goals, and other appropriate considerations. Ensure suggestions vary and match developmental needs. Avoid using the term "parents" or any other term that specifies the user's role. Use more general language to be inclusive of educators and other users. Only provide these three for each activity: Title of Activity, Why it works, Skills supported` };

const activityPrompt = "Objective and Persona:You are an expert in early childhood development, specializing in creating engaging and developmentally appropriate activities for toddlers. Your task is to provide diverse activity suggestions tailored to a toddler's individual needs and recent performance.Instructions:To complete the task, you need to follow these steps:Analyze the recent_activity result.If the toddler failed the activity:Provide 5 diverse activity options that help build towards success in the same skill area.Prioritize observations from the recent_activity when suggesting new activities.Also consider developmental_stage, goals, interests, energy_level, and social_behavior.If the toddler succeeded in the activity:Provide 5 diverse activity options to help them grow and develop necessary skills further.Consider their developmental_stage, goals, interests, energy_level, and social_behavior.Ensure all activity suggestions are diverse in nature (e.g., varying types of play, skill focus, materials).For each activity, provide only the following three details:Title of Activity (String)Why it works (String)Skills supported (Array of Strings)Constraints:Do not use the term \"parents\" or any other term that specifies the user's role.Do not include any other text or explanations outside of the JSON output.Output Format:{ \"activity_suggestions\": [  {   \"Title of Activity\": \"String\",   \"Why it works\": \"String\",   \"Skills supported\": [\"String\"]  } ]}"

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
  systemInstruction: {
    parts: [siText1]
  },
};


app.post('/generate', async (req, res) => {
  const userInput = req.body.prompt + " " + activityPrompt;

  console.log('User input:', userInput);
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

// Save an activity to a student's SAVED activities
app.post('/students/:id/saved-activity', verifyToken, async (req, res) => { // <-- Changed endpoint path
  try {
    const userId = req.user.userId;
    const studentId = req.params.id;
    const activity = req.body.activity; // Expecting { activity: { ... } }
    if (!activity) {
      return res.status(400).json({ error: 'No activity provided.' });
    }

    console.log(`Attempting to save activity for student ${studentId} by user ${userId}`);
    console.log('Activity data:', activity);

    const student = await Student.findOne({ _id: studentId, userId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found or not authorized.' });
    }

    // Ensure saved_activities array exists
    student.saved_activities = student.saved_activities || [];

    // Assign a unique ID to the activity before pushing (Mongoose will do this on save, but for immediate client-side handling, it's good practice)
    const activityToSave = { ...activity, _id: new mongoose.Types.ObjectId() };
    student.saved_activities.push(activityToSave);

    await student.save();
    console.log('Activity successfully saved!');
    res.status(201).json({ message: 'Activity saved to saved_activities!', activity: activityToSave }); // Return the saved activity with its ID
  } catch (err) {
    console.error('Error saving activity to saved_activities:', err);
    res.status(500).json({ error: 'Failed to save activity.' });
  }
});

// Delete an activity from a student's SAVED activities
app.delete('/students/:studentId/saved-activities/:activityId', verifyToken, async (req, res) => { // <-- New endpoint
  try {
    const userId = req.user.userId;
    const { studentId, activityId } = req.params;

    const student = await Student.findOne({ _id: studentId, userId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found or not authorized.' });
    }

    // Filter out the activity to be deleted from the saved_activities array
    const initialLength = student.saved_activities.length;
    student.saved_activities = student.saved_activities.filter(a => a._id && a._id.toString() !== activityId);

    if (student.saved_activities.length === initialLength) {
      return res.status(404).json({ error: 'Activity not found in saved activities.' });
    }

    await student.save();
    res.json({ message: 'Activity deleted from saved_activities.' });
  } catch (err) {
    console.error('Error deleting saved activity:', err);
    res.status(500).json({ error: 'Failed to delete saved activity.' });
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