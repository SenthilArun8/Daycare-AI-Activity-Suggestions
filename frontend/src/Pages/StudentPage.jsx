// Import necessary hooks and components
// import {useState, useEffect} from 'react';
import { useParams, useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBirthdayCake } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActivitySuggestions from '../Components/ActivitySuggestions';
import axios from '../utils/axios';
import { useUser } from '../contexts/UserContext';

// Define your sample student IDs here or import them from a shared constants file
const SAMPLE_STUDENT_IDS = [
  '683d57f853223cfb0c1e5723', // Example ID 1
  '683d590053223cfb0c1e5724', // Example ID 2
];


const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const StudentPage = ({ deleteStudent }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const student = useLoaderData();
  const { user, token } = useUser();

  // Determine if the current student is a sample student
  const isSampleStudent = SAMPLE_STUDENT_IDS.includes(id);

  // For Edit: Check if it's a sample student AND user is NOT logged in
  const isViewingSampleWithoutLogin = isSampleStudent && !token;

  // For Delete: Check if it's a sample student - if so, ALWAYS disable delete
  const canDelete = !isSampleStudent; // Only allow deletion if NOT a sample student

  const onDeleteClick = (studentId) => {
    if (!canDelete) { // Use the canDelete flag
      toast.info('Sample student profiles cannot be deleted.');
      return; // Prevent deletion
    }
    const confirm = window.confirm('Are you sure you want to delete this student?');
    if (!confirm) return;
    deleteStudent(studentId);
    toast.success('Student deleted successfully');
    navigate('/students');
  };

  return (
    <>
      {/* */}
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/students"
            className="text-emerald-700 hover:text-emerald-900 flex items-center font-semibold"
          >
            <FaArrowLeft className="mr-2" /> Back to Students
          </Link>
        </div>
      </section>

      <section className="bg-[#f5f0e6] min-h-screen flex items-center justify-center py-10">
        <div className="w-full max-w-6xl p-8 backdrop-blur-md bg-white/70 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] w-full gap-8">
            <main>
              <div className="bg-white/90 p-6 rounded-lg shadow-md text-center md:text-left mb-6">
                <div className="text-emerald-700 mb-4 font-semibold">
                  {capitalizeFirstLetter(student.gender)}
                </div>
                <h1 className="text-3xl font-bold mb-4 text-emerald-900">
                  {capitalizeFirstLetter(student.name)}
                </h1>
                <div className="text-emerald-700 mb-4 flex align-middle justify-center md:justify-start">
                  <FaBirthdayCake className="mr-1 text-orange-700" />
                  <p className="text-orange-700">{student.age_months} months</p>
                </div>
              </div>

              <div className="bg-white/90 p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-emerald-800 text-lg font-bold mb-6">
                  Toddler Description
                </h3>
                <p className="mb-4 text-emerald-900">
                  {student.toddler_description}
                </p>
                <h3 className="text-emerald-800 text-lg font-bold mb-2">Age</h3>
                <p className="mb-4 text-emerald-900">{student.age_months}</p>
              </div>

             {/* --- ENHANCED SECTION FOR RECENT ACTIVITY --- */}
              {student.recent_activity && student.recent_activity.name && (
                <div className="bg-white/90 p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-emerald-800 text-lg font-bold mb-6">
                    Recent Activity
                  </h3>
                  <div className="space-y-3"> {/* Adds consistent vertical spacing between items */}
                    <p className="text-emerald-900">
                      <strong className="font-semibold text-emerald-800">Activity:</strong> {capitalizeFirstLetter(student.recent_activity.name)}
                    </p>
                    <p className="text-emerald-900">
                      <strong className="font-semibold text-emerald-800">Result:</strong> {capitalizeFirstLetter(student.recent_activity.result)}
                    </p>
                    <p className="text-emerald-900">
                      <strong className="font-semibold text-emerald-800">Difficulty:</strong> {capitalizeFirstLetter(student.recent_activity.difficulty_level)}
                    </p>
                    <p className="text-emerald-900">
                      <strong className="font-semibold text-emerald-800">Observations:</strong> {student.recent_activity.observations || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              {/* --- END ENHANCED SECTION --- */}

              <ActivitySuggestions student={student} />
            </main>

            {/* */}
            <aside>
              {/* */}
              <div className="bg-white/90 p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-6 text-emerald-800">
                  Student Goals
                </h3>
                <ul className="list-disc list-inside mb-4 text-emerald-900">
                  {Array.isArray(student.goals) && student.goals.length > 0 ? (
                    student.goals.map((goal, idx) => (
                      <li key={idx} className="text-lg">{goal}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">No goals specified.</li>
                  )}
                </ul>
                <hr className="my-4" />
                <h3 className="text-xl text-emerald-800">Personality:</h3>
                <p className="my-2 bg-emerald-50 p-2 font-bold rounded">
                  {student.personality || 'Not provided'}
                </p>
                <h3 className="text-xl text-emerald-800">Developmental Stage:</h3>
                <p className="my-2 bg-emerald-50 p-2 font-bold rounded">
                  {student.developmental_stage || 'Not provided'}
                </p>
              </div>
              {/* */}
              <div className="bg-white/90 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6 text-emerald-800">
                  Manage Student
                </h3>
                {/* Edit Student Button/Link */}
                <Link
                  to={isViewingSampleWithoutLogin ? '#' : `/edit-student/${student._id}`}
                  className={`
                    ${isViewingSampleWithoutLogin ? 'bg-emerald-300 cursor-not-allowed opacity-50' : 'bg-emerald-700 hover:bg-emerald-800'}
                    text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block transition
                  `}
                  onClick={(e) => {
                    if (isViewingSampleWithoutLogin) {
                      e.preventDefault(); // Prevent navigation
                      toast.info('Please log in to edit student profiles.');
                    }
                  }}
                >
                  Edit Student
                </Link>
                {/* Delete Student Button */}
                <button
                  onClick={() => onDeleteClick(student._id)}
                  className={`
                    ${!canDelete ? 'bg-red-300 cursor-not-allowed opacity-50' : 'bg-red-500 hover:bg-red-600'}
                    text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block transition
                  `}
                  disabled={!canDelete} // Disable button if it's a sample student
                >
                  Delete Student
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

const studentLoader = async ({ params }) => {
  try {
    const res = await axios.get(`/students/${params.id}`);
    return res.data;
  } catch (error) {
    throw new Error('Failed to fetch student');
  }
};

export { StudentPage as default, studentLoader };