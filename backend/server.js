/*
  backend/server.js
  -----------------
  This is the main backend server for the AdHouse project. It handles:
    - Setting up the Express server
    - Handling CORS and JSON requests
    - Integrating with the MTN MoMo and Telecel (Vodafone Cash) payment APIs
    - Providing API endpoints for payment initiation and status checking
    - Managing environment variables for secure configuration
  
  The backend is responsible for processing payment requests from the frontend (React app),
  communicating with the mobile money APIs, and returning payment status to the frontend.
*/

const express = require('express'); // Import Express web framework
const cors = require('cors'); // Import CORS middleware to allow cross-origin requests
const axios = require('axios'); // Import Axios for making HTTP requests
require('dotenv').config(); // Load environment variables from .env file

const app = express(); // Create an Express app instance

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// --- Environment Variables and Payment API Setup ---
// These variables are loaded from your .env file for security and flexibility
const MOMO_API_URL = process.env.MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com'; // MTN MoMo API base URL
const MOMO_API_KEY = process.env.MOMO_API_KEY; // MTN MoMo Collection subscription key
const MOMO_USER_ID = process.env.MOMO_USER_ID; // Your API user UUID
const MOMO_USER_SECRET = process.env.MOMO_USER_SECRET; // Your API user secret (apiKey)
const RECIPIENT_NUMBER = '0556317768'; // The number that receives payments (your business wallet)

// Telecel (Vodafone Cash) API credentials (not fully implemented)
const TELECEL_API_URL = process.env.TELECEL_API_URL;
const TELECEL_API_KEY = process.env.TELECEL_API_KEY;
const TELECEL_USER_ID = process.env.TELECEL_USER_ID;
const TELECEL_USER_SECRET = process.env.TELECEL_USER_SECRET;

// If any required MTN credentials are missing, we run in development mode (simulated payments)
const isDevelopmentMode = !MOMO_API_KEY || !MOMO_USER_ID || !MOMO_USER_SECRET;

// Helper function to generate a random UUID (used for payment references)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// --- API Endpoints ---

// Create an API user (for MTN MoMo setup, usually done once) - DISABLED
// app.post('/api/momo/create-user', async (req, res) => {
//   try {
//     const referenceId = generateUUID(); // Generate a unique ID for the new API user
//     // Step 1: Create API User
//     await axios({
//       method: 'post',
//       url: `${MOMO_API_URL}/v1_0/apiuser`,
//       headers: {
//         'X-Reference-Id': referenceId,
//         'Content-Type': 'application/json',
//         'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//       },
//       data: {
//         providerCallbackHost: "http://localhost:5000"
//       }
//     });
//     // Step 2: Get API User details (optional, for verification)
//     const userDetails = await axios({
//       method: 'get',
//       url: `${MOMO_API_URL}/v1_0/apiuser/${referenceId}`,
//       headers: {
//         'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//       }
//     });
//     // Step 3: Create API Key for the user
//     const apiKey = await axios({
//       method: 'post',
//       url: `${MOMO_API_URL}/v1_0/apiuser/${referenceId}/apikey`,
//       headers: {
//         'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//       }
//     });
//     // Return the new user ID and API key to the client
//     res.json({
//       userId: referenceId,
//       apiKey: apiKey.data.apiKey
//     });
//   } catch (error) {
//     console.error('API User creation error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to create API user' });
//   }
// });

// Disabled MoMo payment endpoint
app.post('/api/momo/create-user', (req, res) => {
  res.status(503).json({ error: 'MoMo payment functionality has been disabled' });
});

// Main payment endpoint: Initiates a payment request to MTN MoMo or Telecel - DISABLED
// app.post('/api/momo/pay', async (req, res) => {
//   try {
//     // Extract payment details from the request body
//     const { phoneNumber, amount, provider = 'mtn' } = req.body;
//     const referenceId = generateUUID(); // Unique reference for this payment
//     // Validate phone number format for the selected provider
//     const cleanNumber = phoneNumber.replace(/\D/g, '');
//     let isValidNumber = false;
//     if (provider === 'mtn') {
//       isValidNumber = /^(024|054|055|059|025)\d{7}$/.test(cleanNumber);
//     } else if (provider === 'vodafone') {
//       isValidNumber = /^(050|020|010)\d{7}$/.test(cleanNumber);
//     }
//     if (!isValidNumber) {
//       return res.status(400).json({ 
//         error: `Invalid ${provider === 'mtn' ? 'MTN' : 'Vodafone'} phone number format` 
//       });
//     }
//     // If in development mode, simulate payment (for local testing)
//     if (isDevelopmentMode) {
//       console.log('⚠️  Running in development mode - simulating payment');
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       const paymentStatus = Math.random() > 0.1 ? 'SUCCESSFUL' : 'FAILED';
//       if (paymentStatus === 'SUCCESSFUL') {
//         res.json({ 
//           referenceId,
//           status: 'pending',
//           message: `[DEV MODE] Payment request sent to ${provider === 'mtn' ? 'MTN Mobile Money' : 'Telecel Cash'} number ${cleanNumber}`,
//           developmentMode: true
//         });
//       } else {
//         res.status(400).json({ 
//           error: '[DEV MODE] Payment failed. Please try again.' 
//         });
//       }
//       return;
//     }
//     // --- Real MTN MoMo Payment Flow ---
//     if (provider === 'mtn') {
//       try {
//         // Step 1: Get access token using your API user credentials
//         const tokenResponse = await axios({
//           method: 'post',
//           url: `${MOMO_API_URL}/collection/v1_0/token/`,
//           headers: {
//             'Authorization': `Basic ${Buffer.from(`${MOMO_USER_ID}:${MOMO_USER_SECRET}`).toString('base64')}`,
//             'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//           }
//         });
//         const accessToken = tokenResponse.data.access_token;
//         // Step 2: Make payment request to the recipient number
//         await axios({
//           method: 'post',
//           url: `${MOMO_API_URL}/collection/v1_0/requesttopay`,
//           headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'X-Reference-Id': referenceId,
//             'X-Target-Environment': 'sandbox', // Use 'sandbox' for testing
//             'Content-Type': 'application/json',
//             'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//           },
//           data: {
//             amount: amount.toString(),
//             currency: "GHS",
//             externalId: Date.now().toString(),
//             payer: {
//               partyIdType: "MSISDN",
//               partyId: cleanNumber
//             },
//             payerMessage: "Payment for Ad Listing on AdHouse",
//             payeeNote: "Ad Listing Payment"
//           }
//         });
//         // Respond to the frontend that payment was initiated
//         res.json({ 
//           referenceId,
//           status: 'pending',
//           message: `Payment request sent to MTN Mobile Money number ${cleanNumber}`
//         });
//       } catch (error) {
//         // If something goes wrong, log and return the error
//         console.error('MTN Payment error:', error.response?.data || error.message);
//         res.status(500).json({ error: 'Failed to initiate MTN payment' });
//       }
//     } else if (provider === 'vodafone') {
//       // Placeholder for Telecel/Vodafone Cash integration
//       try {
//         if (!TELECEL_API_URL || !TELECEL_API_KEY) {
//           return res.status(500).json({ error: 'Telecel API not configured' });
//         }
//         // Simulate Telecel payment for now
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         res.json({ 
//           referenceId,
//           status: 'pending',
//           message: `Payment request sent to Telecel Cash number ${cleanNumber}`
//         });
//       } catch (error) {
//         console.error('Telecel Payment error:', error.response?.data || error.message);
//         res.status(500).json({ error: 'Failed to initiate Telecel payment' });
//       }
//     }
//   } catch (error) {
//     console.error('Payment error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to initiate payment' });
//   }
// });

// Disabled MoMo payment endpoint
app.post('/api/momo/pay', (req, res) => {
  res.status(503).json({ error: 'MoMo payment functionality has been disabled' });
});

// Endpoint to check the status of a payment (polled by the frontend) - DISABLED
// app.get('/api/momo/status/:referenceId', async (req, res) => {
//   try {
//     const { referenceId } = req.params;
//     // If in development mode, simulate status check
//     if (isDevelopmentMode) {
//       console.log('⚠️  Running in development mode - simulating status check');
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       const status = Math.random() > 0.2 ? 'SUCCESSFUL' : 'PENDING';
//       res.json({
//         status: status,
//         referenceId: referenceId,
//         amount: 5,
//         currency: 'GHS',
//         developmentMode: true
//       });
//       return;
//     }
//     // --- Real MTN MoMo Status Check ---
//     // Step 1: Get access token
//     const tokenResponse = await axios({
//       method: 'post',
//       url: `${MOMO_API_URL}/collection/v1_0/token/`,
//       headers: {
//         'Authorization': `Basic ${Buffer.from(`${MOMO_USER_ID}:${MOMO_USER_SECRET}`).toString('base64')}`,
//         'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//       }
//     });
//     const accessToken = tokenResponse.data.access_token;
//     // Step 2: Check payment status using the referenceId
//     const response = await axios({
//       method: 'get',
//       url: `${MOMO_API_URL}/collection/v1_0/requesttopay/${referenceId}`,
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'X-Target-Environment': 'sandbox',
//         'Ocp-Apim-Subscription-Key': MOMO_API_KEY
//       }
//     });
//     // Return the payment status to the frontend
//     res.json(response.data);
//   } catch (error) {
//     console.error('Status check error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to check payment status' });
//   }
// });

// Disabled MoMo payment status endpoint
app.get('/api/momo/status/:referenceId', (req, res) => {
  res.status(503).json({ error: 'MoMo payment functionality has been disabled' });
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💰 Recipient number: ${RECIPIENT_NUMBER}`);
  if (isDevelopmentMode) {
    console.log('⚠️  DEVELOPMENT MODE: No API credentials found');
    console.log('📝 To use real payments, create a .env file with MTN API credentials');
    console.log('🔗 See backend/README.md for setup instructions');
  } else {
    console.log('✅ PRODUCTION MODE: API credentials configured');
  }
});