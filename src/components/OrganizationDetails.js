// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase';

// const OrganizationDetails = () => {
//   const { id } = useParams();
//   const [organization, setOrganization] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchOrganizationDetails();
//   }, [id]);

//   const fetchOrganizationDetails = async () => {
//     try {
//       const docRef = doc(db, 'organizationListings', id);
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists()) {
//         setOrganization({ id: docSnap.id, ...docSnap.data() });
//       }
//     } catch (error) {
//       console.error('Error fetching organization details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!organization) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <p className="text-center text-gray-600">Organization not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="relative h-96">
//           <img
//             src={organization.images?.[0] || '/placeholder.png'}
//             alt={organization.organizationName}
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="p-6">
//           <h1 className="text-3xl font-bold mb-4">{organization.organizationName}</h1>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h2 className="text-xl font-semibold mb-2">About</h2>
//               <p className="text-gray-600">{organization.businessDescription}</p>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
//               <p className="text-gray-600">Email: {organization.organizationEmail}</p>
//               <p className="text-gray-600">Phone: {organization.phoneNumber}</p>
//               <p className="text-gray-600">Location: {organization.location}</p>
//               {organization.website && (
//                 <p className="text-gray-600">
//                   Website:{' '}
//                   <a
//                     href={organization.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500 hover:underline"
//                   >
//                     {organization.website}
//                   </a>
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrganizationDetails; 