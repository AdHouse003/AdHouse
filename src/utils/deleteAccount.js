import { auth } from '../firebase';
import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const deleteUserAds = async (userId) => {
  const adsRef = collection(db, 'ads');
  const q = query(adsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

const deleteUserMessages = async (userId) => {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userId = user.uid;

  try {
    // Delete user's ads
    await deleteUserAds(userId);
    // Delete user's messages
    await deleteUserMessages(userId);
    // Delete user profile
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    // Delete user account
    await user.delete();
    
    console.log('User account and associated data deleted successfully.');
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new Error('Failed to delete account');
  }
}; 