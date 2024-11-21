const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post('/api/pay', async (req, res) => {
  const { amount, phoneNumber } = req.body;
  try {
    const response = await axios.post('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {
      amount,
      currency: 'GHS',
      externalId: '12345',
      payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
      payerMessage: 'AdHouse Payment',
      payeeNote: 'Thank you for your payment',
    }, {
      headers: {
        'Ocp-Apim-Subscription-Key': 'YOUR_SUBSCRIPTION_KEY',
        'X-Reference-Id': 'YOUR_REFERENCE_ID',
        'X-Target-Environment': 'sandbox',
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
