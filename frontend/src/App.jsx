import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom';
import axiosInstance from './utils/axios';  
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
import EditStudentPage from './Pages/EditStudentPage';
import { UserProvider, useUser } from './contexts/UserContext'; // Import the UserProvider
import SavedActivityPage from './Pages/SavedActivityPage'; // Import SavedActivityPage
import ComingSoonPage from './Pages/ComingSoonPage'; // Import ComingSoonPage
import PrivacyPolicyPage from './Pages/PrivacyPolicyPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import UnderConstructionPage from './Pages/UnderConstructionPage';
import CookieConsent from './Components/CookieConsent';
import AllSavedActivitiesPage from './Pages/AllSavedActivitiesPage';
import DiscardedActivitiesPage from './Pages/DiscardedActivitiesPage';
import StudentDiscardedActivitiesPage from './Pages/StudentDiscardedActivitiesPage';
import AddPastActivity from './Pages/AddPastActivity';
import PastActivitiesPage from './Pages/PastActivitiesPage';
import SampleStories from './Pages/SampleStories';

// Update addStudent function to use axiosInstance
const addStudent = async (newStudent) => {
  try {
    const response = await axiosInstance.post('/students', newStudent);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw new Error(error.response?.data?.message || 'Failed to add student');
  }
};
// https://cps.ca/en/documents/authors-auteurs/early-years-task-force
// https://www.ontario.ca/page/enhanced-18-month-well-baby-visit
// https://www.toronto.ca/community-people/children-parenting/pregnancy-and-parenting/parenting/healthy-child-development/social-and-emotional-health/
//  pesota, newsletter,  spring boot, new langchain agent with google, advanced cookie options, better seo, help page, help sign, 2FA, RAG, make it more inclusive towards students, gamify, inweb credits, badges (unlock all colors off the activity)
/*
// add new student
const addStudent = async (newStudent) => {
  const token = localStorage.getItem('token');  // Get the JWT token from localStorage
  
  console.log(token, 'Token from localStorage');  // Make sure the token is available in console
  if (!token) {
    throw new Error('Please log in first');  // Token not found, so throw an error
  }

  const response = await fetch('/api/students', {
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
*/

// Update deleteStudent function to use axiosInstance
const deleteStudent = async (id) => {
  try {
    await axiosInstance.delete(`/students/${id}`);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete student');
  }
};

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
        <Route path="/edit-student/:id" element={<EditStudentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/students" element={<PrivateRoute><StudentsPage /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/saved-activities/:id" element={<SavedActivityPage />} /> {/* Route for saved activities */}
        <Route path="/coming-soon" element={<ComingSoonPage />} /> {/* Route for Coming Soon page */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> 
        <Route path="/reset-password" element={<ResetPasswordPage/>} />
        <Route path="/under-construction" element={<UnderConstructionPage/>}/>
        <Route path="/saved-activities" element={<PrivateRoute><AllSavedActivitiesPage /></PrivateRoute>} />
        <Route path="/discarded-activities" element={<DiscardedActivitiesPage />} />
        <Route path="/discarded-activities/:id" element={<StudentDiscardedActivitiesPage />} />
        <Route path="/students/:id/add-past-activity" element={<AddPastActivity />} />
        <Route path="/students/:id/past-activities" element={<PastActivitiesPage />} />
        <Route path="/sample-stories" element={<SampleStories />} />
      </Route>
    )
  );

   return (
    <UserProvider>
      <RouterProvider router={router} />
      <CookieConsent />
    </UserProvider>
  );
}

export default App
