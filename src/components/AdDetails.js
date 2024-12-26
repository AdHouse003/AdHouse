import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMail, IoLogoWhatsapp, IoCall } from 'react-icons/io5';
import { toast } from 'react-hot-toast';

const AdDetails = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const docRef = doc(db, 'ads', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAd({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  const handleMessageSeller = () => {
    if (!user) {
      toast.error('Please sign in to message the seller');
      navigate('/login', { 
        state: { 
          from: `/ad/${id}`,
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

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I'm interested in your ad: ${ad.name}`);
    const whatsappUrl = `https://wa.me/${ad.phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${ad.phoneNumber}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Ad not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-96">
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
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full">
            GHC {ad.price?.toLocaleString()}
          </div>
        </div>

        {/* Ad Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{ad.name}</h1>
            <Link
              to={`/user/${ad.userId}`}
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
            >
              <img
                src={ad.userPhotoURL || `https://ui-avatars.com/api/?name=${ad.userName || 'User'}&background=random`}
                alt={ad.userName}
                className="h-10 w-10 rounded-full"
              />
              <span className="font-medium">{ad.userName || 'View Seller Profile'}</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{ad.description}</p>
              
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Condition</h2>
                <p className="text-gray-600">{ad.condition}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-600">{ad.location}</p>

              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
                <p className="text-gray-600">Phone: {ad.phoneNumber}</p>
                {ad.email && <p className="text-gray-600">Email: {ad.email}</p>}
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Posted</h2>
                <p className="text-gray-600">
                  {ad.createdAt?.toDate?.() 
                    ? new Date(ad.createdAt.toDate()).toLocaleDateString() 
                    : 'Date not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Buttons Section */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Contact Seller</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleMessageSeller}
              className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={user?.email === ad?.userEmail}
            >
              <IoMail size={20} />
              <span>Message</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              <IoLogoWhatsapp size={20} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCall}
              className="flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <IoCall size={20} />
              <span>Call</span>
            </button>
          </div>
          
          {user?.email === ad?.userEmail && (
            <p className="text-sm text-gray-500 text-center mt-2">
              This is your ad
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetails;