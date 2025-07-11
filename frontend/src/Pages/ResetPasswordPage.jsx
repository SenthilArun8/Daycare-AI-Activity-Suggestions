import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams(); // Get token from the URL
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // backend 5000
    try {
      const res = await axiosInstance.post(`/reset-password/${token}`, { password });
      setMessage(res.data.message); // Success message
      setPassword(''); // Clear password field
      // Redirect user to login page after reset
      setTimeout(() => navigate('/login'), 'daycare-ai-activity-suggestions-git-main-senthilarun8s-projects.vercel.app/');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6]">
      <div className="w-full max-w-md p-8 backdrop-blur-md bg-white/60 rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-2xl font-bold text-emerald-800">
          Reset Your Password
        </h2>

        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-emerald-900">
              New Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-emerald-700 px-4 py-2 text-white font-semibold hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
