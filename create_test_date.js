// Script pour créer une date de test
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase (à adapter selon votre config)
const firebaseConfig = {
  // Copiez votre configuration Firebase ici
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createTestDate() {
  try {
    // ID de l'organisation qu'on a vu dans les logs
    const organizationId = '9LjkCJG04pEzbABdHkSf';
    
    const testDate = {
      titre: 'Date de test',
      date: new Date('2024-12-31').toISOString(),
      heure: '20:00',
      lieuNom: 'Salle de test',
      artisteNom: 'Artiste de test',
      statut: 'contact',
      organizationId: organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'dates'), testDate);
    console.log('Date de test créée avec ID:', docRef.id);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

createTestDate();