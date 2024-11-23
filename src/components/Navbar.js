import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignInAlt, faUserCircle, faMessage, faCaretDown, faBars } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaUser } from 'react-icons/fa';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false); // Close dropdown after logout
      navigate('/auth');
      alert("You have been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          AdHouse
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FontAwesomeIcon icon={faBars} className="text-2xl" />
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-white">
          <Link to="/" className="flex items-center space-x-2 hover:text-gray-200">
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>

          {!user ? (
            <Link to="/auth" className="flex items-center space-x-2 hover:text-gray-200">
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Login</span>
            </Link>
          ) : (
            <>
              <Link to="/messages" className="flex items-center space-x-2 hover:text-gray-200">
                <FontAwesomeIcon icon={faMessage} />
                <span>Messages</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none hover:text-gray-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile.displayName || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaUser className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-white hidden md:inline">
                    {userProfile?.displayName || 'User'}
                  </span>
                  <FontAwesomeIcon 
                    icon={faCaretDown} 
                    className={`transform transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-gray-800 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Show Profile
                    </Link>
                    <Link
                      to="/my-ads"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Ads
                    </Link>
                    <Link
                      to="/list-ad"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      List an Ad
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="mt-4 flex flex-col space-y-3 text-white">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </Link>

            {!user ? (
              <Link
                to="/auth"
                className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>Login</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/messages"
                  className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faMessage} />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/my-ads"
                  className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>My Ads</span>
                </Link>

                <Link
                  to="/list-ad"
                  className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>List an Ad</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded w-full text-left"
                >
                  <FontAwesomeIcon icon={faSignInAlt} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
