# Payment API Setup - DISABLED

This backend handles MTN Mobile Money and Telecel Cash payments for ad listings.
**⚠️ MoMo payment functionality has been temporarily disabled.**

## ⚠️ DISABLED NOTICE

All MoMo payment functionality has been commented out as requested. The endpoints will return 503 errors with "MoMo payment functionality has been disabled" messages.

To re-enable payment functionality:
1. Uncomment the code in `server.js` (lines with payment endpoints)
2. Uncomment the code in `test-payment.js`
3. Restore the original functionality in the frontend components

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MTN Mobile Money API Credentials
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_API_KEY=your_mtn_api_key_here
MOMO_USER_ID=your_mtn_user_id_here
MOMO_USER_SECRET=your_mtn_user_secret_here

# Telecel API Credentials (for Vodafone Cash)
TELECEL_API_URL=https://api.telecel.com
TELECEL_API_KEY=your_telecel_api_key_here
TELECEL_USER_ID=your_telecel_user_id_here
TELECEL_USER_SECRET=your_telecel_user_secret_here

# Server Configuration
PORT=5000
```

## Getting MTN API Credentials

1. Register at [MTN Developer Portal](https://momodeveloper.mtn.com/)
2. Create a new app
3. Get your API Key, User ID, and User Secret
4. Set up your callback URL

## Getting Telecel API Credentials

1. Contact Telecel Ghana for API access
2. Get your API credentials
3. Configure the API endpoints

## Installation

```bash
cd backend
npm install
npm start
```

## Payment Flow

1. User selects payment method (MTN/Telecel)
2. Enters phone number
3. Payment request sent to recipient: 0556317768
4. User receives payment prompt on phone
5. Payment status checked every 3 seconds
6. Ad posted after successful payment

## API Endpoints

- `POST /api/momo/pay` - Initiate payment
- `GET /api/momo/status/:referenceId` - Check payment status
- `POST /api/momo/create-user` - Create MTN API user 