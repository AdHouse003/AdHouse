import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import for Storage
import { GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyDViKsw6ejYz5-sz-_8BM7j3_ImfXuoz_k",
    authDomain: "adhouse-881c0.firebaseapp.com",
    databaseURL: "https://adhouse-881c0-default-rtdb.firebaseio.com",
    projectId: "adhouse-881c0",
    storageBucket: "adhouse-881c0.firebasestorage.app",
    messagingSenderId: "910723544119",
    appId: "1:910723544119:web:60b10b25e3884f02c17bb2",
    measurementId: "G-2L02MDSWJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app); // Add storage export
