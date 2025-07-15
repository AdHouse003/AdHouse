/*
  backend/test-payment.js
  -----------------------
  MoMo Payment Test Script - DISABLED
  
  This script tests the MoMo payment functionality.
  All functionality has been commented out as requested.
*/

// const axios = require('axios');
// require('dotenv').config();

// console.log('🔍 Payment API Test Suite\n');

// // Check environment variables
// console.log('API URL:', process.env.MOMO_API_URL);
// console.log('API Key:', process.env.MOMO_API_KEY ? 'Set' : 'Not set');
// console.log('User ID:', process.env.MOMO_USER_ID ? 'Set' : 'Not set');
// console.log('User Secret:', process.env.MOMO_USER_SECRET ? 'Set' : 'Not set');

// if (!process.env.MOMO_API_KEY || !process.env.MOMO_USER_ID || !process.env.MOMO_USER_SECRET) {
//   console.log('❌ Missing required environment variables');
//   console.log('📝 Please create a .env file with the required variables');
//   process.exit(1);
// }

// async function testMTNToken() {
//   try {
//     console.log('\n🔑 Testing MTN Token Generation...');
//     const response = await axios({
//       method: 'post',
//       url: `${process.env.MOMO_API_URL}/collection/v1_0/token/`,
//       headers: {
//         'Authorization': `Basic ${Buffer.from(`${process.env.MOMO_USER_ID}:${process.env.MOMO_USER_SECRET}`).toString('base64')}`,
//         'Ocp-Apim-Subscription-Key': process.env.MOMO_API_KEY
//       }
//     });
//     console.log('✅ MTN Token generated successfully');
//     return response.data.access_token;
//   } catch (error) {
//     console.error('❌ MTN Token generation failed:', error.response?.data || error.message);
//     throw error;
//   }
// }

// async function testLocalPayment() {
//   try {
//     console.log('\n💳 Testing Local Payment Endpoint...');
//     const response = await axios.post('http://localhost:5000/api/momo/pay', {
//       phoneNumber: '0556317768',
//       amount: 5,
//       provider: 'mtn'
//     });
//     console.log('✅ Local server payment endpoint working');
//     return response.data;
//   } catch (error) {
//     console.error('❌ Local payment test failed:', error.response?.data || error.message);
//     throw error;
//   }
// }

// async function runTests() {
//   try {
//     await testMTNToken();
//     await testLocalPayment();
//     console.log('\n🎉 All tests passed! Payment system should work.');
//   } catch (error) {
//     console.log('\n❌ Some tests failed. Please check your configuration.');
//   }
// }

// runTests();

// Disabled test script
console.log('🚫 MoMo Payment Test Script - DISABLED');
console.log('📝 Payment functionality has been commented out as requested.');
console.log('🔧 To re-enable, uncomment the code in this file.'); 