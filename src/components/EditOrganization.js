/*
  src/components/EditOrganization.js
  ----------------------------------
  This component allows users to edit an existing organization they own.
  - Fetches organization data from Firestore based on the organization ID in the URL
  - Displays a form pre-filled with the organization's current details
  - Allows the user to update organization information
  - Handles form submission, validation, and loading state
  - Integrates with Firestore to update the organization document
  - Shows loading and error messages as needed
  
  This is used in App.js for the /edit-organization/:id route and is protected (only accessible when logged in and authorized).
*/

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase';
// import { toast } from 'react-toastify';

// const EditOrganization = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     organizationName: '',
//     organizationType: '',
//     organizationEmail: '',
//     serviceOffered: '',
//     businessDescription: '',
//     location: '',
//     phoneNumber: '',
//     website: ''
//   });

//   useEffect(() => {
//     fetchOrganization();
//   }, [id]);

//   const fetchOrganization = async () => {
//     try {
//       const docRef = doc(db, 'organizationListings', id);
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists()) {
//         setFormData(docSnap.data());
//       } else {
//         toast.error('Organization not found');
//         navigate('/my-organizations');
//       }
//     } catch (error) {
//       console.error('Error fetching organization:', error);
//       toast.error('Failed to fetch organization details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       await updateDoc(doc(db, 'organizationListings', id), formData);
//       toast.success('Organization updated successfully');
//       navigate('/my-organizations');
//     } catch (error) {
//       console.error('Error updating organization:', error);
//       toast.error('Failed to update organization');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Edit Organization</h1>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Form fields */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Organization Name
//             </label>
//             <input
//               type="text"
//               name="organizationName"
//               value={formData.organizationName}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Add other form fields similarly */}

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
//               loading ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             {loading ? 'Updating...' : 'Update Organization'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditOrganization; 