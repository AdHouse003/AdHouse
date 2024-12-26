import React, { useState } from 'react';
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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const docRef = await addDoc(collection(db, 'ads'), {
        ...formData,
        price: Number(formData.price),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        userPhotoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
      
      toast.success('Ad posted successfully!');
      navigate(`/ad/${docRef.id}`);
    } catch (error) {
      console.error('Error posting ad:', error);
      toast.error('Error posting ad. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">List an Ad</h1>
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Post Ad
        </button>
      </form>
    </div>
  );
};

export default ListAd;