// Script pour peupler l'émulateur avec des données de test
import { collection, doc, setDoc } from '@/services/firebase-service';

const sampleConcerts = [
  {
    id: 'concert-1',
    titre: 'Concert Test 1',
    dateEvenement: '2024-12-25T20:00:00.000Z',
    montant: 1500,
    statut: 'contact',
    lieuId: 'lieu-1',
    lieuNom: 'Salle de Test',
    contactId: 'prog-1',
    contactNom: 'Contact Test',
    artisteId: 'artiste-1',
    artisteNom: 'Artiste Test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'concert-2',
    titre: 'Concert Test 2',
    dateEvenement: '2024-12-30T21:00:00.000Z',
    montant: 2000,
    statut: 'preaccord',
    lieuId: 'lieu-2',
    lieuNom: 'Autre Salle',
    contactId: 'prog-2',
    contactNom: 'Autre Contact',
    artisteId: 'artiste-2',
    artisteNom: 'Autre Artiste',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleLieux = [
  {
    id: 'lieu-1',
    nom: 'Salle de Test',
    ville: 'Paris',
    codePostal: '75001',
    adresse: '123 Rue de Test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lieu-2',
    nom: 'Autre Salle',
    ville: 'Lyon',
    codePostal: '69001',
    adresse: '456 Avenue de Test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleContacts = [
  {
    id: 'prog-1',
    nom: 'Contact Test',
    email: 'prog1@test.com',
    telephone: '0123456789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prog-2',
    nom: 'Autre Contact',
    email: 'prog2@test.com',
    telephone: '0987654321',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleArtistes = [
  {
    id: 'artiste-1',
    nom: 'Artiste Test',
    genre: 'Rock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'artiste-2',
    nom: 'Autre Artiste',
    genre: 'Jazz',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const seedEmulator = async () => {
  try {
    console.log('🌱 Début du peuplement de l\'émulateur...');
    
    // Peupler les concerts
    console.log('📅 Ajout des concerts...');
    for (const concert of sampleConcerts) {
      const concertRef = doc(collection('concerts'), concert.id);
      await setDoc(concertRef, concert);
      console.log(`✅ Concert ajouté: ${concert.titre}`);
    }
    
    // Peupler les lieux
    console.log('🏢 Ajout des lieux...');
    for (const lieu of sampleLieux) {
      const lieuRef = doc(collection('lieux'), lieu.id);
      await setDoc(lieuRef, lieu);
      console.log(`✅ Lieu ajouté: ${lieu.nom}`);
    }
    
    // Peupler les contacts
    console.log('👥 Ajout des contacts...');
    for (const prog of sampleContacts) {
      const progRef = doc(collection('contacts'), prog.id);
      await setDoc(progRef, prog);
      console.log(`✅ Contact ajouté: ${prog.nom}`);
    }
    
    // Peupler les artistes
    console.log('🎤 Ajout des artistes...');
    for (const artiste of sampleArtistes) {
      const artisteRef = doc(collection('artistes'), artiste.id);
      await setDoc(artisteRef, artiste);
      console.log(`✅ Artiste ajouté: ${artiste.nom}`);
    }
    
    console.log('🎉 Peuplement de l\'émulateur terminé avec succès !');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du peuplement de l\'émulateur:', error);
    return false;
  }
};

// Fonction pour vider l'émulateur
export const clearEmulator = async () => {
  try {
    console.log('🧹 Nettoyage de l\'émulateur...');
    // Cette fonction sera implémentée selon les besoins
    console.log('✅ Nettoyage terminé');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
};

// Exposer les fonctions globalement pour les tests
if (typeof window !== 'undefined') {
  window.seedEmulator = seedEmulator;
  window.clearEmulator = clearEmulator;
} 