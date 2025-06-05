import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';


const ActivitySuggestions = ({ student }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  const buildPrompt = () => {
    return `{
  "id": "${student._id}",
  "toddler_id": "toddler_${student._id}",
  "toddler_description": "${student.toddler_description}",
  "name": "${student.name}",
  "age_months": ${student.age_months},
  "gender": "${student.gender}",
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
  "daily_routine_notes": "${student.daily_routine_notes || 'unknown'}",
  "goals": "${JSON.stringify(student.goals || [])}",
  "activity_history": "${JSON.stringify(student.activity_history || [])}"
}

If the toddler failed the activity, provide 5 diverse activity options that support success in the same area. If they succeeded then provide 5 diverse activity options to grow and develop the necessary skills depending on their developmental stage, goals, and other appropriate considerations. Ensure suggestions vary and match developmental needs. Avoid using the term "parents" or any other term that specifies the user's role. Use more general language to be inclusive of educators and other users. Only provide these three for each activity: Title of Activity, Why it works, Skills supported. Give the response in JSON format. Do not include any other text or explanations.`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setCarouselIndex(0); // Reset to first activity when generating new suggestions
    try {
      const res = await axios.post('/api/generate', {
        prompt: buildPrompt()
      });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("Error: " + err.message);
    }
    setLoading(false);
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
        `/api/students/${student._id}/activity`,
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
      const res = await axios.get(`/api/students/${student._id}`, { headers: { Authorization: `Bearer ${token2}` } });
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
