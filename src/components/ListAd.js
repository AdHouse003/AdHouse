/*
  src/components/ListAd.js
  ------------------------
  This component allows users to create and list a new ad.
  - Displays a form for entering ad details and uploading images
  - Handles payment modal and payment verification before allowing ad listing
  - Integrates with Firestore to save the new ad
  - Handles form validation, loading state, and error messages
  
  This is used in App.js for the /list-ad route and is protected (only accessible when logged in).
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';


const ListAd = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    location: '',
    category: '',
    condition: 'new',
    phoneNumber: '',
    sold: false,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 10) {
      toast.error(`You selected ${files.length} images. You can only upload ${10 - images.length} more images. Please reduce the number of images.`);
      e.target.value = ''; // Reset the file input
      return;
    }
  
    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
  
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });
  
    setImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs only for valid files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Payment functionality disabled - proceed directly to posting ad
    setIsSubmitting(true);
    
    try {
      // Upload images to Cloudinary first
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const formData = new FormData();
          formData.append('file', image);
          formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
          formData.append('folder', 'product_images');

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          const data = await response.json();
          return data.secure_url;
        })
      );

      const docRef = await addDoc(collection(db, 'ads'), {
        ...formData,
        price: Number(formData.price),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        userPhotoURL: user.photoURL,
        images: imageUrls,
        createdAt: serverTimestamp(),
        paymentStatus: 'waived', // Payment waived due to disabled functionality
        paymentAmount: 0,
        paymentMethod: 'none'
      });
      
      toast.success('Ad posted successfully!');
      navigate(`/ad/${docRef.id}`);
    } catch (error) {
      console.error('Error posting ad:', error);
      toast.error('Error posting ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">List an Ad</h1>
      
      {/* Payment Information - Disabled */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Free Ad Listing
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Ad listing is currently <span className="font-semibold">FREE</span> - no payment required!</p>
              <p className="mt-1">MoMo payment functionality has been temporarily disabled.</p>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div> 

        <div>
          <label className="block mb-1">Price (GHC)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Condition</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="sold"
            checked={formData.sold}
            onChange={(e) => setFormData(prev => ({ ...prev, sold: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Mark as sold</label>
        </div>

        <div>
          <label className="block mb-1">
            Product Images ({images.length}/10)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            {10 - images.length} images remaining
          </p>
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImages(images.filter((_, i) => i !== index));
                      setPreviews(previews.filter((_, i) => i !== index));
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting Ad...
            </>
          ) : (
            'Post Ad (Free)'
          )}
        </button>
      </form>

    </div>
  );
};

export default ListAd;