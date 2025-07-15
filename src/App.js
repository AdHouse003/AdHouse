/*
  src/App.js
  -----------
  This is the main entry point for the React frontend of AdHouse. It sets up:
    - The overall layout and navigation for the app
    - Routing between different pages (Home, Login, Register, My Ads, etc.)
    - The Navbar that appears on all pages
    - The main content area where different components are rendered based on the route
  
  This file is the "root" of the frontend. It connects all the different features and pages together.
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import MyAds from './components/MyAds';
import ListAd from './components/ListAd';
import EditAd from './components/EditAd';
import AdDetails from './components/AdDetails';
import Profile from './components/Profile';
import Messages from './components/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import Organizations from './components/Organizations';
import ListOrganization from './components/ListOrganization';
import EditOrganization from './components/EditOrganization';
import OrganizationDetails from './components/OrganizationDetails';
import MyOrganizations from './components/MyOrganizations';
import UserProfile from './components/UserProfile';

import './App.css'; // Main CSS for the app

function App() {
  // The Router wraps the entire app, enabling navigation between pages
  return (
    <Router>
      {/* Navbar is always visible at the top */}
      <Navbar />
      {/* Main content area. The Route component renders the correct page based on the URL */}
      <div className="pt-16 min-h-screen bg-gray-50">
        <Routes>
          {/* Home page (listings feed) */}
          <Route path="/" element={<Home />} />
          {/* Login and Register pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* User's own ads */}
          <Route path="/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          {/* Create a new ad */}
          <Route path="/list-ad" element={<ProtectedRoute><ListAd /></ProtectedRoute>} />
          {/* Edit an existing ad */}
          <Route path="/edit-ad/:id" element={<ProtectedRoute><EditAd /></ProtectedRoute>} />
          {/* View ad details */}
          <Route path="/ad/:id" element={<AdDetails />} />
          {/* User profile and messages */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          {/* Organization features */}
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/list-organization" element={<ProtectedRoute><ListOrganization /></ProtectedRoute>} />
          <Route path="/edit-organization/:id" element={<ProtectedRoute><EditOrganization /></ProtectedRoute>} />
          <Route path="/organization/:id" element={<OrganizationDetails />} />
          <Route path="/my-organizations" element={<ProtectedRoute><MyOrganizations /></ProtectedRoute>} />
          {/* View another user's profile */}
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
