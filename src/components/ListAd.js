import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ListAd = () => {
  const [adData, setAdData] = useState({
    name: '',
    description: '',
    price: '',
    condition: '',
  });
  const [file, setFile] = useState(null);

  const uploadAd = async () => {
    if (!file) {
      alert('Please upload a photo!');
      return;
    }

    const { data: fileUpload, error: uploadError } = await supabase
      .storage
      .from('ads-photos')
      .upload(`ads/${Date.now()}_${file.name}`, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return;
    }

    const photoUrl = supabase.storage.from('ads-photos').getPublicUrl(fileUpload.path).data.publicUrl;

    const { error } = await supabase
      .from('ads')
      .insert([{ ...adData, photo_url: photoUrl }]);

    if (error) {
      console.error('Error adding ad:', error);
    } else {
      alert('Ad uploaded successfully!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">List Your Ad</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Name</label>
          <input
            type="text"
            placeholder="Ad Name"
            value={adData.name}
            onChange={(e) => setAdData({ ...adData, name: e.target.value })}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Description</label>
          <textarea
            placeholder="Ad Description"
            value={adData.description}
            onChange={(e) => setAdData({ ...adData, description: e.target.value })}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Price (GHC)</label>
          <input
            type="number"
            placeholder="Price"
            value={adData.price}
            onChange={(e) => setAdData({ ...adData, price: e.target.value })}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Condition</label>
          <select
            value={adData.condition}
            onChange={(e) => setAdData({ ...adData, condition: e.target.value })}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="new">New</option>
            <option value="fairly new">Fairly New</option>
            <option value="moderate">Moderate</option>
            <option value="old">Old</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Upload Photo</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          onClick={uploadAd}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Upload Ad
        </button>
      </div>
    </div>
  );
};

export default ListAd;
