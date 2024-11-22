import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ListAd = () => {
  const [adData, setAdData] = useState({
    name: '',
    description: '',
    price: '',
    condition: 'New',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAdData({
      ...adData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save ad metadata to Firestore
      await addDoc(collection(db, 'ads'), {
        ...adData,
        createdAt: new Date(),
      });

      alert('Ad listed successfully!');
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error('Error listing ad:', error);
      alert('Failed to list ad. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">List Your Ad</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Ad Name"
          value={adData.name}
          onChange={handleChange}
          className="block w-full border p-2"
          required
        />
        <textarea
          name="description"
          placeholder="Ad Description"
          value={adData.description}
          onChange={handleChange}
          className="block w-full border p-2"
          required
        ></textarea>
        <input
          type="number"
          name="price"
          placeholder="Price (GHC)"
          value={adData.price}
          onChange={handleChange}
          className="block w-full border p-2"
          required
        />
        <select
          name="condition"
          value={adData.condition}
          onChange={handleChange}
          className="block w-full border p-2"
          required
        >
          <option value="New">New</option>
          <option value="Fairly New">Fairly New</option>
          <option value="Moderate">Moderate</option>
          <option value="Old">Old</option>
        </select>
        <button
          type="submit"
          className="block w-full bg-blue-500 text-white p-2"
          disabled={loading}
        >
          {loading ? 'Listing...' : 'List Ad'}
        </button>
      </form>
    </div>
  );
};

export default ListAd;
