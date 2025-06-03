import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';


const ActivitySuggestions = ({ student }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const buildPrompt = () => {
    return `{
  "id": "${student.id}",
  "toddler_id": "toddler_${student.id}",
  "toddler_description": "${student.toddler_description}",
  "name": "${student.name}",
  "age_months": ${student.age_months},
  "gender": "${student.gender}",
  "personality": "${student.personality || 'unknown'}",
  "developmental_stage": "${student.developmental_stage}",
  "recent_activity": {
    "name": ${student.recent_activity.name || 'unknown'},
    "result": ${student.recent_activity.result || 'unknown'},   
    "difficulty_level": ${student.recent_activity.difficulty_level || 'unknown'},
    "observations": ${student.recent_activity.observations || 'unknown'}
  },
  "interests": ${JSON.stringify(student.interests || [])},
  "preferred_learning_style": ${JSON.stringify(student.preferred_learning_style || 'hands-on')},
  "social_behavior": "${student.social_behavior || 'unknown'}",
  "energy_level": "${student.energy_level || 'high'}",
  "daily_routine_notes": "${student.daily_routine_notes || 'naps in the afternoon, best mood in the morning'}",
  "goals": ${JSON.stringify(student.goals || [])},
  "activity_history": ${JSON.stringify(student.activity_history || [])}
}

For the activity the toddler failed, provide diverse activity options that support success in the same area. Ensure suggestions vary and match developmental needs.

**Title of Activity**
- ##Why it works##
- ##Skills supported##
`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(' https://daycare-ai-activity-suggestions-backend.onrender.com/generate', {
        prompt: buildPrompt()
      });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    
      
    <div className="bg-white p-6 rounded-lg shadow-md mt-6"> {/* if activity suggestions are created once then store it in mongodb and have it there until the user clicks the button again */ }
      <h3 className="text-xl font-bold mb-4">AI Activity Suggestions for {student.name} </h3> {/* have an update previous activity option here */ }
      <button
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Suggest Activities'}
      </button>
      {response && (
        <div className="mt-4 whitespace-pre-wrap text-gray-700 border p-4 bg-gray-50 rounded">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ActivitySuggestions;
