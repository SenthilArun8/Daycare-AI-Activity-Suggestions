import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from 'react';
import HomePage from './Pages/HomePage';
import MainLayout from './Layout/MainLayout';
import AddStudentPage from './Pages/AddStudentPage';
import NotFoundPage from './Pages/NotFoundPage';
import StudentsPage from './Pages/StudentsPage';
import StudentPage, {studentLoader}from './Pages/StudentPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import { UserProvider, useUser } from './contexts/UserContext'; // Import the UserProvider


// add new student
const addStudent = async (newStudent) => {
  const token = localStorage.getItem('token');  // Get the JWT token from localStorage
  
  console.log(token, 'Token from localStorage');  // Make sure the token is available in console
  if (!token) {
    throw new Error('Please log in first');  // Token not found, so throw an error
  }

  const response = await fetch('http://localhost:5000/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // Send token in Authorization header
    },
    body: JSON.stringify(newStudent),
  });

  if (!response.ok) {
    throw new Error('Failed to add student');
  }

  return response.json();  // Return the response JSON if successful
};


// delete student
const deleteStudent = async (id) => {
   const res = await fetch(`http://localhost:5000/students/${id}`,{
   method: 'DELETE', });
 return;
}

const PrivateRoute = ({ children }) => {
  const { user } = useUser(); // Check if user is available in context
  
  // If there's no token, redirect to the login page
  return user ? children : <Navigate to="/login" />;
};



function App() {
const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path='*' element={<NotFoundPage />} />
        <Route path="/add-student" element={<AddStudentPage addStudentSubmit={addStudent}/>} /> 
        <Route path="/students/:id" element={<StudentPage deleteStudent={deleteStudent}/>} loader={studentLoader}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/students" element={<PrivateRoute><StudentsPage /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
    )
  );

   return (
    <UserProvider> {/* Wrap the RouterProvider with UserProvider */}
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App
