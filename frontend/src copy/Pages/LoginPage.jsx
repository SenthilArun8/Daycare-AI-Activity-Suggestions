import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; 

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser(); // Get the login function from UserContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(' https://daycare-ai-activity-suggestions-backend.onrender.com/login', formData);

    console.log('Response:', response.data);  // Log the entire response

    if (response.data.token) {
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      login(response.data.user, response.data.token); // Assuming user is in response.data.user
    } else {
      console.error('Token not found in the response');
    }

    navigate('/students');
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6]">
      <div className="w-full max-w-md p-8 backdrop-blur-md bg-white/60 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-center text-2xl font-bold text-emerald-800">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-emerald-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
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
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-emerald-800">
          Not a member?{' '}
          <Link to="/register" className="font-semibold hover:underline text-emerald-700">
            Register for Free
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-emerald-700">
          <Link to="/forgot-password" className="font-semibold hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
