import { useState, useEffect } from 'react';
import Student from './Student';
import Spinner from './Spinner';
import { useUser } from '../contexts/UserContext';

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
        ? `https://backend-1qn7j1ns5-senthilarun8s-projects.vercel.app/students?_limit=3`
        : `https://backend-1qn7j1ns5-senthilarun8s-projects.vercel.app/students`;

      setLoading(true);

      try {
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await res.json();
        setStudents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, isHome]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f5f0e6]">
      <div className="w-full max-w-6xl p-8 backdrop-blur-md bg-white/70 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-emerald-800 mb-8 text-center">
          {isHome ? 'Recent Students' : 'All Students'}
        </h2>

        {loading && !error ? (
          <Spinner loading={loading} />
        ) : error ? (
          <div className="text-center text-red-600">{`Error: ${error}`}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {students.map((student) => (
              <Student key={student._id} person={student} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Students;
