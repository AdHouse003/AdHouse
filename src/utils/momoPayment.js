const API_URL = 'http://localhost:5000/api';

export const initiateMomoPayment = async (phoneNumber) => {
  try {
    const response = await fetch(`${API_URL}/momo/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        amount: 10
      })
    });

    if (!response.ok) {
      throw new Error('Payment initiation failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Momo payment error:', error);
    throw new Error('Failed to initiate payment');
  }
};

export const checkPaymentStatus = async (referenceId) => {
  try {
    const response = await fetch(`${API_URL}/momo/status/${referenceId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    const data = await response.json();
    return {
      status: data.status,
      paid: data.status === 'SUCCESSFUL'
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    throw new Error('Failed to check payment status');
  }
};