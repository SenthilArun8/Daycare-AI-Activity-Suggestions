import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../contexts/UserContext';

const AddStudentPage = ({addStudentSubmit}) => {

    const [toddlerId, setToddlerId] = useState('');
    const [toddlerDescription, setToddlerDescription] = useState('');
    const [name, setName] = useState('');
    const [ageMonths, setAgeMonths] = useState('');
    const [gender, setGender] = useState('');
    const [personality, setPersonality] = useState('');
    const [developmentalStage, setDevelopmentalStage] = useState('');
    const [recentActivity, setRecentActivity] = useState({
        name: '',
        result: '',
        difficulty_level: '',
        observations: ''
    });
    const [interests, setInterests] = useState([]);
    const [preferredLearningStyle, setPreferredLearningStyle] = useState('');
    const [socialBehavior, setSocialBehavior] = useState('');
    const [energyLevel, setEnergyLevel] = useState('');
    const [dailyRoutineNotes, setDailyRoutineNotes] = useState('');
    const [goals, setGoals] = useState([]);
    const [activityHistory, setActivityHistory] = useState([
      {
        name: '',
        result: '',
        difficulty_level: '',
        date: '',
        notes: ''
      }
    ]);

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();

    const generatedId = uuidv4();
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please log in first');
      return;
    }

    const userId = JSON.parse(atob(token.split('.')[1])).id;

    const newStudent = {
      toddler_id: generatedId,
      toddler_description: toddlerDescription,
      name,
      age_months: ageMonths,
      gender,
      personality,
      developmental_stage: developmentalStage,
      recent_activity: {
        name: recentActivity.name,
        result: recentActivity.result,
        difficulty_level: recentActivity.difficulty_level,
        observations: recentActivity.observations
      },
      interests,
      preferred_learning_style: preferredLearningStyle,
      social_behavior: socialBehavior,
      energy_level: energyLevel,
      daily_routine_notes: dailyRoutineNotes,
      goals,
      activity_history: activityHistory,
      userId: userId,  
    };

    addStudentSubmit(newStudent)
      .then(() => {
        toast.success('Student added successfully!');
        navigate('/students');
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
      });

    return navigate('/students');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6] py-12">
      <div className="w-full max-w-2xl p-8 backdrop-blur-md bg-white/70 rounded-xl shadow-lg">
        {/* Top padding before form */}
        <div className="py-4" />
        <form onSubmit={submitForm}>
          <h2 className="text-3xl text-center font-bold text-emerald-800 mb-8">Add Toddler Activity Profile</h2>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Name</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. Sofia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Age (in months)</label>
            <input
              type="number"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. 36"
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Gender</label>
            <select
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Toddler Description</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. Calm and observant, communicates clearly in full sentences"
              value={toddlerDescription}
              onChange={(e) => setToddlerDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Personality</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. thoughtful, patient, enjoys quiet play"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Developmental Stage</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. expanding vocabulary, shows empathy, beginning to ask 'why' questions"
              value={developmentalStage}
              onChange={(e) => setDevelopmentalStage(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Preferred Learning Style</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. visual and auditory"
              value={preferredLearningStyle}
              onChange={(e) => setPreferredLearningStyle(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Social Behavior</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. prefers small groups, shy with new children"
              value={socialBehavior}
              onChange={(e) => setSocialBehavior(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Energy Level</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. low to moderate"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Daily Routine Notes</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. likes morning storytime, quiet rest time after lunch"
              value={dailyRoutineNotes}
              onChange={(e) => setDailyRoutineNotes(e.target.value)}
            />
          </div>

          {/* Interests */}
          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Interests (comma-separated)</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. books, drawing, nature"
              value={interests.join(', ')}
              onChange={(e) => setInterests(e.target.value.split(',').map(s => s.trim()))}
            />
          </div>

          {/* Goals */}
          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Goals (comma-separated)</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. foster creative expression, encourage social confidence"
              value={goals.join(', ')}
              onChange={(e) => setGoals(e.target.value.split(',').map(s => s.trim()))}
            />
          </div>

          {/* Recent Activity */}
          <h3 className="text-2xl mt-6 mb-2 text-emerald-800">Recent Activity</h3>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Activity Name</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. storytime circle"
              value={recentActivity.name}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Result</label>
            <select
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={recentActivity.result}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, result: e.target.value })
              }
            >
              <option value="">Select result</option>
              <option value="succeeded">Succeeded</option>
              <option value="needs improvement">Needs Improvement</option>
              <option value="not consistent">Not Consistent</option>
              <option value="failed">Struggled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Difficulty Level</label>
            <select
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={recentActivity.difficulty_level}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, difficulty_level: e.target.value })
              }
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Observations</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. remained attentive throughout and asked questions about the story"
              value={recentActivity.observations}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, observations: e.target.value })
              }
            />
          </div>

          <div>
            <button
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Save Toddler Profile
            </button>
          </div>
        </form>
        {/* Bottom padding after form */}
        <div className="py-4" />
      </div>
    </div>
  )
}

export default AddStudentPage