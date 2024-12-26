import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Get organizations by type
export const getOrganizationsByType = async (type, lastDoc = null, itemsPerPage = 10) => {
  try {
    let q = query(
      collection(db, 'organizationListings'),
      where('organizationType', '==', type),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(itemsPerPage)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      organizations: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

// Get verified organizations
export const getVerifiedOrganizations = async (lastDoc = null, itemsPerPage = 10) => {
  try {
    let q = query(
      collection(db, 'organizationListings'),
      where('verified', '==', true),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(itemsPerPage)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      organizations: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching verified organizations:', error);
    throw error;
  }
};

// Get organizations by location
export const getOrganizationsByLocation = async (location, lastDoc = null, itemsPerPage = 10) => {
  try {
    let q = query(
      collection(db, 'organizationListings'),
      where('location', '==', location),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(itemsPerPage)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      organizations: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching organizations by location:', error);
    throw error;
  }
};

// Search organizations
export const searchOrganizations = async (searchTerm, lastDoc = null, itemsPerPage = 10) => {
  try {
    const searchTermLower = searchTerm.toLowerCase();
    let q = query(
      collection(db, 'organizationListings'),
      where('searchKeywords', 'array-contains', searchTermLower),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(itemsPerPage)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      organizations: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error searching organizations:', error);
    throw error;
  }
}; 