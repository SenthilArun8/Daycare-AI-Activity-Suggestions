// server/src/routes/studentRoutes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
    saveActivityToSavedActivities,
    deleteActivityFromSavedActivities,
    saveActivityToHistory,
    deleteActivityFromHistory,
    getSampleStudent,
    saveActivityToDiscardedActivities,
    restoreDiscardedActivity,
    addPastActivity,
    saveStoryToSavedStories,
    getSavedStories,
    deleteSavedStory
} from '../controllers/studentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for sample students
router.get('/sample/:id', getSampleStudent);

// Routes requiring authentication
router.use(verifyToken); // Apply verifyToken middleware to all routes below this line

router.get('/', getStudents);
router.get('/:id', getStudentById); // Note: verifyToken is applied globally above, so it applies here too.
router.post('/', addStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.post('/:id/saved-activity', saveActivityToSavedActivities);
router.delete('/:studentId/saved-activities/:activityId', deleteActivityFromSavedActivities);
router.post('/:id/activity', saveActivityToHistory);
router.delete('/:studentId/activity/:activityId', deleteActivityFromHistory);
router.post('/:id/discarded-activity', saveActivityToDiscardedActivities);
router.post('/:id/restore-discarded-activity', restoreDiscardedActivity);
router.post('/:id/past-activities', addPastActivity);

// --- Saved Stories Endpoints ---
router.post('/:id/save-story', saveStoryToSavedStories);
router.get('/:id/saved-stories', getSavedStories);
router.delete('/:id/saved-stories/:storyIndex', deleteSavedStory);

export default router;