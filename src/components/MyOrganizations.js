// import React, { useState, useEffect } from 'react';
// import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
// import { db, auth } from '../firebase';
// import { Link } from 'react-router-dom';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { toast } from 'react-toastify';

// const MyOrganizations = () => {
//   const [user] = useAuthState(auth);
//   const [organizations, setOrganizations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user) {
//       fetchMyOrganizations();
//     }
//   }, [user]);

//   const fetchMyOrganizations = async () => {
//     try {
//       const q = query(
//         collection(db, 'organizationListings'),
//         where('userId', '==', user.uid)
//       );
//       const querySnapshot = await getDocs(q);
//       const orgs = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setOrganizations(orgs);
//     } catch (error) {
//       console.error('Error fetching organizations:', error);
//       toast.error('Failed to fetch your organizations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (orgId) => {
//     if (window.confirm('Are you sure you want to delete this organization listing?')) {
//       try {
//         await deleteDoc(doc(db, 'organizationListings', orgId));
//         setOrganizations(prev => prev.filter(org => org.id !== orgId));
//         toast.success('Organization listing deleted successfully');
//       } catch (error) {
//         console.error('Error deleting organization:', error);
//         toast.error('Failed to delete organization');
//       }
//     }
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
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">My Organizations</h1>
//         <Link
//           to="/list-organization"
//           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//         >
//           Create New Organization
//         </Link>
//       </div>

//       {organizations.length === 0 ? (
//         <div className="text-center py-8">
//           <p className="text-gray-600 mb-4">You haven't created any organization listings yet.</p>
//           <Link
//             to="/list-organization"
//             className="text-blue-500 hover:text-blue-600 underline"
//           >
//             Create your first organization listing
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {organizations.map((org) => (
//             <div key={org.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//               <div className="relative h-48">
//                 <img
//                   src={org.images?.[0] || '/placeholder.png'}
//                   alt={org.organizationName}
//                   className="w-full h-full object-cover"
//                 />
//                 {org.verified && (
//                   <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
//                     Verified
//                   </div>
//                 )}
//               </div>
              
//               <div className="p-4">
//                 <h2 className="text-xl font-semibold mb-2">{org.organizationName}</h2>
//                 <p className="text-gray-600 mb-2">{org.organizationType}</p>
//                 <p className="text-gray-700 line-clamp-2">{org.serviceOffered}</p>
                
//                 <div className="mt-4 flex justify-between items-center">
//                   <Link
//                     to={`/organization/${org.id}`}
//                     className="text-blue-500 hover:text-blue-600"
//                   >
//                     View Details
//                   </Link>
                  
//                   <div className="flex space-x-2">
//                     <Link
//                       to={`/edit-organization/${org.id}`}
//                       className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                     >
//                       Edit
//                     </Link>
//                     <button
//                       onClick={() => handleDelete(org.id)}
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyOrganizations; 