// src/components/ActivityComparison.jsx
import React, { useRef } from 'react';

const ActivityComparison = ({ compareActivities, setCompareActivities, setShowCompareCounter }) => {
  const compareRef = useRef(null); // Keep the ref here for scrolling

  // Ensure scroll happens when activities are updated (e.g., from parent)
  // This useEffect will trigger a scroll if compareActivities changes to 2 items
  React.useEffect(() => {
    if (compareActivities.length === 2) {
      setTimeout(() => {
        compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [compareActivities]);

  if (compareActivities.length === 0) {
    return null; // Don't render anything if no activities are selected for comparison
  }

  return (
    <>
      {/* Floating comparison counter - moved here */}
      {compareActivities.length < 2 && compareActivities.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
          Select {2 - compareActivities.length} more activity to compare
        </div>
      )}

      {compareActivities.length === 2 && (
        <div ref={compareRef} className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg shadow">
          <h3 className="text-xl font-bold text-emerald-800 mb-4 text-center">Activity Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {compareActivities.map((activity) => (
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
                  {(activity['Skills supported'] || activity.skills_supported || []).join(', ') || <span className="text-gray-400">N/A</span>}
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
            className="mt-6 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded block mx-auto"
            onClick={() => {
              setCompareActivities([]);
              setShowCompareCounter(false);
            }}
          >
            Clear Comparison
          </button>
        </div>
      )}
    </>
  );
};

export default ActivityComparison;