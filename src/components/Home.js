import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { IoMail, IoLogoWhatsapp, IoCall } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const { ref, inView } = useInView({ threshold: 0 });
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let personalAds = [];
      let organizationAds = [];

      // Fetch personal ads
      if (activeTab === 'all' || activeTab === 'personal') {
        const personalQuery = query(
          collection(db, 'ads'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const personalSnap = await getDocs(personalQuery);
        personalAds = personalSnap.docs.map(doc => ({
          id: doc.id,
          type: 'personal',
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
      }

      // Fetch organization listings
      if (activeTab === 'all' || activeTab === 'organizations') {
        const orgQuery = query(
          collection(db, 'organizationListings'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const orgSnap = await getDocs(orgQuery);
        organizationAds = orgSnap.docs.map(doc => ({
          id: doc.id,
          type: 'organization',
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
      }

      // Combine listings based on active tab
      let combinedListings = [];
      if (activeTab === 'all') {
        combinedListings = [...personalAds, ...organizationAds];
      } else if (activeTab === 'personal') {
        combinedListings = personalAds;
      } else {
        combinedListings = organizationAds;
      }

      // Sort by createdAt
      combinedListings.sort((a, b) => b.createdAt - a.createdAt);
      
      setListings(combinedListings);
      console.log('Fetched listings:', combinedListings); // Debug log
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter listings based on search query
  const filteredListings = listings.filter(ad =>
    ad.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search listings..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded p-2 mb-4 w-full"
      />

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'personal'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Ads
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'organizations'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Organizations
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((ad) => (
              <AdCard 
                key={ad.id} 
                ad={ad} 
                user={user}
                navigate={navigate}
              />
            ))}
          </div>

          {/* Show message only if searchQuery is not empty and no listings are found */}
          {searchQuery && filteredListings.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No listings found for "{searchQuery}".
            </div>
          )}

          {/* Intersection Observer target */}
          <div ref={ref} className="h-10" />
        </>
      )}
    </div>
  );
};

const AdCard = ({ ad, user, navigate }) => {
  const handleMessageSeller = (e) => {
    e.preventDefault(); // Prevent navigation to ad details
    if (!user) {
      toast.error('Please sign in to message the seller');
      navigate('/login', { 
        state: { 
          from: `/ad/${ad.id}`,
          message: `Hi, I'm interested in your ad: ${ad.name}`
        } 
      });
      return;
    }

    navigate('/messages', {
      state: {
        recipientEmail: ad.userEmail,
        initialMessage: `Hi, I'm interested in your ad: ${ad.name}`
      }
    });
  };

  const handleWhatsApp = (e) => {
    e.preventDefault(); // Prevent navigation to ad details
    const message = encodeURIComponent(`Hi, I'm interested in your ad: ${ad.name}`);
    const whatsappUrl = `https://wa.me/${ad.phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = (e) => {
    e.preventDefault(); // Prevent navigation to ad details
    window.location.href = `tel:${ad.phoneNumber}`;
  };

  return (
    <Link to={`/ad/${ad.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3]">
        {ad.images && ad.images.length > 0 ? (
          <img
            src={ad.images[0]}
            alt={ad.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
          GHC {ad.price?.toLocaleString()}
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{ad.name}</h2>
        <p className="text-gray-600 mb-2 line-clamp-2">{ad.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-4">{ad.condition}</span>
          <span>{ad.location}</span>
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4" onClick={e => e.preventDefault()}>
          <button
            onClick={handleMessageSeller}
            className="flex items-center justify-center space-x-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 transition-colors text-sm"
            disabled={user?.email === ad.userEmail}
          >
            <IoMail size={16} />
            <span>Message</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center space-x-1 bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 transition-colors text-sm"
          >
            <IoLogoWhatsapp size={16} />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCall}
            className="flex items-center justify-center space-x-1 bg-purple-500 text-white py-2 px-3 rounded hover:bg-purple-600 transition-colors text-sm"
          >
            <IoCall size={16} />
            <span>Call</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default Home;