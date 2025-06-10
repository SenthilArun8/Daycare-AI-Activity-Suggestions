// server/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'; // Keep this for now, will remove later

import { V3 } from 'paseto'; // Use V3 for paseto v3 API

import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = async (req, res, next) => { // Make this async
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided.' });
    }

    // Ensure your key is decoded from base64 before use
    const PASETO_KEY_BASE64 = process.env.PASETO_LOCAL_KEY;
    if (!PASETO_KEY_BASE64) {
        console.error('PASETO_LOCAL_KEY is not defined in .env');
        return res.status(500).json({ error: 'Server configuration error: PASETO key missing.' });
    }
    const pae_key = Buffer.from(PASETO_KEY_BASE64, 'base64'); // Decode from base64

    try {
        // Use V3.decrypt for paseto v3
        const decoded = await V3.decrypt(token, pae_key);

        req.user = decoded; // The payload is directly available here
        next();
    } catch (err) {
        console.error("PASETO Verification Error:", err); // Log the specific error
        return res.status(400).json({ error: 'Invalid token.' });
    }
};