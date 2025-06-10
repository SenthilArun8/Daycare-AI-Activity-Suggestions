import React, { useState } from 'react';
import axios from '../utils/axios'; // adjust the path if needed
import ReactMarkdown from 'react-markdown';
import axiosInstance from '../utils/axios';
import { useUser } from '../contexts/UserContext';


const ActivitySuggestions = ({ student }) => {
  // Hooks
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const { token } = useUser();
  // Track previous prompt and activities for efficient follow-up
  const [previousPrompt, setPreviousPrompt] = useState(null);
  const [previousActivities, setPreviousActivities] = useState([]);

  const buildPrompt = () => {
    return `{
  "toddler_description": "${student.toddler_description}",
  "name": "${student.name}",
  "age_months": ${student.age_months},
  "personality": "${student.personality || 'unknown'}",
  "developmental_stage": "${student.developmental_stage}",
  "recent_activity": {
    "name": "${student.recent_activity.name || 'unknown'}",
    "result": "${student.recent_activity.result || 'unknown'}",   
    "difficulty_level": "${student.recent_activity.difficulty_level || 'unknown'}",
    "observations": "${student.recent_activity.observations || 'unknown'}"
  },
  "interests": "${JSON.stringify(student.interests || [])}",
  "preferred_learning_style": "${JSON.stringify(student.preferred_learning_style || 'unknown')}",
  "social_behavior": "${student.social_behavior || 'unknown'}",
  "energy_level": "${student.energy_level || 'unknown'}",
  "goals": "${JSON.stringify(student.goals || [])}",
  "activity_history": "${JSON.stringify(student.activity_history || [])}"
}`

  };

  // Helper to extract array from response if it's an object with a single array property
  const getCarouselArray = (resp) => {
    if (Array.isArray(resp)) return resp;
    if (resp && typeof resp === 'object') {
      const arrKey = Object.keys(resp).find(
        k => Array.isArray(resp[k]) && resp[k].length > 0
      );
      if (arrKey) return resp[arrKey];
    }
    return null;
  };

  const carouselArray = getCarouselArray(response);

  // Helper to extract activity titles from the last response
  const getActivityTitles = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(a => a['Title of Activity'] || a.title || a.name || '').filter(Boolean);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setCarouselIndex(0); // Reset to first activity when generating new suggestions
    let promptToSend = '';
    let discardedActivities = [];
    // If this is the first time or student changed, use full prompt
    if (!previousPrompt || previousPrompt.studentId !== student._id) {
      promptToSend = buildPrompt();
      setPreviousPrompt({ studentId: student._id, prompt: promptToSend });
      setPreviousActivities([]);
    } else {
      // On subsequent clicks, only send a short prompt and the previous activities,
      // but also include the original recent_activity context for the AI
      const prevTitles = getActivityTitles(previousActivities.length ? previousActivities : carouselArray);
      promptToSend = `With the same instructions and the same recent_activity as before, give me some more activity suggestions. Do not repeat any of these: ${prevTitles.join(', ')}.`;
      discardedActivities = prevTitles;
    }
    try {
      const res = await axiosInstance.post('/ai/generate', {
        prompt: promptToSend,
        discardedActivities
      });
      setResponse(res.data.response);
      // Save the activities for next time
      const arr = getCarouselArray(res.data.response);
      setPreviousActivities(arr || []);
    } catch (err) {
      setResponse("Error: " + err.message);
    }
    setLoading(false);
  };

  // Helper: Normalize skills_supported to array of { name, category }
  const normalizeSkills = (skills) => {
    if (!skills) return [];
    let arr = [];
    if (Array.isArray(skills)) {
      arr = skills.map(s => {
        if (typeof s === 'object' && s !== null) {
          const name = typeof s.name === 'string' ? s.name.trim() : '';
          const category = typeof s.category === 'string' ? s.category.trim() : '';
          if (name && category) return { name, category };
          return null;
        }
        if (typeof s === 'string') {
          const [category, ...rest] = s.split(':');
          if (rest.length > 0) {
            const name = rest.join(':').trim();
            if (name && category.trim()) return { name, category: category.trim() };
          }
          if (s.trim()) return { name: s.trim(), category: 'Other' };
        }
        return null;
      });
    } else if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        return normalizeSkills(parsed);
      } catch {
        if (skills.trim()) return [{ name: skills.trim(), category: 'Other' }];
      }
    }
    // Only return valid objects
    return arr.filter(s => s && typeof s.name === 'string' && typeof s.category === 'string' && s.name && s.category);
  };

  // Color map for skill categories (expanded for all possible categories)
  const skillCategoryColors = {
    'Cognitive': 'bg-blue-200 text-blue-800',
    'Fine Motor': 'bg-green-200 text-green-800',
    'Gross Motor': 'bg-yellow-200 text-yellow-800',
    'Language': 'bg-purple-200 text-purple-800',
    'Social-Emotional': 'bg-pink-200 text-pink-800',
    'Creative': 'bg-orange-200 text-orange-800',
    'Other': 'bg-gray-200 text-gray-800',
    // For legacy/AI categories (fallbacks)
    'Social-Emotional Skills': 'bg-yellow-300 text-yellow-900',
    'Cognitive Skills': 'bg-blue-400 text-blue-900',
    'Literacy Skills': 'bg-green-700 text-green-100',
    'Physical Skills': 'bg-orange-400 text-orange-900',
    'Creative Arts/Expression Skills': 'bg-purple-500 text-white',
    'Language and Communication Skills': 'bg-sky-300 text-sky-900',
    'Self-Help/Adaptive Skills': 'bg-amber-800 text-amber-100',
    'Problem-Solving Skills': 'bg-lime-400 text-lime-900',
    'Sensory Processing Skills': 'bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-400 text-white',
  };

  // Block save/discard for sample students, but allow generating
  const isSampleStudent = student && (student._id === '683d57f853223cfb0c1e5723' || student._id === '683d590053223cfb0c1e5724');

  // Handle Functions 
  const handleSaveActivity = async () => {
    setSaveStatus('');
    const raw = carouselArray[carouselIndex];
    const skills = normalizeSkills(raw['Skills supported'] || raw.skills_supported);
    if (!skills.length) {
      setSaveStatus('Cannot save: No valid skills supported for this activity.');
      setTimeout(() => setSaveStatus(''), 5000);
      return;
    }
    const activity = {
      title: raw['Title of Activity'] || raw.title || '',
      why_it_works: raw['Why it works'] || raw.why_it_works || '',
      skills_supported: skills,
      date: new Date().toISOString(),
      notes: raw['Notes'] || raw.notes || '',
    };
    console.log('Saving activity:', activity); // Log activity before saving
    try {
      await axiosInstance.post(
        `/students/${student._id}/saved-activity`,
        { activity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus('Activity saved!');
      setTimeout(() => setSaveStatus(''), 3000); // Hide after 3 seconds
      // Remove the saved activity from the carousel
      if (carouselArray.length > 1) {
        const newArray = [...carouselArray];
        newArray.splice(carouselIndex, 1);
        setResponse(Array.isArray(response) ? newArray : { ...response, [Object.keys(response)[0]]: newArray });
        setCarouselIndex(i => Math.min(i, newArray.length - 1));
      } else {
        setResponse('');
        setCarouselIndex(0);
      }
      // Fetch and log all activities for this student after saving
      const res = await axiosInstance.get(`/students/${student._id}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Student activity_history:', res.data.activity_history);
    } catch (err) {
      const backendMsg = err.response?.data?.error || err.message;
      setSaveStatus('Failed to save activity: ' + backendMsg);
      setTimeout(() => setSaveStatus(''), 7000); // Hide after 7 seconds
    }
  };

  // Handle Discard Function
  const handleDiscardActivity = async () => {
    setSaveStatus('');
    const raw = carouselArray[carouselIndex];
    const skills = normalizeSkills(raw['Skills supported'] || raw.skills_supported);
    if (!skills.length) {
      setSaveStatus('Cannot discard: No valid skills supported for this activity.');
      setTimeout(() => setSaveStatus(''), 5000);
      return;
    }
    const activity = {
      title: raw['Title of Activity'] || raw.title || '',
      why_it_works: raw['Why it works'] || raw.why_it_works || '',
      skills_supported: skills,
      date: new Date().toISOString(),
      notes: raw['Notes'] || raw.notes || '',
    };
    try {
      await axiosInstance.post(
        `/students/${student._id}/discarded-activity`,
        { activity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus('Activity discarded!');
      setTimeout(() => setSaveStatus(''), 3000);
      // Remove the discarded activity from the carousel
      if (carouselArray.length > 1) {
        const newArray = [...carouselArray];
        newArray.splice(carouselIndex, 1);
        setResponse(Array.isArray(response) ? newArray : { ...response, [Object.keys(response)[0]]: newArray });
        setCarouselIndex(i => Math.min(i, newArray.length - 1));
      } else {
        setResponse('');
        setCarouselIndex(0);
      }
    } catch (err) {
      const backendMsg = err.response?.data?.error || err.message;
      setSaveStatus('Failed to discard activity: ' + backendMsg);
      setTimeout(() => setSaveStatus(''), 7000);
    }
  };

  // Check if recent_activity is present and filled
  const hasRecentActivity = student.recent_activity &&
    student.recent_activity.name &&
    student.recent_activity.result &&
    student.recent_activity.difficulty_level &&
    student.recent_activity.observations;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4">AI Activity Suggestions for {student.name} </h3>
      {!hasRecentActivity ? (
        <>
          <div className="mb-4 text-amber-700 bg-amber-100 border border-amber-300 rounded p-4">
            No recent activity found for this student.<br />
            Please <b>add a recent activity</b> by editing the student profile before generating suggestions.
          </div>
          <a
            href={`/edit-student/${student._id}#recent-activity`}
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded mb-2 transition"
          >
            Add Recent Activity
          </a>
        </>
      ) : (
        <>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Suggest Activities'}
          </button>
          {carouselArray ? (
            <div className="mt-4 border p-4 bg-gray-50 rounded relative flex flex-col items-center">
              <div className="w-full max-w-md">
                <div className="border rounded-lg p-4 bg-white shadow">
                  <div className="font-bold text-lg mb-2">
                    {carouselArray[carouselIndex]['Title of Activity'] || carouselArray[carouselIndex].title}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Why it works:</span> {carouselArray[carouselIndex]['Why it works'] || carouselArray[carouselIndex].why_it_works}
                  </div>
                  <div className="mb-1">
                   <span className="font-semibold">Skills supported:</span>{' '}
                   <span className="flex flex-wrap gap-2 mt-1">
                     {normalizeSkills(carouselArray[carouselIndex]['Skills supported'] || carouselArray[carouselIndex].skills_supported).map((skill, idx) => {
                       // Support both string and object skill formats
                       let skillName = skill.name || skill;
                       let skillCategory = skill.category || skill;
                       // If skill is a string, try to split by colon
                       if (!skill.name && typeof skill === 'string' && skill.includes(':')) {
                         const [cat, ...rest] = skill.split(':');
                         skillCategory = cat.trim();
                         skillName = rest.join(':').trim();
                       }
                       return (
                         <span
                           key={idx}
                           className={`px-2 py-1 rounded text-xs font-semibold mr-1 mb-1 ${skillCategoryColors[skillCategory] || skillCategoryColors['Other']}`}
                           style={skillCategory === 'Sensory Processing Skills' ? {
                             background: 'linear-gradient(90deg, #f472b6 0%, #fde68a 50%, #60a5fa 100%)',
                             color: '#fff',
                           } : {}}
                         >
                           {skillName} <span className="opacity-60">({skillCategory})</span>
                         </span>
                       );
                     })}
                   </span>
                 </div>
                  <button
                    className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition"
                    onClick={handleSaveActivity}
                    disabled={isSampleStudent}
                  >
                    Save Activity
                  </button>
                  <button
                    className="mt-4 ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                    type="button"
                    onClick={handleDiscardActivity}
                    disabled={isSampleStudent}
                  >
                    Discard
                  </button>
                  {/* {saveStatus && (
                    <div className={`mt-2 text-sm ${saveStatus.includes('saved') ? 'text-emerald-700' : 'text-red-600'}`}>{saveStatus}</div>
                  )} */}
                  {saveStatus && (
                    <div className={`mt-2 text-sm ${saveStatus.includes('saved') ? 'text-emerald-700' : 'text-red-600'}`}>{saveStatus}</div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    className="px-3 py-1 bg-emerald-600 text-white rounded disabled:opacity-50"
                    onClick={() => setCarouselIndex(i => Math.max(i - 1, 0))}
                    disabled={carouselIndex === 0}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">{carouselIndex + 1} / {carouselArray.length}</span>
                  <button
                    className="px-3 py-1 bg-emerald-600 text-white rounded disabled:opacity-50"
                    onClick={() => setCarouselIndex(i => Math.min(i + 1, carouselArray.length - 1))}
                    disabled={carouselIndex === carouselArray.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : response ? (
            <div className="mt-4 whitespace-pre-wrap text-gray-700 border p-4 bg-gray-50 rounded">
              <pre>{typeof response === 'string' ? response : JSON.stringify(response, null, 2)}</pre>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ActivitySuggestions;