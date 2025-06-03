import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  // Get user and token from localStorage when the component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(storedUser);  // Set user data in state if token exists
      setToken(storedToken); // Set token in state
      console.log('User logged in from localStorage');
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);  // Set token in state

    // Store user data and token in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);

    console.log('User logged in:', userData);
    console.log('Token saved:', token);
  };

  const logout = () => {
    setUser(null);  // Set user state to null to reflect that the user has logged out
    setToken(null);  // Clear the token from state
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    console.log('User logged out');
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
