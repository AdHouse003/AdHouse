import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './components/Auth';
import Home from './components/Home';
import ListingPage from './components/ListingPage';
import Messages from './components/Messages';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import ListAd from './components/ListAd';
import MyAds from './components/MyAds';
import EditAd from './components/EditAd';
import AdDetails from './components/AdDetails';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/list-ad" element={<ListAd />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="/edit-ad" element={<EditAd />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ad/:adId" element={<AdDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
