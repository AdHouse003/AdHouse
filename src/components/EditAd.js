/*
  src/components/EditAd.js
  ------------------------
  This component allows users to edit an existing ad they have posted.
  - Fetches the ad data from Firestore based on the ad ID in the URL
  - Displays a form pre-filled with the ad's current details
  - Allows the user to update ad information and images
  - Handles form submission, validation, and loading state
  - Integrates with Firestore to update the ad document
  - Shows loading and error messages as needed
  
  This is used in App.js for the /edit-ad/:id route and is protected (only accessible when logged in).
*/

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';

const EditAd = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [ad, setAd] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    location: '',
    condition: 'New',
    negotiable: false,
    sold: false,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    // Check authentication first
    if (loading) return;
    
    if (!user) {
      toast.error('Please login to edit ads');
      navigate('/login');
      return;
    }

    const fetchAd = async () => {
      try {
        const adRef = doc(db, 'ads', id);
        const adSnap = await getDoc(adRef);
        
        if (adSnap.exists()) {
          const adData = adSnap.data();
          
          // Check if the user owns this ad
          if (adData.userId !== user.uid) {
            toast.error('You do not have permission to edit this ad');
            navigate('/');
            return;
          }
          
          setAd(adData);
          setFormData(adData);
          setExistingImages(adData.images || []); // Set existing images
        } else {
          toast.error('Ad not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        toast.error('Error loading ad');
        navigate('/');
      } finally {
        setPageLoading(false);
      }
    };

    fetchAd();
  }, [id, user, loading, navigate]);

  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length + existingImages.length > 10) {
      toast.error(`You can only upload ${10 - existingImages.length} more images. Please reduce the number of images.`);
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
    
    // Create preview URLs for valid files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeImage = (index, type) => {
    if (type === 'existing') {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
      setPreviews(prev => prev.filter((_, i) => i !== index));
      URL.revokeObjectURL(previews[index]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Upload new images to Cloudinary first
      const newImageUrls = await Promise.all(
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

      const adRef = doc(db, 'ads', id);
      await updateDoc(adRef, {
        ...formData,
        price: Number(formData.price),
        images: [...existingImages, ...newImageUrls],
        updatedAt: new Date(),
      });

      toast.success('Ad updated successfully');
      navigate('/my-ads');
    } catch (error) {
      console.error('Error updating ad:', error);
      toast.error('Failed to update ad');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!ad) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Ad not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Ad</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (GHC)</label>
          <input
            type="number"
            name="price"
            value={formData.price || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select
            name="condition"
            value={formData.condition || 'New'}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="negotiable"
            checked={formData.negotiable || false}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label className="ml-2 block text-sm text-gray-900">Price is negotiable</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="sold"
            checked={formData.sold || false}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label className="ml-2 block text-sm text-gray-900">Ad is sold</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images ({existingImages.length + images.length}/10)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            {10 - (existingImages.length + images.length)} images remaining
          </p>
          
          {/* Display existing images */}
          {existingImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h3>
              <div className="grid grid-cols-5 gap-2">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, 'existing')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-150 active:scale-95 active:shadow-inner"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display new image previews */}
          {previews.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
              <div className="grid grid-cols-5 gap-2">
                {previews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, 'new')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-150 active:scale-95 active:shadow-inner"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-ads')}
            disabled={isSubmitting}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-150 active:scale-95 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-150 active:scale-95 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Ad'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAd;