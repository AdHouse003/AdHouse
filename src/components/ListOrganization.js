// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db, auth } from '../firebase';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { toast } from 'react-toastify';

// const ListOrganization = () => {
//   const [user] = useAuthState(auth);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     organizationName: '',
//     organizationType: '',
//     organizationEmail: '',
//     serviceOffered: '',
//     businessDescription: '',
//     location: '',
//     phoneNumber: '',
//     website: '',
//     images: []
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!user) {
//       toast.error('Please sign in to create an organization listing');
//       return;
//     }

//     try {
//       setLoading(true);
//       const docRef = await addDoc(collection(db, 'organizationListings'), {
//         ...formData,
//         userId: user.uid,
//         createdAt: serverTimestamp(),
//         status: 'active'
//       });
      
//       toast.success('Organization listed successfully!');
//       navigate(`/organization/${docRef.id}`);
//     } catch (error) {
//       console.error('Error creating organization listing:', error);
//       toast.error('Failed to create organization listing');
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

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Create Organization Listing</h1>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Add your form fields here */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
//           >
//             {loading ? 'Creating...' : 'Create Organization Listing'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ListOrganization; 