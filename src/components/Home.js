import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import ImageCarousel from './ImageCarousel';

const Home = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'ads'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const adsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null
      }));
      
      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === 'No contact number') {
      toast.error('Phone number was not added by advertiser');
      return;
    }
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === 'No contact number') {
      toast.error('WhatsApp number was not added by advertiser');
      return;
    }
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleMessage = (ad) => {
    if (!user) {
      toast((t) => (
        <div>
          <p>Please log in to message the seller</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full"
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/auth', {
                state: {
                  from: 'home',
                  adId: ad.id,
                  adTitle: ad.name,
                  recipientEmail: ad.userEmail
                }
              });
            }}
          >
            Log In
          </button>
        </div>
      ), { duration: 5000 });
    } else {
      navigate('/messages', {
        state: {
          adId: ad.id,
          adTitle: ad.name,
          recipientEmail: ad.userEmail
        }
      });
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault(); // Prevent the Link component from triggering
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Latest Ads</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Clickable image and title section */}
            <Link to={`/ad/${ad.id}`}>
              <div className="relative">
                <ImageCarousel images={ad.images || []} />
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  GHC {ad.price?.toLocaleString()}
                </div>
              </div>

              <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                  <h2 className="text-lg md:text-xl font-semibold mb-1 sm:mb-0">{ad.name}</h2>
                  <p className="text-base md:text-lg font-bold text-blue-600">
                    GHC {ad.price?.toLocaleString()}
                  </p>
                </div>
                
                <p className="text-gray-600 mb-2 line-clamp-2">{ad.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-4">{ad.condition}</span>
                  <span>{ad.location}</span>
                </div>
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="p-4 pt-0" onClick={handleButtonClick}>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleCall(ad.phoneNumber)}
                  className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call Seller
                </button>

                <button
                  onClick={() => handleWhatsApp(ad.phoneNumber)}
                  className="flex items-center justify-center bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={() => handleMessage(ad)}
                  className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Message Seller
                </button>
              </div>

              {ad.negotiable && (
                <span className="inline-block mt-2 text-sm text-green-600">
                  Price Negotiable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;