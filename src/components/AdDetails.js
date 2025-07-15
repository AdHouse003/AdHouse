/*
  src/components/AdDetails.js
  ---------------------------
  This component displays the details of a single ad.
  - Fetches ad data from Firestore based on the ad ID in the URL
  - Shows ad images, description, price, and seller info
  - Allows users to contact the seller (messaging)
  - Shows SOLD overlay if the ad is marked as sold
  - Handles loading and error states
  
  This is used in App.js for the /ad/:id route and is accessible to all users.
*/

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMail, IoLogoWhatsapp, IoCall, IoClose } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const AdDetails = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const handleMessageSeller = (e) => {
    e.preventDefault(); // Add this to prevent default button behavior
    
    // Check if trying to message own ad
    if (user?.email === ad?.userEmail) {
      toast.error("You can't message your own ad");
      return;
    }

    if (!user) {
      toast.error('Please login to message the seller');
      navigate('/auth', { 
        state: { 
          from: `/ad/${id}`,
          recipientEmail: ad.userEmail,
          message: `Hi, I'm interested in your ad: ${ad.name}`,
          action: 'message'
        } 
      });
      return;
    }

    // If user is logged in, navigate to messages
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

  const openPreview = (index) => {
    setSelectedImageIndex(index);
    setIsPreviewOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => 
      prev === ad.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => 
      prev === 0 ? ad.images.length - 1 : prev - 1
    );
  };

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
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
      <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${ad.sold ? 'opacity-75' : ''}`}>
        {/* Image Gallery */}
        <div className="relative">
          {ad.images && ad.images.length > 0 ? (
            <Carousel
              responsive={responsive}
              infinite={true}
              showDots={true}
              autoPlay={false}
              removeArrowOnDeviceType={["tablet", "mobile"]}
              className="h-full"
            >
              {ad.images.map((image, index) => (
                <div 
                  key={index} 
                  className="h-96 cursor-pointer"
                  onClick={() => openPreview(index)}
                >
                  <img
                    src={image}
                    alt={`${ad.name} - Image ${index + 1}`}
                    className={`w-full h-full object-cover ${ad.sold ? 'grayscale' : ''}`}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full z-10">
            GHC {ad.price?.toLocaleString()}
          </div>
          {ad.sold && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="bg-red-500 text-white px-6 py-3 rounded-lg text-2xl font-bold transform -rotate-12">
                SOLD
              </div>
            </div>
          )}
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
        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Contact Seller</h2>
          {ad.sold ? (
            <div className="text-center py-4">
              <p className="text-red-500 font-semibold text-lg mb-2">This item has been sold</p>
              <p className="text-gray-600">Contact buttons are disabled for sold items</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={handleMessageSeller}
              className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          )}
          
          {user?.email === ad?.userEmail && (
            <p className="text-sm text-gray-500 text-center mt-2">
              This is your ad
            </p>
          )}
        </div>
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closePreview}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full"
            onClick={closePreview}
          >
            <IoClose size={24} />
          </button>
          
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-gray-800 rounded-full"
            onClick={prevImage}
          >
            ❮
          </button>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-gray-800 rounded-full"
            onClick={nextImage}
          >
            ❯
          </button>

          <img
            src={ad.images[selectedImageIndex]}
            alt={`${ad.name} - Full preview`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {selectedImageIndex + 1} / {ad.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetails;