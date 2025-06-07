import React, { useState } from 'react';
import axios from '../utils/axios'; // adjust the path if needed
import ReactMarkdown from 'react-markdown';
import promptTemplates from './PromptInstructions.json'


const ActivitySuggestions = ({ student }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [previousSuggestions, setPreviousSuggestions] = useState([]);


  // The buildPrompt function now only structures the *student data*
  // The AI instructions will be added on the backend.
  const buildPrompt = () => {
    return {
      id: student._id,
      toddler_id: `toddler_${student._id}`,
      toddler_description: student.toddler_description,
      name: student.name,
      age_months: student.age_months,
      personality: student.personality || 'unknown',
      developmental_stage: student.developmental_stage,
      recent_activity: {
        name: student.recent_activity.name || 'unknown',
        result: student.recent_activity.result || 'unknown',
        difficulty_level: student.recent_activity.difficulty_level || 'unknown',
        observations: student.recent_activity.observations || 'unknown',
      },
      interests: student.interests || [], // Send as array, not stringified yet
      preferred_learning_style: student.preferred_learning_style || 'unknown', // Send as is
      social_behavior: student.social_behavior || 'unknown',
      energy_level: student.energy_level || 'unknown',
      goals: student.goals || [], // Send as array
      activity_history: student.activity_history || [], // Send as array
    };
  };

  // Update the handleGenerate function
  const handleGenerate = async () => {
    setLoading(true);
    setCarouselIndex(0);
    setSaveStatus(''); // Clear save status when regenerating

    const studentData = buildPromptData();
    // Extract titles from last generated activities for exclusion
    const excludeTitles = lastGeneratedActivities.map(act => act['Title of Activity'] || act.title).filter(Boolean);

    try {
      const res = await axios.post('/generate', {
        studentData: studentData, // Send the student data object
        excludeActivities: excludeTitles // Send the list of titles to exclude
      });

      const incomingCarouselArray = getCarouselArray(res.data.response);

      if (incomingCarouselArray) {
        setResponse(incomingCarouselArray);
        // Store the *full* generated activities for future exclusion
        setLastGeneratedActivities(incomingCarouselArray);
      } else {
        setResponse("Error: Model did not return valid activity suggestions.");
      }

    } catch (err) {
      console.error("Error generating activities:", err);
      setResponse("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActivity = async () => {
    setSaveStatus('');
    const raw = carouselArray[carouselIndex];
    const activity = {
      title: raw['Title of Activity'] || raw.title || '',
      why_it_works: raw['Why it works'] || raw.why_it_works || '',
      skills_supported: raw['Skills supported'] || raw.skills_supported || '',
      date: new Date().toISOString(),
      notes: raw['Notes'] || raw.notes || '',
    };
    console.log('Saving activity:', activity); // Log activity before saving
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/students/${student._id}/activity`,
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
      const token2 = localStorage.getItem('token');
      const res = await axios.get(`/students/${student._id}`, { headers: { Authorization: `Bearer ${token2}` } });
      console.log('Student activity_history:', res.data.activity_history);
    } catch (err) {
      setSaveStatus('Failed to save activity.');
      setTimeout(() => setSaveStatus(''), 5000); // Hide after 5 seconds
    }
  };

  // Check if recent_activity is present and filled
  const hasRecentActivity = student.recent_activity &&
    student.recent_activity.name &&
    student.recent_activity.result &&
    student.recent_activity.difficulty_level &&
    student.recent_activity.observations;

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
          <div className="flex gap-2">
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Suggest Activities'}
            </button>
            {previousSuggestions.length > 0 && (
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={resetSuggestions}
              >
                Reset Suggestions
              </button>
            )}
          </div>
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
                    <span className="font-semibold">Skills supported:</span> {carouselArray[carouselIndex]['Skills supported'] || carouselArray[carouselIndex].skills_supported}
                  </div>
                  <button
                    className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition"
                    onClick={handleSaveActivity}
                  >
                    Save Activity
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
