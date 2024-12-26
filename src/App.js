import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Auth from './components/Auth';
import Messages from './components/Messages';
import ListAd from './components/ListAd';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import AdDetails from './components/AdDetails';
import Profile from './components/Profile';
import MyAds from './components/MyAds';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ad/:id" element={<AdDetails />} />
        <Route 
          path="/my-ads" 
          element={
            <ProtectedRoute>
              <MyAds />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/list-ad" 
          element={
            <ProtectedRoute>
              <ListAd />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/:userId" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
