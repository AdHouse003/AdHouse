/*
  src/components/MyAds.js
  -----------------------
  This component displays all ads posted by the currently logged-in user.
  - Fetches the user's ads from Firestore
  - Allows the user to edit, delete, or mark ads as sold/available
  - Shows a grid of ad cards, each with action buttons
  - Handles loading state and error messages
  
  This is used in App.js for the /my-ads route and is protected (only accessible when logged in).
*/

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function MyAds() {
  // Get the current user
  const [user] = useAuthState(auth);
  // State for user's ads and loading
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch the user's ads from Firestore when the component mounts
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserAds();
  }, [user]);

  // Fetch user's ads from Firestore
  const fetchUserAds = async () => {
    try {
      const q = query(
        collection(db, 'ads'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const userAds = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAds(userAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load your ads');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to the edit ad page
  const handleEdit = (ad) => {
    navigate(`/edit-ad/${ad.id}`);
  };

  // Delete an ad
  const handleDelete = async (adId) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await deleteDoc(doc(db, 'ads', adId));
        setAds(ads.filter(ad => ad.id !== adId));
        toast.success('Ad deleted successfully');
      } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error('Failed to delete ad');
      }
    }
  };

  // Toggle the sold status of an ad
  const handleSoldToggle = async (adId, currentSoldStatus) => {
    try {
      const adRef = doc(db, 'ads', adId);
      await updateDoc(adRef, {
        sold: !currentSoldStatus,
        updatedAt: new Date(),
      });
      // Update local state
      setAds(ads.map(ad => 
        ad.id === adId ? { ...ad, sold: !currentSoldStatus } : ad
      ));
      toast.success(currentSoldStatus ? 'Ad marked as available' : 'Ad marked as sold');
    } catch (error) {
      console.error('Error updating sold status:', error);
      toast.error('Failed to update sold status');
    }
  };

  // Show loading spinner while loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Ads</h1>
      {/* Show message if user has no ads */}
      {ads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't posted any ads yet.</p>
          <button
            onClick={() => navigate('/list-ad')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Post Your First Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${ad.sold ? 'opacity-75' : ''}`}>
              {/* Image and SOLD overlay */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {ad.images && ad.images.length > 0 ? (
                  <img
                    src={ad.images[0]}
                    alt={ad.name}
                    className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${ad.sold ? 'grayscale' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  GHC {ad.price.toLocaleString()}
                </div>
                {/* Show SOLD overlay if ad is sold */}
                {ad.sold && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-lg font-bold transform -rotate-12">
                      SOLD
                    </div>
                  </div>
                )}
              </div>
              {/* Ad details and action buttons */}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{ad.name}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{ad.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-4">{ad.condition}</span>
                  <span>{ad.location}</span>
                </div>
                {/* Action buttons: Edit, Mark Sold/Available, Delete */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-150 active:scale-95 active:shadow-inner"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSoldToggle(ad.id, ad.sold)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all duration-150 active:scale-95 active:shadow-inner ${
                      ad.sold 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {ad.sold ? 'Mark Available' : 'Mark Sold'}
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-150 active:scale-95 active:shadow-inner"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAds;