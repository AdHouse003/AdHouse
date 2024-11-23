const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MTN MoMo API credentials
const MOMO_API_URL = process.env.MOMO_API_URL;
const MOMO_API_KEY = process.env.MOMO_API_KEY;

// Create API User first
app.post('/api/momo/create-user', async (req, res) => {
  try {
    const referenceId = generateUUID();
    
    // Step 1: Create API User
    await axios({
      method: 'post',
      url: `${MOMO_API_URL}/v1_0/apiuser`,
      headers: {
        'X-Reference-Id': referenceId,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      },
      data: {
        providerCallbackHost: "http://localhost:5000"
      }
    });

    // Step 2: Get API User details
    const userDetails = await axios({
      method: 'get',
      url: `${MOMO_API_URL}/v1_0/apiuser/${referenceId}`,
      headers: {
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      }
    });

    // Step 3: Create API Key for the user
    const apiKey = await axios({
      method: 'post',
      url: `${MOMO_API_URL}/v1_0/apiuser/${referenceId}/apikey`,
      headers: {
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      }
    });

    res.json({
      userId: referenceId,
      apiKey: apiKey.data.apiKey
    });
  } catch (error) {
    console.error('API User creation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create API user' });
  }
});

// Then use these credentials for payments
app.post('/api/momo/pay', async (req, res) => {
  try {
    const { phoneNumber, amount, userId, apiKey } = req.body;
    const referenceId = generateUUID();
    
    // Get access token using the created API user credentials
    const tokenResponse = await axios({
      method: 'post',
      url: `${MOMO_API_URL}/collection/v1_0/token/`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Make payment request
    await axios({
      method: 'post',
      url: `${MOMO_API_URL}/collection/v1_0/requesttopay`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      },
      data: {
        amount: amount.toString(),
        currency: "GHS",
        externalId: Date.now().toString(),
        payer: {
          partyIdType: "MSISDN",
          partyId: phoneNumber
        },
        payerMessage: "Payment for Ad Listing on AdHouse",
        payeeNote: "Ad Listing Payment"
      }
    });

    res.json({ 
      referenceId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Check payment status
app.get('/api/momo/status/:referenceId', async (req, res) => {
  try {
    const { referenceId } = req.params;
    
    // Get access token first
    const tokenResponse = await axios({
      method: 'post',
      url: `${MOMO_API_URL}/collection/v1_0/token/`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${MOMO_USER_ID}:${MOMO_USER_SECRET}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const response = await axios({
      method: 'get',
      url: `${MOMO_API_URL}/collection/v1_0/requesttopay/${referenceId}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Status check error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}