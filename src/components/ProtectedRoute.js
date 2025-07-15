/*
  src/components/ProtectedRoute.js
  --------------------------------
  This component is a wrapper for routes that require authentication.
  - Checks if the user is logged in
  - If not, redirects to the login page
  - If logged in, renders the child component
  
  Used in App.js to protect routes like /my-ads, /profile, etc.
*/

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Get the current user (if logged in)
  const [user, loading] = useAuthState(auth);

  // If still loading, show nothing (or a spinner)
  if (loading) return null;

  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" />;

  // If logged in, render the child component
  return children;
}

export default ProtectedRoute;