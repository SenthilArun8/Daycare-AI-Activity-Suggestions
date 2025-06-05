import { createContext, useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; // Import the useUser hook


const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useUser(); // Access the user from context
  const navigate = useNavigate();  // initialize useNavigate hook

  const handleLogout = () => {
    logout() // Clear user from context and localStorage
    navigate('/login'); // Redirect to login page after logout
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-[#FFEDD2] hover:bg-[#FFBBA6] hover:text-[#294122] rounded-md px-3 py-2'
      : 'text-[#FFEDD2] hover:bg-[#FFBBA6] hover:text-[#294122] rounded-md px-3 py-2';

    return (
    <nav className="bg-[#294122] border-b border-emerald-500 sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-between md:items-stretch md:justify-start w-full">
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
              <span className="block text-[#FFEDD2] text-xl sm:text-2xl font-bold ml-2 whitespace-nowrap">
                Daycare Activity Automation
              </span>
            </NavLink>
            {/* Hamburger for mobile */}
            <button
              className="sm:hidden ml-auto text-[#FFEDD2] focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop nav */}
            <div className="hidden sm:flex flex-1 justify-end">
              <ul className="flex flex-row space-x-2 items-center">
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
                {user && (
                  <li>
                    <NavLink
                      to={user._id ? `/saved-activities/${user._id}` : '/saved-activities'}
                      className={linkClass}
                    >
                      Saved Activities
                    </NavLink>
                  </li>
                )}
                {user ? (
                  <li className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-[#FFEDD2] hover:bg-[#FFBBA6] hover:text-[#294122] rounded-md px-3 py-2"
                    >
                      {user.name}
                    </button>
                    {isDropdownOpen && (
                      <ul className="absolute right-0 bg-white text-black mt-2 rounded shadow-md w-48 z-10">
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
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
        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
            <div className="w-64 bg-[#294122] h-full shadow-lg p-6 flex flex-col">
              <button
                className="self-end mb-6 text-[#FFEDD2]"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ul className="flex flex-col space-y-4">
                <li>
                  <NavLink to="/" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/students" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>
                    Your Students
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/add-student" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>
                    Add Student
                  </NavLink>
                </li>
                {user && (
                  <li>
                    <NavLink to={user._id ? `/saved-activities/${user._id}` : '/saved-activities'} className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      Saved Activities
                    </NavLink>
                  </li>
                )}
                {user ? (
                  <li>
                    <button
                      onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); handleLogout(); }}
                      className="text-[#FFEDD2] hover:bg-[#FFBBA6] hover:text-[#294122] rounded-md px-3 py-2 w-full text-left"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li>
                    <NavLink to="/login" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
