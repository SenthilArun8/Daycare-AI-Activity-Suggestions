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
                  <span className="flex flex-wrap gap-2 mt-1">
                    {(() => {
                      // Normalize skills to array of { name, category }
                      let skills = activity['Skills supported'] || activity.skills_supported || [];
                      if (typeof skills === 'string') {
                        try { skills = JSON.parse(skills); } catch { skills = [skills]; }
                      }
                      if (Array.isArray(skills) && skills.length > 0 && typeof skills[0] === 'object' && skills[0] !== null && skills[0].name && skills[0].category) {
                        return skills.map((skill, sidx) => (
                          <span
                            key={sidx}
                            className={`px-2 py-1 rounded text-xs font-semibold mr-1 mb-1 ${skillCategoryColors[skill.category] || skillCategoryColors['Other']}`}
                            style={skill.category === 'Sensory Processing Skills' ? {
                              background: 'linear-gradient(90deg, #f472b6 0%, #fde68a 50%, #60a5fa 100%)',
                              color: '#fff',
                            } : {}}
                          >
                            {skill.name} <span className="opacity-60">({skill.category})</span>
                          </span>
                        ));
                      }
                      if (Array.isArray(skills) && typeof skills[0] === 'string') {
                        return skills.map((name, sidx) => (
                          <span key={sidx} className="px-2 py-1 rounded text-xs font-semibold mr-1 mb-1 bg-gray-200 text-gray-800">
                            {name}
                          </span>
                        ));
                      }
                      return <span className="text-gray-400">N/A</span>;
                    })()}
                  </span>
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
          {/* Venn Diagram for Skills Supported */}
          <div className="flex flex-col items-center my-8">
            <h4 className="text-lg font-semibold text-emerald-700 mb-2">Skills Supported Venn Diagram</h4>
            {(() => {
              // Get normalized skill names for both activities
              const getSkillNames = (activity) => {
                let skills = activity['Skills supported'] || activity.skills_supported || [];
                if (typeof skills === 'string') {
                  try { skills = JSON.parse(skills); } catch { skills = [skills]; }
                }
                if (Array.isArray(skills) && skills.length > 0 && typeof skills[0] === 'object' && skills[0] !== null && skills[0].name) {
                  return skills.map(s => s.name);
                }
                if (Array.isArray(skills) && typeof skills[0] === 'string') {
                  return skills;
                }
                return [];
              };
              const [a1, a2] = compareActivities;
              const a1Skills = new Set(getSkillNames(a1));
              const a2Skills = new Set(getSkillNames(a2));
              const onlyA1 = [...a1Skills].filter(x => !a2Skills.has(x));
              const onlyA2 = [...a2Skills].filter(x => !a1Skills.has(x));
              const both = [...a1Skills].filter(x => a2Skills.has(x));
              return (
                <>
                  <div className="relative flex items-center justify-center w-full max-w-xl h-48 mb-4 sm:flex-row flex-col sm:h-48 h-[28rem]">
                    {/* Left circle */}
                    <div className="absolute sm:left-12 left-1/2 sm:top-0 top-8 sm:translate-x-0 -translate-x-1/2 sm:w-44 sm:h-44 w-36 h-36 rounded-full bg-emerald-200 opacity-70 flex flex-col items-center justify-center border-2 border-emerald-400" style={{zIndex: 1}}>
                      {onlyA1.length > 0 ? onlyA1.map((s, i) => (
                        <span key={i} className="text-xs text-emerald-800 bg-white/70 rounded px-2 py-0.5 my-0.5 whitespace-nowrap">{s}</span>
                      )) : <span className="text-xs text-gray-400">None</span>}
                    </div>
                    {/* Right circle */}
                    <div className="absolute sm:right-12 left-1/2 sm:top-0 bottom-8 sm:translate-x-0 -translate-x-1/2 sm:w-44 sm:h-44 w-36 h-36 rounded-full bg-indigo-200 opacity-70 flex flex-col items-center justify-center border-2 border-indigo-400" style={{zIndex: 1}}>
                      {onlyA2.length > 0 ? onlyA2.map((s, i) => (
                        <span key={i} className="text-xs text-indigo-800 bg-white/70 rounded px-2 py-0.5 my-0.5 whitespace-nowrap">{s}</span>
                      )) : <span className="text-xs text-gray-400">None</span>}
                    </div>
                    {/* Overlapping area - centered */}
                    <div className="absolute sm:left-1/2 left-1/2 sm:top-0 top-1/2 sm:-translate-x-1/2 -translate-x-1/2 sm:translate-y-0 -translate-y-1/2 sm:w-44 sm:h-44 w-36 h-36 rounded-full bg-yellow-100 opacity-90 flex flex-col items-center justify-center border-2 border-yellow-400" style={{zIndex: 2}}>
                      {both.length > 0 ? both.map((s, i) => (
                        <span key={i} className="text-xs text-yellow-800 bg-white/70 rounded px-2 py-0.5 my-0.5 whitespace-nowrap">{s}</span>
                      )) : <span className="text-xs text-gray-400">None</span>}
                    </div>
                  </div>
                  {/* Legend below the circles */}
                  <div className="flex flex-row items-center justify-center space-x-8 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-4 h-4 rounded-full bg-emerald-200 border-2 border-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-900">{a1['Title of Activity'] || a1.title || 'Activity 1'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-900">Both</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-4 h-4 rounded-full bg-indigo-200 border-2 border-indigo-400" />
                      <span className="text-sm font-semibold text-indigo-900">{a2['Title of Activity'] || a2.title || 'Activity 2'}</span>
                    </div>
                  </div>
                </>
              );
            })()}
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

// Color map for skill categories (copied from SavedActivityPage)
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

export default ActivityComparison;