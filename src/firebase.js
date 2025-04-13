import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDqoNt9vPZ5LvRxhZr8WBzaRlrT9ZmCv3A",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "app-booking-demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "app-booking-demo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "app-booking-demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Forcer le mode bypass en développement
const BYPASS_AUTH = process.env.NODE_ENV === 'development' ? true : (process.env.REACT_APP_BYPASS_AUTH === 'true');

export { db, auth, BYPASS_AUTH };
