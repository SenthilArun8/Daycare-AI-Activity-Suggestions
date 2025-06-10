import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import { useUser } from '../contexts/UserContext';

const AddPastActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useUser();
  const [form, setForm] = useState({
    name: '',
    result: '',
    difficulty_level: '',
    date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(
        `/students/${id}/past-activities`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Past activity added!');
      navigate(`/students/${id}/past-activities`);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || 'Failed to add past activity.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6] py-12">
      <div className="w-full max-w-2xl p-8 backdrop-blur-md bg-white/70 rounded-xl shadow-lg">
        <div className="py-4" />
        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl text-center font-bold text-emerald-800 mb-8">Add Past Activity</h2>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Activity Name</label>
            <input
              type="text"
              name="name"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Building Blocks"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Result</label>
            <select
              name="result"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.result}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select result</option>
              <option value="succeeded">Succeeded</option>
              <option value="needs improvement">Needs Improvement</option>
              <option value="not consistent">Not Consistent</option>
              <option value="failed">Struggled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Difficulty Level</label>
            <select
              name="difficulty_level"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.difficulty_level}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Date</label>
            <input
              type="date"
              name="date"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">Notes</label>
            <textarea
              name="notes"
              className="border border-emerald-300 rounded w-full py-2 px-3"
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Showed great focus and teamwork."
              disabled={loading}
            />
          </div>

          <div>
            <button
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Add Activity'}
            </button>
          </div>
        </form>
        <div className="py-4" />
      </div>
    </div>
  );
};

export default AddPastActivity;
