// server/src/controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { transporter } from '../utils/nodemailerTransporter.js'; // Adjust path as needed
import dotenv from 'dotenv';

dotenv.config();

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'This email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error during registration. Please try again later.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
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
};

export const forgotPassword = async (req, res) => {
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

        const resetLink = `daycare-ai-activity-suggestions.vercel.app/reset-password/${resetToken}`; // Make this configurable if needed
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
        });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (err) {
        console.error('Error during forgot password:', err);
        res.status(500).json({ error: 'Server error while processing your request' });
    }
};

export const resetPassword = async (req, res) => {
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
        console.error('Error during password reset:', err);
        res.status(500).json({ error: 'Server error during password reset' });
    }
};