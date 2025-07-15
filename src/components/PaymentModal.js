/*
  src/components/PaymentModal.js
  ------------------------------
  Payment Modal Component - DISABLED
  
  This component handles MoMo payment functionality for ad listings.
  All functionality has been commented out as requested.
*/

// import React, { useState, useEffect } from 'react';
// import { initiateMomoPayment, checkPaymentStatus, validatePhoneNumber, formatPhoneNumber } from '../utils/momoPayment';
// import { toast } from 'react-hot-toast';

// const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, adData }) => {
//   const [paymentMethod, setPaymentMethod] = useState('mtn');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState('pending');
//   const [referenceId, setReferenceId] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (isOpen) {
//       setPhoneNumber('');
//       setPaymentMethod('mtn');
//       setPaymentStatus('pending');
//       setReferenceId(null);
//       setError('');
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     let interval;
//     if (referenceId && paymentStatus === 'pending') {
//       interval = setInterval(async () => {
//         try {
//           const status = await checkPaymentStatus(referenceId);
//           setPaymentStatus(status.status);
          
//           if (status.paid) {
//             clearInterval(interval);
//             toast.success('Payment successful! Your ad will be posted.');
//             onPaymentSuccess();
//           } else if (status.status === 'FAILED') {
//             clearInterval(interval);
//             setError('Payment failed. Please try again.');
//             setIsProcessing(false);
//           }
//         } catch (error) {
//           console.error('Error checking payment status:', error);
//         }
//       }, 3000); // Check every 3 seconds
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [referenceId, paymentStatus, onPaymentSuccess]);

//   const handlePayment = async () => {
//     if (!phoneNumber.trim()) {
//       setError('Please enter your phone number');
//       return;
//     }

//     if (!validatePhoneNumber(phoneNumber, paymentMethod)) {
//       setError(`Please enter a valid ${paymentMethod === 'mtn' ? 'MTN' : 'Vodafone'} phone number`);
//       return;
//     }

//     setIsProcessing(true);
//     setError('');

//     try {
//       const response = await initiateMomoPayment(phoneNumber, paymentMethod);
//       setReferenceId(response.referenceId);
//       setPaymentStatus('pending');
      
//       const formattedNumber = formatPhoneNumber(phoneNumber);
//       toast.success(`Payment request sent to ${formattedNumber}. Please check your phone and approve the payment.`);
//     } catch (error) {
//       console.error('Payment error:', error);
//       setError(error.message || 'Failed to initiate payment. Please try again.');
//       setIsProcessing(false);
//     }
//   };

//   const handleClose = () => {
//     if (!isProcessing || paymentStatus === 'SUCCESSFUL') {
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Payment Required</h2>
//           <button
//             onClick={handleClose}
//             disabled={isProcessing && paymentStatus !== 'SUCCESSFUL'}
//             className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="mb-4">
//           <p className="text-gray-600 mb-2">
//             To list your ad, a payment of <span className="font-bold text-green-600">GHC 5.00</span> is required.
//           </p>
//           <p className="text-sm text-gray-500">
//             This helps us maintain quality listings and prevent spam.
//           </p>
//         </div>

//         {paymentStatus === 'SUCCESSFUL' ? (
//           <div className="text-center py-4">
//             <div className="text-green-500 text-4xl mb-2">✓</div>
//             <p className="text-green-600 font-semibold">Payment Successful!</p>
//             <p className="text-gray-600 text-sm">Your ad will be posted shortly.</p>
//             <button
//               onClick={handleClose}
//               className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
//             >
//               Continue
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Payment Method
//               </label>
//               <div className="grid grid-cols-2 gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setPaymentMethod('mtn')}
//                   className={`p-3 border rounded-lg text-center transition-colors ${
//                     paymentMethod === 'mtn'
//                       ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
//                       : 'border-gray-300 hover:border-gray-400'
//                   }`}
//                 >
//                   <div className="font-semibold">MTN Mobile Money</div>
//                   <div className="text-xs text-gray-500">024, 054, 055, 059, 025</div>
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setPaymentMethod('vodafone')}
//                   className={`p-3 border rounded-lg text-center transition-colors ${
//                     paymentMethod === 'vodafone'
//                       ? 'border-red-500 bg-red-50 text-red-700'
//                       : 'border-gray-300 hover:border-gray-400'
//                   }`}
//                 >
//                   <div className="font-semibold">Vodafone Cash</div>
//                   <div className="text-xs text-gray-500">050, 020, 010</div>
//                 </button>
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number ({paymentMethod === 'mtn' ? 'MTN' : 'Vodafone'})
//               </label>
//               <input
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 placeholder={paymentMethod === 'mtn' ? '0241234567' : '0501234567'}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={isProcessing}
//               />
//             </div>

//             {error && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <p className="text-red-600 text-sm">{error}</p>
//               </div>
//             )}

//             {paymentStatus === 'pending' && referenceId && (
//               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-blue-600 text-sm">
//                   Payment request sent! Please check your phone and approve the payment.
//                 </p>
//                 <div className="mt-2 flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
//                   <span className="text-blue-600 text-xs">Checking payment status...</span>
//                 </div>
//               </div>
//             )}

//             <div className="flex space-x-3">
//               <button
//                 onClick={handleClose}
//                 disabled={isProcessing}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handlePayment}
//                 disabled={isProcessing || !phoneNumber.trim()}
//                 className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isProcessing ? 'Processing...' : 'Pay GHC 5.00'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// Disabled PaymentModal component
const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, adData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Payment Disabled</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 font-semibold mb-2">MoMo Payment Functionality Disabled</p>
          <p className="text-gray-600 text-sm mb-4">
            Payment functionality has been temporarily disabled. 
            Please contact support for assistance.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 