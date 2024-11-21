import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Home = () => {
  const [ads, setAds] = useState([]);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ads:', error);
    } else {
      setAds(data);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div>
      <h1>Available Ads</h1>
      <div>
        {ads.map((ad) => (
          <div key={ad.id}>
            <h3>{ad.name}</h3>
            <p>{ad.description}</p>
            <p>Price: GHC {ad.price}</p>
            <p>Condition: {ad.condition}</p>
            {ad.photo_url && <img src={ad.photo_url} alt={ad.name} width="200" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
