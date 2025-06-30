import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartService from '../services/CartService'; // Import instance của service

const CartPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartStored, setCartStored] = useState(false);
  
  const navigate = useNavigate(); // Khởi tạo hook useNavigate

  useEffect(() => {
    const fetchAndStoreCart = async () => {
      setLoading(true);
      setError(null);
      setCartStored(false);

      try {
        console.log('*Attempting to fetch cart data and save to localStorage...');
        const cartData = await CartService.getCartDataForLocalStorage(); 

        localStorage.setItem('cartData', JSON.stringify(cartData));
        console.log('*Cart data successfully saved to localStorage:', cartData);
        setCartStored(true);
      } catch (err) {
        console.error('!!!Failed to process cart data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndStoreCart();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>Cart Data Processing Page</h1>
      
      {loading && <p style={{ color: 'blue' }}>Processing cart data for Local Storage...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message || 'An unknown error occurred during cart processing.'}</p>}
      {!loading && !error && cartStored && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>Cart data successfully stored in Local Storage!</p>
      )}
      {!loading && !error && !cartStored && !error && (
        <p style={{ color: 'orange' }}>No cart data found or processed for the fixed user.</p>
      )}

      <button
        onClick={() => navigate('/order')}
        style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Go to Order Page
      </button>

    </div>
  );
};

export default CartPage;