import { createContext, useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; // Import the useUser hook


const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useUser(); // Access the user from context
  const navigate = useNavigate();  // initialize useNavigate hook

  const handleLogout = () => {
    logout() // Clear user from context and localStorage
    navigate('/login'); // Redirect to login page after logout
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

    return (
    <nav className="bg-emerald-700 border-b border-emerald-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                Daycare Activity Automation
              </span>
            </NavLink>
            <div className="md:ml-auto">
              <ul className="flex space-x-2 items-center">
                <li>
                  <NavLink to="/" className={linkClass}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/students" className={linkClass}>
                    Your Students
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/add-student" className={linkClass}>
                    Add Student
                  </NavLink>
                </li>

                {/* User Dropdown */}
                {user ? (
                  <li className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-white hover:bg-gray-900 rounded-md px-3 py-2"
                    >
                      {user.name} {/* Display user's name */}
                    </button>
                    {isDropdownOpen && (
                      <ul className="absolute right-0 bg-white text-black mt-2 rounded shadow-md w-48 z-10">
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block px-4 py-2 hover:bg-gray-200"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
                  // If no user is logged in, show login link
                  <li>
                    <NavLink to="/login" className={linkClass}>
                      Login
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
