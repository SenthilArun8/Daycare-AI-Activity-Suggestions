import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useUser } from '../contexts/UserContext';

const PastActivitiesPage = () => {
  const { id } = useParams();
  const { token } = useUser();
  const [activities, setActivities] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPastActivities = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`/students/${id}`);
        setStudentName(res.data.name);
        setActivities(res.data.past_activities || []);
      } catch (err) {
        setError(
          err?.response?.data?.error || 'Failed to load past activities.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPastActivities();
  }, [id, token]);

  return (
    <div className="min-h-screen bg-[#f5f0e6] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white/80 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-emerald-800 mb-6 text-center">
          Past Activities for {studentName}
        </h2>
        <div className="mb-6 text-center">
          <Link
            to={`/students/${id}`}
            className="text-emerald-700 hover:underline font-semibold"
          >
            ← Back to Student Page
          </Link>
        </div>
        {loading ? (
          <div className="text-center text-emerald-700">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : activities.length === 0 ? (
          <div className="text-center text-emerald-700">No past activities found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-emerald-200 rounded-lg">
              <thead>
                <tr className="bg-emerald-100">
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Activity Name</th>
                  <th className="py-2 px-4 border-b text-left">Result</th>
                  <th className="py-2 px-4 border-b text-left">Difficulty</th>
                  <th className="py-2 px-4 border-b text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50">
                    <td className="py-2 px-4 border-b">{a.date ? new Date(a.date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-4 border-b font-semibold">{a.name}</td>
                    <td className="py-2 px-4 border-b">{a.result}</td>
                    <td className="py-2 px-4 border-b">{a.difficulty_level}</td>
                    <td className="py-2 px-4 border-b">{a.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastActivitiesPage;
