import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import { useUser } from '../contexts/UserContext';

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useUser();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({
    toddlerDescription: '',
    name: '',
    ageMonths: '',
    personality: '',
    developmentalStage: '',
    recentActivity: {
      name: '',
      result: '',
      difficulty_level: '',
      observations: ''
    },
    interests: [],
    preferredLearningStyle: '',
    socialBehavior: '',
    energyLevel: '',
    goals: [],
    activityHistory: [
      {
        name: '',
        result: '',
        difficulty_level: '',
        date: '',
        notes: ''
      }
    ]
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axiosInstance.get(`/students/${id}`);
        setStudent(res.data);
        setForm({
          toddlerDescription: res.data.toddler_description || '',
          name: res.data.name || '',
          ageMonths: res.data.age_months || '',
          personality: res.data.personality || '',
          developmentalStage: res.data.developmental_stage || '',
          recentActivity: {
            name: res.data.recent_activity?.name || '',
            result: res.data.recent_activity?.result || '',
            difficulty_level: res.data.recent_activity?.difficulty_level || '',
            observations: res.data.recent_activity?.observations || ''
          },
          interests: res.data.interests || [],
          preferredLearningStyle: res.data.preferred_learning_style || '',
          socialBehavior: res.data.social_behavior || '',
          energyLevel: res.data.energy_level || '',
          goals: res.data.goals || [],
          activityHistory: res.data.activity_history || [{ name: '', result: '', difficulty_level: '', date: '', notes: '' }]
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student:', err);
        toast.error('Failed to fetch student data');
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRecentActivityChange = (e) => {
    setForm({
      ...form,
      recentActivity: {
        ...form.recentActivity,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleArrayChange = (e, key) => {
    setForm({ ...form, [key]: e.target.value.split(',').map(s => s.trim()) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `/students/${id}`,
        {
          toddler_description: form.toddlerDescription,
          name: form.name,
          age_months: form.ageMonths,
          personality: form.personality,
          developmental_stage: form.developmentalStage,
          recent_activity: form.recentActivity,
          interests: form.interests,
          preferred_learning_style: form.preferredLearningStyle,
          social_behavior: form.socialBehavior,
          energy_level: form.energyLevel,
          goals: form.goals,
          activity_history: form.activityHistory
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Student updated successfully!');
      navigate(`/students/${id}`);
    } catch (err) {
      toast.error('Error updating student');
    }
  };

  // Add scroll-into-view effect for hash navigation
  useEffect(() => {
    // Only run if hash is present
    if (window.location.hash === '#recent-activity') {
      // Wait for the DOM to be fully rendered
      setTimeout(() => {
        const el = document.getElementById('recent-activity');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus({ preventScroll: true });
          // Remove the hash from the URL after scrolling (optional UX improvement)
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }, 300); // Increased delay to ensure render after navigation
    }
  }, [loading]);

  const isSampleStudent = id === '683d57f853223cfb0c1e5723' || id === '683d590053223cfb0c1e5724';

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!student) return <div className="text-center py-10">Student not found</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6] py-12">
      <div className="w-full max-w-2xl p-8 backdrop-blur-md bg-white/70 rounded-xl shadow-lg">
        <div className="py-4" />
        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl text-center font-bold text-emerald-800 mb-8">Edit Toddler Activity Profile</h2>
          {isSampleStudent && (
            <div className="mb-4 text-amber-700 bg-amber-100 border border-amber-300 rounded p-4 text-center">
              Editing is disabled for sample students.
            </div>
          )}

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Name</label>
            <input
              type="text"
              name="name"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Sofia"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Age (in months)</label>
            <input
              type="number"
              name="ageMonths"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.ageMonths}
              onChange={handleChange}
              required
              placeholder="e.g. 36"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Toddler Description</label>
            <textarea
              name="toddlerDescription"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.toddlerDescription}
              onChange={handleChange}
              placeholder="e.g. Calm and observant, communicates clearly in full sentences"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Personality</label>
            <input
              type="text"
              name="personality"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.personality}
              onChange={handleChange}
              placeholder="e.g. thoughtful, patient, enjoys quiet play"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Developmental Stage</label>
            <textarea
              name="developmentalStage"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.developmentalStage}
              onChange={handleChange}
              placeholder="e.g. expanding vocabulary, shows empathy, beginning to ask 'why' questions"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Preferred Learning Style</label>
            <input
              type="text"
              name="preferredLearningStyle"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.preferredLearningStyle}
              onChange={handleChange}
              placeholder="e.g. visual and auditory"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Social Behavior</label>
            <input
              type="text"
              name="socialBehavior"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.socialBehavior}
              onChange={handleChange}
              placeholder="e.g. prefers small groups, shy with new children"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Energy Level</label>
            <input
              type="text"
              name="energyLevel"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.energyLevel}
              onChange={handleChange}
              placeholder="e.g. low to moderate"
              disabled={isSampleStudent}
            />
          </div>

          {/* Interests */}
          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Interests (comma-separated)</label>
            <input
              type="text"
              name="interests"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.interests.join(', ')}
              onChange={(e) => handleArrayChange(e, 'interests')}
              placeholder="e.g. books, drawing, nature"
              disabled={isSampleStudent}
            />
          </div>

          {/* Goals */}
          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Goals (comma-separated)</label>
            <input
              type="text"
              name="goals"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.goals.join(', ')}
              onChange={(e) => handleArrayChange(e, 'goals')}
              placeholder="e.g. foster creative expression, encourage social confidence"
              disabled={isSampleStudent}
            />
          </div>

          {/* Recent Activity */}
          <h3 id="recent-activity" tabIndex="-1" className="text-2xl mt-6 mb-2 text-emerald-800">Recent Activity</h3>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Activity Name</label>
            <input
              type="text"
              name="name"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.recentActivity.name}
              onChange={handleRecentActivityChange}
              placeholder="e.g. storytime circle"
              disabled={isSampleStudent}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Result</label>
            <select
              name="result"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.recentActivity.result}
              onChange={handleRecentActivityChange}
              disabled={isSampleStudent}
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
              name="difficulty_level"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.recentActivity.difficulty_level}
              onChange={handleRecentActivityChange}
              disabled={isSampleStudent}
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
              name="observations"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.recentActivity.observations}
              onChange={handleRecentActivityChange}
              placeholder="e.g. remained attentive throughout and asked questions about the story"
              disabled={isSampleStudent}
            />
          </div>

          <div>
            <button
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isSampleStudent}
            >
              Save Changes
            </button>
          </div>
        </form>
        <div className="py-4" />
      </div>
    </div>
  );
};

export default EditStudentPage;