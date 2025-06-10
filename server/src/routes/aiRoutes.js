// server/src/routes/aiRoutes.js
import express from 'express';
import { generateAiActivity } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateAiActivity);

export default router;