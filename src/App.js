import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import ListingPage from './components/ListingPage';
import Messages from './components/Messages';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import ListAd from './components/ListAd';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/list" element={<ListingPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/list-ad" element={<ListAd />} />
      </Routes>
    </Router>
  );
}

export default App;
