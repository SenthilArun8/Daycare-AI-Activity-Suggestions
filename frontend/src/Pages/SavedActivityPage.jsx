import React, { useEffect, useState, useRef } from 'react';
import axios from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';

const SavedActivityPage = () => {
  const { id } = useParams(); // student id
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  const [compareActivities, setCompareActivities] = useState([]);
  const [showCompareCounter, setShowCompareCounter] = useState(false);
  const compareRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(res.data);
      } catch (err) {
        setError('Failed to load activities.');
      }
      setLoading(false);
    };
    fetchStudent();
  }, [id]);
  const handleCompare = (activity) => {
    setCompareActivities(prev => {
      let newActivities;
      // If already selected, remove it
      if (prev.some(a => a._id === activity._id)) {
        newActivities = prev.filter(a => a._id !== activity._id);
      } else {
        // Only allow two activities to be compared
        if (prev.length === 2) {
          newActivities = [prev[1], activity];
        } else {
          newActivities = [...prev, activity];
        }
      }
      
      // Show counter when adding first item
      if (newActivities.length === 1) {
        setShowCompareCounter(true);
      }
      
      // Scroll to comparison section when second item is added
      if (newActivities.length === 2) {
        setTimeout(() => {
          compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      
      return newActivities;
    });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!student) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-800">Saved Activities for {student.name}</h2>
      {student.activity_history && student.activity_history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {student.activity_history.map((activity, idx) => (
            <div
              key={activity._id || Math.random()}
              className="border rounded-lg p-6 bg-gray-50 shadow transition hover:shadow-lg flex flex-col justify-between h-full relative"
            >
              {/* Delete icon button at top right */}
              {activity._id && (
                <button
                  className="absolute top-2 right-2 p-2 border border-transparent bg-transparent text-gray-400 rounded-full hover:bg-red-600 hover:text-white hover:border-red-600 z-10 transition-colors duration-200"
                  title="Delete Activity"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.delete(`/api/students/${student._id}/activity/${activity._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setStudent(prev => ({
                        ...prev,
                        activity_history: prev.activity_history.filter((a) => a._id && a._id.toString() !== activity._id.toString())
                      }));
                    } catch (err) {
                      alert('Failed to delete activity.');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              )}
              <div>
                <div className="font-semibold text-lg mb-2 text-emerald-900">
                  {activity['Title of Activity'] || activity.title || `Activity`}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Why it works:</span>{' '}
                  {activity['Why it works'] || activity.why_it_works || <span className="text-gray-400">N/A</span>}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Skills supported:</span>{' '}
                  {activity['Skills supported'] || activity.skills_supported || <span className="text-gray-400">N/A</span>}
                </div>
                {activity.date && (
                  <div className="text-xs text-gray-500 mb-1">
                    Saved: {new Date(activity.date).toLocaleString()}
                  </div>
                )}
                {activity.notes && (
                  <div className="text-xs text-gray-500 mb-1">
                    Notes: {activity.notes}
                  </div>
                )}                {/* Compare button at the bottom */}
                <button
                  className={`mt-4 px-3 py-2 ${
                    compareActivities.some(a => a._id === activity._id)
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white rounded w-full flex items-center justify-center gap-2`}
                  onClick={() => handleCompare(activity)}
                >
                  {compareActivities.some(a => a._id === activity._id) ? (
                    <>
                      Selected
                      <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">
                        {compareActivities.findIndex(a => a._id === activity._id) + 1}
                      </span>
                    </>
                  ) : (
                    'Compare'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-600">No activities saved yet.</div>
      )}      {/* Floating comparison counter */}
      {showCompareCounter && compareActivities.length < 2 && compareActivities.length > 1 (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
          Select {2 - compareActivities.length} more activity to compare
        </div>
      )}
      
      {compareActivities.length === 2 && (
        <div ref={compareRef} className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg shadow">
          <h3 className="text-xl font-bold text-emerald-800 mb-4 text-center">Activity Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {compareActivities.map((activity, idx) => (
              <div key={activity._id} className="border rounded-lg p-4 bg-white shadow flex flex-col">
                <div className="font-semibold text-lg mb-2 text-emerald-900">
                  {activity['Title of Activity'] || activity.title || `Activity`}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Why it works:</span>{' '}
                  {activity['Why it works'] || activity.why_it_works || <span className="text-gray-400">N/A</span>}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Skills supported:</span>{' '}
                  {activity['Skills supported'] || activity.skills_supported || <span className="text-gray-400">N/A</span>}
                </div>
                {activity.date && (
                  <div className="text-xs text-gray-500 mb-1">
                    Saved: {new Date(activity.date).toLocaleString()}
                  </div>
                )}
                {activity.notes && (
                  <div className="text-xs text-gray-500 mb-1">
                    Notes: {activity.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="mt-6 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded block mx-auto"            onClick={() => {
              setCompareActivities([]);
              setShowCompareCounter(false);
            }}
          >
            Clear Comparison
          </button>
        </div>
      )}
      <button
        className="mt-8 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded"
        onClick={() => navigate('/students')}
      >
        Back
      </button>
    </div>
  );
};

export default SavedActivityPage;
