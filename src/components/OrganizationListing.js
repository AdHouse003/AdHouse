// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { useDocument } from 'react-firebase-hooks/firestore';
// import { doc } from 'firebase/firestore';
// import { db } from '../firebase';
// import ImageGallery from './ImageGallery';

// const OrganizationListing = () => {
//   const { id } = useParams();
//   const [value, loading, error] = useDocument(doc(db, 'organizationListings', id));

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;
//   if (!value?.exists()) return <div>Listing not found</div>;

//   const listing = value.data();

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Main Image */}
//         <div className="relative h-96">
//           <img
//             src={listing.images[0]}
//             alt={listing.organizationName}
//             className="w-full h-full object-cover"
//           />
//           {listing.verified && (
//             <div className="absolute top-4 right-4">
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                 Verified
//               </span>
//             </div>
//           )}
//         </div>

//         <div className="p-6">
//           {/* Organization Header */}
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold mb-2">{listing.organizationName}</h1>
//             <div className="flex items-center text-gray-600">
//               <span className="mr-4">{listing.organizationType}</span>
//               <span>•</span>
//               <span className="ml-4">{listing.location}</span>
//             </div>
//           </div>

//           {/* Quick Info Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             {/* Contact Card */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold mb-2">Contact</h3>
//               <div className="space-y-1">
//                 <p className="flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                   </svg>
//                   {listing.phoneNumber}
//                 </p>
//                 <p className="flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                   </svg>
//                   {listing.organizationEmail}
//                 </p>
//                 {listing.website && (
//                   <a
//                     href={listing.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center text-blue-600 hover:underline"
//                   >
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
//                       <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
//                     </svg>
//                     Visit Website
//                   </a>
//                 )}
//               </div>
//             </div>

//             {/* Services Card */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold mb-2">Main Service</h3>
//               <p>{listing.serviceOffered}</p>
//             </div>

//             {/* Location Card */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold mb-2">Location</h3>
//               <p>{listing.location}</p>
//             </div>
//           </div>

//           {/* Services & Prices */}
//           <div className="mb-8">
//             <h3 className="text-xl font-semibold mb-4">Services & Prices</h3>
//             <div className="bg-gray-50 rounded-lg overflow-hidden">
//               {listing.prices.map((price, index) => (
//                 <div
//                   key={index}
//                   className={`flex justify-between items-center p-4 ${
//                     index !== listing.prices.length - 1 ? 'border-b border-gray-200' : ''
//                   }`}
//                 >
//                   <span className="font-medium">{price.serviceName}</span>
//                   <span className="text-blue-600 font-semibold">
//                     GHC {price.price.toLocaleString()}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Business Description */}
//           <div className="mb-8">
//             <h3 className="text-xl font-semibold mb-4">About Us</h3>
//             <div className="bg-gray-50 p-6 rounded-lg">
//               <p className="text-gray-700 whitespace-pre-wrap">{listing.businessDescription}</p>
//             </div>
//           </div>

//           {/* Image Gallery */}
//           <div>
//             <h3 className="text-xl font-semibold mb-4">Gallery</h3>
//             <ImageGallery images={listing.images} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrganizationListing; 