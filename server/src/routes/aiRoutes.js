// server/src/routes/aiRoutes.js
import express from 'express';
import { generateAiActivity, generateStory } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateAiActivity);
router.post('/generate-story', generateStory);

export default router;