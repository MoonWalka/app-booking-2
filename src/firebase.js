import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqoNt9vPZ5LvRxhZr8WBzaRlrT9ZmCv3A",
  authDomain: "app-booking-demo.firebaseapp.com",
  projectId: "app-booking-demo",
  storageBucket: "app-booking-demo.appspot.com",
  messagingSenderId: "583694241535",
  appId: "1:583694241535:web:a8e2b9b2e2b9b2e2b9b2e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Utiliser les émulateurs Firebase en développement
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  // Initialiser les émulateurs Firebase
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('Utilisation des émulateurs Firebase');
}

// Forcer le mode bypass en développement
const BYPASS_AUTH = process.env.NODE_ENV === 'development' ? true : (process.env.REACT_APP_BYPASS_AUTH === 'true');

export { db, auth, BYPASS_AUTH };
