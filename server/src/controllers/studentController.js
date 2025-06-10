// server/src/controllers/studentController.js
import Student from '../models/Student.js';
import mongoose from 'mongoose';

const SAMPLE_STUDENT_IDS = [
  '683d57f853223cfb0c1e5723',
  '683d590053223cfb0c1e5724',
];

// Helper: Validate skills_supported structure
const isValidSkillsSupported = (skills) => {
    if (!Array.isArray(skills)) return false;
    for (const s of skills) {
        if (!s || typeof s !== 'object') return false;
        if (typeof s.name !== 'string' || typeof s.category !== 'string') return false;
        if (!s.name.trim() || !s.category.trim()) return false;
    }
    return true;
};

export const getStudents = async (req, res) => {
    try {
        const userId = req.user.userId;
        const students = await Student.find({ userId });
        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) {
        console.error('Error fetching single student:', err);
        res.status(500).json({ error: 'Error fetching student' });
    }
};

export const addStudent = async (req, res) => {
    try {
        const userId = req.user.userId;
        const newStudent = new Student({
            ...req.body,
            userId: userId,
        });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (err) {
        console.error('Error adding student:', err);
        res.status(400).json({ error: 'Failed to add student' });
    }
};

export const updateStudent = async (req, res) => {
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
        console.error('Error updating student:', err);
        res.status(400).json({ error: 'Failed to update student' });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(400).json({ error: 'Failed to delete student' });
    }
};

export const saveActivityToSavedActivities = async (req, res) => {
    try {
        const userId = req.user.userId;
        const studentId = req.params.id;
        const activity = req.body.activity;
        if (!activity) {
            return res.status(400).json({ error: 'No activity provided.' });
        }
        // Validate skills_supported
        if (!isValidSkillsSupported(activity.skills_supported)) {
            return res.status(400).json({ error: 'Invalid skills_supported structure. Must be array of { name, category }.' });
        }
        const student = await Student.findOne({ _id: studentId, userId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found or not authorized.' });
        }
        student.saved_activities = student.saved_activities || [];
        const activityToSave = { ...activity, _id: new mongoose.Types.ObjectId() };
        student.saved_activities.push(activityToSave);
        await student.save();
        res.status(201).json({ message: 'Activity saved to saved_activities!', activity: activityToSave });
    } catch (err) {
        console.error('Error saving activity to saved_activities:', err);
        res.status(500).json({ error: 'Failed to save activity.' });
    }
};

export const deleteActivityFromSavedActivities = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { studentId, activityId } = req.params;

        const student = await Student.findOne({ _id: studentId, userId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found or not authorized.' });
        }

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
};

export const saveActivityToHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const studentId = req.params.id;
        const activity = req.body.activity;
        if (!activity) {
            return res.status(400).json({ error: 'No activity provided.' });
        }
        // Validate skills_supported
        if (!isValidSkillsSupported(activity.skills_supported)) {
            return res.status(400).json({ error: 'Invalid skills_supported structure. Must be array of { name, category }.' });
        }
        const student = await Student.findOne({ _id: studentId, userId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found or not authorized' });
        }
        student.activity_history = student.activity_history || [];
        student.activity_history.push(activity);
        await student.save();
        res.json({ message: 'Activity saved to history', activity });
    } catch (err) {
        console.error('Error saving activity to history:', err);
        res.status(500).json({ error: 'Failed to save activity to history' });
    }
};

export const deleteActivityFromHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { studentId, activityId } = req.params;
        const student = await Student.findOne({ _id: studentId, userId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found or not authorized' });
        }
        student.activity_history = student.activity_history.filter(a => a._id.toString() !== activityId);
        await student.save();
        res.json({ message: 'Activity deleted from history' });
    } catch (err) {
        console.error('Error deleting activity from history:', err);
        res.status(500).json({ error: 'Failed to delete activity from history' });
    }
};

export const getSampleStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        if (!SAMPLE_STUDENT_IDS.includes(studentId)) {
            return res.status(403).json({ error: 'Not a sample student' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Sample student not found' });
        }

        const sampleStudent = {
            _id: student._id,
            name: student.name,
            age_months: student.age_months,
            gender: student.gender,
            personality: student.personality,
            developmental_stage: student.developmental_stage,
            recent_activity: student.recent_activity,
            interests: student.interests,
            preferred_learning_style: student.preferred_learning_style,
            social_behavior: student.social_behavior,
            energy_level: student.energy_level,
            goals: student.goals,
            activity_history: student.activity_history
        };

        res.json(sampleStudent);
    } catch (err) {
        console.error('Error fetching sample student:', err);
        res.status(500).json({ error: 'Error fetching sample student' });
    }
};

// Add a discarded activity to a student's discarded_activities array
export const saveActivityToDiscardedActivities = async (req, res) => {
    try {
        const userId = req.user.userId;
        const student = await Student.findOne({ _id: req.params.id, userId });
        if (!student) return res.status(404).json({ error: 'Student not found or not authorized' });
        // Validate skills_supported
        if (!isValidSkillsSupported(req.body.activity.skills_supported)) {
            return res.status(400).json({ error: 'Invalid skills_supported structure. Must be array of { name, category }.' });
        }
        student.discarded_activities.push(req.body.activity);
        await student.save();
        res.status(201).json({ message: 'Activity discarded', discarded_activities: student.discarded_activities });
    } catch (err) {
        console.error('Error discarding activity:', err);
        res.status(400).json({ error: 'Failed to discard activity' });
    }
};

// Restore a discarded activity for a student (move from discarded_activities to saved_activities)
export const restoreDiscardedActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const studentId = req.params.id;
        let { activityIdx } = req.body;
        activityIdx = Number(activityIdx);
        if (!Number.isInteger(activityIdx)) {
            return res.status(400).json({ error: 'Invalid activity index' });
        }
        const student = await Student.findOne({ _id: studentId, userId });
        if (!student) return res.status(404).json({ error: 'Student not found or not authorized' });
        if (!Array.isArray(student.discarded_activities) || activityIdx < 0 || activityIdx >= student.discarded_activities.length) {
            return res.status(400).json({ error: 'Invalid activity index' });
        }
        const activity = student.discarded_activities[activityIdx];
        // Validate skills_supported
        if (!isValidSkillsSupported(activity.skills_supported)) {
            return res.status(400).json({ error: 'Invalid skills_supported structure. Must be array of { name, category }.' });
        }
        // Ensure uniqueness: don't add if already in saved_activities (by title or _id)
        const alreadySaved = student.saved_activities.some(a =>
            (a.title && activity.title && a.title === activity.title) ||
            (a['Title of Activity'] && activity['Title of Activity'] && a['Title of Activity'] === activity['Title of Activity'])
        );
        if (!alreadySaved) {
            student.saved_activities.push(activity);
        }
        // Remove from discarded_activities
        student.discarded_activities.splice(activityIdx, 1);
        await student.save();
        res.status(200).json({ message: 'Activity restored', saved_activities: student.saved_activities, discarded_activities: student.discarded_activities });
    } catch (err) {
        console.error('Error restoring discarded activity:', err);
        res.status(400).json({ error: 'Failed to restore activity' });
    }
};

// Add a past activity to a student's activity_history (for AddPastActivity page)
export const addPastActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const studentId = req.params.id;
        const { name, result, difficulty_level, date, notes } = req.body;
        // Validate required fields
        if (!name || !result || !difficulty_level || !date) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const student = await Student.findOne({ _id: studentId, userId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found or not authorized' });
        }
        const activity = {
            name,
            result,
            difficulty_level,
            date,
            notes: notes || ''
        };
        student.activity_history = student.activity_history || [];
        student.activity_history.push(activity);
        await student.save();
        res.status(201).json({ message: 'Past activity added', activity });
    } catch (err) {
        console.error('Error adding past activity:', err);
        res.status(500).json({ error: 'Failed to add past activity' });
    }
};