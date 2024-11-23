import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import ImageCarousel from './ImageCarousel';

const AdDetails = () => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adDoc = await getDoc(doc(db, 'ads', adId));
        if (adDoc.exists()) {
          setAd({ id: adDoc.id, ...adDoc.data() });
        } else {
          toast.error('Ad not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        toast.error('Error loading ad details');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [adId, navigate]);

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
                  from: `/ad/${ad.id}`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2">
            <ImageCarousel images={ad.images || []} />
          </div>

          {/* Details Section */}
          <div className="p-6 md:w-1/2">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{ad.name}</h1>
              <p className="text-xl font-bold text-blue-600">
                GHC {ad.price?.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Listed by: {ad.userName || 'Anonymous'}</span>
            </div>

            <p className="text-gray-600 mb-4">{ad.description}</p>

            {ad.createdAt && (
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Listed on: {new Date(ad.createdAt?.toDate()).toLocaleDateString()}</span>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <p><span className="font-semibold">Condition:</span> {ad.condition}</p>
              <p><span className="font-semibold">Location:</span> {ad.location}</p>
              {ad.negotiable && (
                <p className="text-green-600">Price Negotiable</p>
              )}
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleCall(ad.phoneNumber)}
                className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Seller
              </button>

              <button
                onClick={() => handleWhatsApp(ad.phoneNumber)}
                className="w-full flex items-center justify-center bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>

              <button
                onClick={() => handleMessage(ad)}
                className="w-full flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Message Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetails;