import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../contexts/UserContext';

const AddStudentPage = ({addStudentSubmit}) => {

    const [interestsInput, setInterestsInput] = useState('');
    const [goalsInput, setGoalsInput] = useState('');
    const [toddlerId, setToddlerId] = useState('');
    const [toddlerDescription, setToddlerDescription] = useState('');
    const [name, setName] = useState('');
    const [ageMonths, setAgeMonths] = useState('');
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

  const { user, token } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not logged in (using UserContext)
  React.useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  const submitForm = (e) => {
    e.preventDefault();

    const generatedId = uuidv4();
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
  }

  const tutorialSteps = [
    { key: 'name', label: 'Name', description: 'Enter the toddler\'s name here.' },
    { key: 'age', label: 'Age (in months)', description: 'Enter the toddler\'s age in months.' },
    { key: 'desc', label: 'Description', description: 'Describe the toddler\'s personality and communication.' },
    { key: 'personality', label: 'Personality', description: 'Describe the toddler\'s personality traits.' },
    { key: 'dev', label: 'Developmental Stage', description: 'Describe the toddler\'s developmental stage.' },
    { key: 'learning', label: 'Preferred Learning Style', description: 'Describe how the toddler learns best.' },
    { key: 'social', label: 'Social Behavior', description: 'Describe the toddler\'s social behavior.' },
    { key: 'energy', label: 'Energy Level', description: 'Describe the toddler\'s energy level.' },
    { key: 'interests', label: 'Interests', description: 'List the toddler\'s interests, please ensure they are inputted with commas.' },
    { key: 'goals', label: 'Goals', description: 'List the goals for the toddler, please ensure they are inputted with commas.' },
    { key: 'activityName', label: 'Recent Activity Name', description: 'Enter the name of the most recent activity.' },
    { key: 'activityResult', label: 'Recent Activity Result', description: 'Select the result of the most recent activity.' },
    { key: 'activityDifficulty', label: 'Recent Activity Difficulty', description: 'Select the difficulty level of the most recent activity.' },
    { key: 'activityObservations', label: 'Recent Activity Observations', description: 'Add any observations for the most recent activity.' },
  ];

  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Add state for "Don't show tutorial again"
  const [dontShowTutorial, setDontShowTutorial] = useState(
    localStorage.getItem('hideAddStudentTutorial') === 'true'
  );

  // Hide tutorial if user chose not to show again
  React.useEffect(() => {
    if (dontShowTutorial) setShowTutorial(false);
  }, [dontShowTutorial]);

  // Update the isSpotlight function
  const isSpotlight = (stepKey) => {
    if (!showTutorial) return false;
    const isCurrentStep = tutorialSteps[tutorialStep].key === stepKey;
    return isCurrentStep;
  };
  const stepKeyToIndex = Object.fromEntries(tutorialSteps.map((step, idx) => [step.key, idx]));

  const handleSpotlightFocus = (stepKey) => {
    if (showTutorial && tutorialStep !== stepKeyToIndex[stepKey]) {
      setTutorialStep(stepKeyToIndex[stepKey]);
    }
  };

  // Handler for "Don't show again"
  const handleDontShowTutorial = () => {
    setDontShowTutorial(true);
    setShowTutorial(false);
    localStorage.setItem('hideAddStudentTutorial', 'true');
  };

  // Handler for scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to render the tutorial tooltip inside the highlighted field
  const TutorialTooltip = ({ step }) => (
    <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full bg-white rounded-lg shadow-lg px-6 py-4 border-2 border-emerald-700 max-w-md text-center z-50">
      <div className="font-bold text-emerald-800 mb-2">{tutorialSteps[step].label}</div>
      <div className="text-emerald-900 mb-4">{tutorialSteps[step].description}</div>
      <div className="flex justify-between">
        <button
          className="px-3 py-1 rounded bg-emerald-200 text-emerald-900 font-semibold disabled:opacity-50"
          onClick={() => setTutorialStep((s) => Math.max(0, s - 1))}
          disabled={tutorialStep === 0}
        >Previous</button>
        {tutorialStep < tutorialSteps.length - 1 ? (
          <button
            className="px-3 py-1 rounded bg-emerald-700 text-white font-semibold"
            onClick={() => setTutorialStep((s) => s + 1)}
          >Next</button>
        ) : (
          <button
            className="px-3 py-1 rounded bg-emerald-700 text-white font-semibold"
            onClick={() => setShowTutorial(false)}
          >Finish</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6] py-12 relative">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-0 z-30 pointer-events-none" />
      )}
      <div className="w-full max-w-2xl p-8 backdrop-blur-md bg-white/70 rounded-xl shadow-lg relative z-20">
        {/* Top padding before form */}
        <div className="py-4" />
        <form onSubmit={submitForm}>
          <h2 className="text-3xl text-center font-bold text-emerald-800 mb-8">Add Toddler Activity Profile</h2>

          <div className={`mb-4 relative ${isSpotlight('name') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Name */}
            {isSpotlight('name') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Name</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. Sofia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              onFocus={() => handleSpotlightFocus('name')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('age') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Age */}
            {isSpotlight('age') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Age (in months)</label>
            <input
              type="number"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. 36"
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
              required
              onFocus={() => handleSpotlightFocus('age')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('desc') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Description */}
            {isSpotlight('desc') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Toddler Description</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. Calm and observant, communicates clearly in full sentences"
              value={toddlerDescription}
              onChange={(e) => setToddlerDescription(e.target.value)}
              onFocus={() => handleSpotlightFocus('desc')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('personality') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Personality */}
            {isSpotlight('personality') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Personality</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. thoughtful, patient, enjoys quiet play"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              onFocus={() => handleSpotlightFocus('personality')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('dev') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Developmental Stage */}
            {isSpotlight('dev') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Developmental Stage</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. expanding vocabulary, shows empathy, beginning to ask 'why' questions"
              value={developmentalStage}
              onChange={(e) => setDevelopmentalStage(e.target.value)}
              onFocus={() => handleSpotlightFocus('dev')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('learning') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Preferred Learning Style */}
            {isSpotlight('learning') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Preferred Learning Style</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. visual and auditory"
              value={preferredLearningStyle}
              onChange={(e) => setPreferredLearningStyle(e.target.value)}
              onFocus={() => handleSpotlightFocus('learning')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('social') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Social Behavior */}
            {isSpotlight('social') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Social Behavior</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. prefers small groups, shy with new children"
              value={socialBehavior}
              onChange={(e) => setSocialBehavior(e.target.value)}
              onFocus={() => handleSpotlightFocus('social')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('energy') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Energy Level */}
            {isSpotlight('energy') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Energy Level</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. low to moderate"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              onFocus={() => handleSpotlightFocus('energy')}
            />
          </div>

          {/* // Update the interests input field */}
          <div className={`mb-4 relative ${isSpotlight('interests') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}>
            {isSpotlight('interests') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Interests (comma-separated)</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. books, drawing, nature"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              onBlur={(e) => setInterests(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              onFocus={() => handleSpotlightFocus('interests')}
            />
          </div>

          {/* // Update the goals input field */}
          <div className={`mb-4 relative ${isSpotlight('goals') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}>
            {isSpotlight('goals') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Goals (comma-separated)</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. foster creative expression, encourage social confidence"
              value={goalsInput}
              onChange={(e) => setGoalsInput(e.target.value)}
              onBlur={(e) => setGoals(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              onFocus={() => handleSpotlightFocus('goals')}
            />
          </div>

          {/* Recent Activity */}
          <h3 className="text-2xl mt-6 mb-2 text-emerald-800">Recent Activity</h3>

          <div className={`mb-4 relative ${isSpotlight('activityName') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Activity Name */}
            {isSpotlight('activityName') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Activity Name</label>
            <input
              type="text"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. storytime circle"
              value={recentActivity.name}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, name: e.target.value })
              }
              onFocus={() => handleSpotlightFocus('activityName')}
            />
          </div>

          <div className={`mb-4 relative ${isSpotlight('activityResult') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Result */}
            {isSpotlight('activityResult') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Result</label>
            <select
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={recentActivity.result}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, result: e.target.value })
              }
              onFocus={() => handleSpotlightFocus('activityResult')}
            >
              <option value="">Select result</option>
              <option value="succeeded">Succeeded</option>
              <option value="needs improvement">Needs Improvement</option>
              <option value="not consistent">Not Consistent</option>
              <option value="failed">Struggled</option>
            </select>
          </div>

          <div className={`mb-4 relative ${isSpotlight('activityDifficulty') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Difficulty Level */}
            {isSpotlight('activityDifficulty') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Difficulty Level</label>
            <select
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={recentActivity.difficulty_level}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, difficulty_level: e.target.value })
              }
              onFocus={() => handleSpotlightFocus('activityDifficulty')}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className={`mb-4 relative ${isSpotlight('activityObservations') ? 'ring-4 ring-emerald-400 z-50 bg-white p-1' : ''}`}> {/* Observations */}
            {isSpotlight('activityObservations') && showTutorial && <TutorialTooltip step={tutorialStep} />}
            <label className="block text-emerald-900 font-bold mb-2">Observations</label>
            <textarea
              className="border border-emerald-300 rounded w-full py-2 px-3"
              placeholder="e.g. remained attentive throughout and asked questions about the story"
              value={recentActivity.observations}
              onChange={(e) =>
                setRecentActivity({ ...recentActivity, observations: e.target.value })
              }
              onFocus={() => handleSpotlightFocus('activityObservations')}
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
      {/* Side floating buttons */}
      <div className="hidden md:flex flex-col gap-4 fixed bottom-8 right-8 z-20">
        <button
          className="bg-white border border-emerald-300 text-emerald-700 px-4 py-2 rounded shadow hover:bg-emerald-50 font-semibold"
          onClick={handleScrollToTop}
          type="button"
        >
          ↑ Top
        </button>
        {showTutorial && (
          <button
            className="bg-white border border-emerald-300 text-emerald-700 px-4 py-2 rounded shadow hover:bg-emerald-50 font-semibold"
            onClick={handleDontShowTutorial}
          >
            Don&apos;t show tutorial again
          </button>
        )}
      </div>
    </div>
  )
}

export default AddStudentPage