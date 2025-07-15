/*
  src/components/UserProfile.js
  -----------------------------
  This component displays the profile of the currently logged-in user.
  - Fetches user data from Firestore
  - Shows user info, ads, and organizations
  - Allows the user to edit their profile or delete their account
  - Handles loading and error states
  
  This is used in App.js for the /profile route and is protected (only accessible when logged in).
*/

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserProfile = () => {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndAds = async () => {
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserProfile({ id: userDoc.id, ...userDoc.data() });
        }

        // Fetch user's ads
        const adsQuery = query(
          collection(db, 'ads'),
          where('userId', '==', userId)
        );
        const adsSnapshot = await getDocs(adsQuery);
        const ads = adsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserAds(ads);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAds();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.displayName || 'User'}&background=random`}
            alt={userProfile?.displayName}
            className="h-20 w-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{userProfile?.displayName || 'Anonymous User'}</h1>
            <p className="text-gray-600">Member since: {
              userProfile?.createdAt?.toDate?.() 
                ? new Date(userProfile.createdAt.toDate()).toLocaleDateString()
                : 'Unknown'
            }</p>
          </div>
        </div>
      </div>

      {/* User's Ads Section */}
      <h2 className="text-xl font-bold mb-4">Ads by this user</h2>
      {userAds.length === 0 ? (
        <p className="text-gray-600">This user hasn't posted any ads yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAds.map((ad) => (
            <Link 
              key={ad.id} 
              to={`/ad/${ad.id}`}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${ad.sold ? 'opacity-75' : ''}`}
            >
              <div className="relative aspect-[4/3]">
                {ad.images && ad.images.length > 0 ? (
                  <img
                    src={ad.images[0]}
                    alt={ad.name}
                    className={`w-full h-full object-cover ${ad.sold ? 'grayscale' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  GHC {ad.price?.toLocaleString()}
                </div>
                {ad.sold && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-lg font-bold transform -rotate-12">
                      SOLD
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{ad.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{ad.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{ad.location}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(ad.createdAt?.toDate?.() || null).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 