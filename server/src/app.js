// server/src/app.js
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; // Import the new DB connection
import { initializeGoogleAuth, getAiInstance } from './config/googleAuth.js'; // Import Google Auth
import { transporter } from './utils/nodemailerTransporter.js'; // Import Nodemailer

// Import Routes
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Auth client
let googleAuthClient;
try {
    googleAuthClient = await initializeGoogleAuth();
    app.set('googleAuthClient', googleAuthClient); // Store in app locals for later use
    console.log('Google Auth Client initialized.');
} catch (error) {
    console.error('CRITICAL: Failed to initialize Google Auth Client:', error);
    process.exit(1); // Exit if essential AI dependencies fail
}

// Connect to MongoDB
await connectDB();

// Global health check
app.get('/', (req, res) => {
    res.send('API is running');
});

// Use Routes
app.use('/users', userRoutes); // Prefix for user routes
app.use('/students', studentRoutes); // Prefix for student routes
app.use('/ai', aiRoutes); // Prefix for AI routes

// Export app for server.js to use
export default app;