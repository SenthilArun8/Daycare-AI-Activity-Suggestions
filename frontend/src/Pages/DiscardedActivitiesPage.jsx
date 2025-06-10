import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const DiscardedActivitiesPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data.filter(s => (s.discarded_activities && s.discarded_activities.length > 0)));
      } catch (err) {
        setError('Failed to load students.');
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-800">Students with Discarded Activities</h2>
      {students.length === 0 ? (
        <div className="text-gray-600">No students have discarded activities yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {students.map(student => (
            <li key={student._id} className="py-4 flex items-center justify-between">
              <span className="font-semibold text-lg text-emerald-900">{student.name}</span>
              <button
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
                onClick={() => navigate(`/discarded-activities/${student._id}`)}
              >
                View Discarded Activities
              </button>
            </li>
          ))}
        </ul>
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

export default DiscardedActivitiesPage;
