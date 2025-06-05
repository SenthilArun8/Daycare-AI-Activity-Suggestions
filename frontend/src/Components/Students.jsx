import { useState, useEffect } from 'react';
import Student from './Student';
import Spinner from './Spinner';
import { useUser } from '../contexts/UserContext';
import BlurredBackground from './BlurredBackground';
import axiosInstance from '../utils/axios';

const Students = ({ isHome = false }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useUser();

  useEffect(() => {
    if (!token) {
      setError("No token available");
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      const apiUrl = isHome
        ? `/students?_limit=3`
        : `/students`;

      setLoading(true);

      try {
        const response = await axiosInstance.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched students:', response.data);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.students || [];

        setStudents(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, isHome]);

  if (isHome && !token) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-white isolate px-6 py-12 lg:px-8">
      <BlurredBackground />
      <div className="w-full max-w-6xl p-8 backdrop-blur-md bg-[#FFEDD2]/80 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#162114] text-center w-full">
            {isHome ? 'Recent Students' : 'All Students'}
          </h2>
        </div>
        {loading && !error ? (
          <Spinner loading={loading} />
        ) : error ? (
          <div className="text-center text-red-600">{`Error: ${error}`}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(students) ? (
              students.map((student) => (
                <div key={student._id} className="relative">
                  <Student person={student} />
                  <button
                    className="absolute top-2 right-2 p-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full shadow transition flex items-center justify-center z-10"
                    onClick={() => window.location.href = `/saved-activities/${student._id}`}
                    title="View Saved Activities"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-red-500 col-span-full">Student data is invalid.</div>
            )}

            {/* Add Student Card */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 bg-white/40 rounded-xl min-h-[220px] h-full cursor-pointer hover:bg-emerald-50 transition group">
              <a href="/add-student" className="flex flex-col items-center justify-center w-full h-full py-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-emerald-400 bg-white/70 group-hover:bg-emerald-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#059669" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="mt-4 text-emerald-700 font-semibold text-lg opacity-80">Add Student</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Students;
