/*
  src/utils/momoPayment.js
  ------------------------
  MoMo Payment Utilities - DISABLED
  
  This file contains utility functions for MTN Mobile Money and Vodafone Cash payments.
  All functionality has been commented out as requested.
*/

// const API_URL = 'http://localhost:5000/api';

// export const initiateMomoPayment = async (phoneNumber, provider = 'mtn') => {
//   try {
//     console.log(`Initiating ${provider} payment for ${phoneNumber}`);
    
//     const response = await fetch(`${API_URL}/momo/pay`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         phoneNumber,
//         amount: 5, // 5 Ghana Cedis for ad listing
//         provider: provider // 'mtn' or 'vodafone'
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('Payment initiation failed:', errorData);
//       throw new Error(errorData.error || 'Payment initiation failed');
//     }

//     const data = await response.json();
//     console.log('Payment initiated successfully:', data);
//     return data;
//   } catch (error) {
//     console.error('Momo payment error:', error);
//     throw new Error(error.message || 'Failed to initiate payment');
//   }
// };

// export const checkPaymentStatus = async (referenceId) => {
//   try {
//     console.log(`Checking payment status for ${referenceId}`);
    
//     const response = await fetch(`${API_URL}/momo/status/${referenceId}`);
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('Payment status check failed:', errorData);
//       throw new Error(errorData.error || 'Failed to check payment status');
//     }

//     const data = await response.json();
//     console.log('Payment status:', data);
    
//     return {
//       status: data.status,
//       paid: data.status === 'SUCCESSFUL',
//       amount: data.amount,
//       currency: data.currency
//     };
//   } catch (error) {
//     console.error('Payment status check error:', error);
//     throw new Error(error.message || 'Failed to check payment status');
//   }
// };

// Helper function to validate phone number format
// export const validatePhoneNumber = (phoneNumber, provider) => {
//   // Remove any non-digit characters
//   const cleanNumber = phoneNumber.replace(/\D/g, '');
  
//   if (provider === 'mtn') {
//     // MTN numbers start with 024, 054, 055, 059, 025
//     return /^(024|054|055|059|025)\d{7}$/.test(cleanNumber);
//   } else if (provider === 'vodafone') {
//     // Vodafone numbers start with 050, 020, 010
//     return /^(050|020|010)\d{7}$/.test(cleanNumber);
//   }
  
//   return false;
// };

// Helper function to format phone number for display
// export const formatPhoneNumber = (phoneNumber) => {
//   const cleanNumber = phoneNumber.replace(/\D/g, '');
//   if (cleanNumber.length === 10) {
//     return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6)}`;
//   }
//   return phoneNumber;
// };

// Placeholder exports to prevent import errors
export const initiateMomoPayment = async () => {
  throw new Error('MoMo payment functionality has been disabled');
};

export const checkPaymentStatus = async () => {
  throw new Error('MoMo payment functionality has been disabled');
};

export const validatePhoneNumber = () => {
  return false;
};

export const formatPhoneNumber = (phoneNumber) => {
  return phoneNumber;
};