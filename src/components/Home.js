import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ads'));
        const adsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAds(adsList);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) {
    return <p className="text-center">Loading ads...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Available Ads</h1>
      {ads.length === 0 ? (
        <p className="text-center">No ads available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4 shadow-md">
              <img
                src={ad.photoURL}
                alt={ad.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{ad.name}</h2>
              <p className="text-gray-700 mb-2">{ad.description}</p>
              <p className="text-green-600 font-bold">GHC {ad.price}</p>
              <p className="text-sm text-gray-500">Condition: {ad.condition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
