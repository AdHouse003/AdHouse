import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignInAlt, faUserCircle, faMessage, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("You have been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Title */}
        <Link to="/" className="text-white text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          AdHouse
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6 text-white">
          <Link to="/home" className="flex items-center space-x-2 hover:text-gray-200">
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
              <div className="relative">
                <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
                    <span>{user.displayName || 'User'}</span>
                    <FontAwesomeIcon icon={faCaretDown} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-gray-800">
                    <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-200"
                    >
                        Show Profile
                    </Link>
                    <Link
                        to="/list-ad"
                        className="block px-4 py-2 hover:bg-gray-200"
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
      </div>
    </nav>
  );
};

export default Navbar;
