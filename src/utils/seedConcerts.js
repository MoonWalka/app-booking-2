/**
 * Script pour créer des concerts de test
 */

import { collection, addDoc, setDoc, doc } from '@/services/firebase-service';
import { db, getCurrentOrganization, setCurrentOrganization, createOrganization } from '@/services/firebase-service';

// Données de test pour les concerts
const sampleConcerts = [
  {
    titre: 'Concert Rock - Les Étoiles',
    dateEvenement: '2024-06-15',
    heureDebut: '20:00',
    lieuNom: 'Salle Olympia',
    lieuVille: 'Paris',
    artisteNom: 'Les Étoiles du Rock',
    artisteId: 'artiste-1',
    lieuId: 'lieu-1',
    contactIds: ['prog-1'], // Nouveau format unifié
    statut: 'confirme',
    prix: 45,
    description: 'Un concert rock énergique avec Les Étoiles du Rock',
    capacite: 2000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Soirée Jazz - Blue Note',
    dateEvenement: '2024-06-22',
    heureDebut: '19:30',
    lieuNom: 'Le New Morning',
    lieuVille: 'Paris',
    artisteNom: 'Blue Note Quartet',
    artisteId: 'artiste-2',
    lieuId: 'lieu-2',
    contactIds: ['prog-1'], // Nouveau format unifié
    statut: 'brouillon',
    prix: 35,
    description: 'Une soirée jazz intimiste',
    capacite: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Festival Électro - Night Vision',
    dateEvenement: '2024-07-10',
    heureDebut: '21:00',
    lieuNom: 'Warehouse 9',
    lieuVille: 'Berlin',
    artisteNom: 'Night Vision',
    artisteId: 'artiste-3',
    lieuId: 'lieu-3',
    contactIds: ['prog-2'], // Nouveau format unifié
    statut: 'confirme',
    prix: 60,
    description: 'Festival de musique électronique',
    capacite: 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Concert Acoustique - Sarah Moon',
    dateEvenement: '2024-05-28',
    heureDebut: '20:30',
    lieuNom: 'Café de la Musique',
    lieuVille: 'Lyon',
    artisteNom: 'Sarah Moon',
    artisteId: 'artiste-4',
    lieuId: 'lieu-4',
    contactIds: ['prog-1'], // Nouveau format unifié
    statut: 'reporte',
    prix: 25,
    description: 'Concert acoustique intimiste',
    capacite: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Hip-Hop Show - Urban Flow',
    dateEvenement: '2024-08-15',
    heureDebut: '22:00',
    lieuNom: 'Club Underground',
    lieuVille: 'Marseille',
    artisteNom: 'Urban Flow',
    artisteId: 'artiste-5',
    lieuId: 'lieu-5',
    contactIds: ['prog-2'], // Nouveau format unifié
    statut: 'annule',
    prix: 40,
    description: 'Show hip-hop avec Urban Flow',
    capacite: 800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Créer une organisation de test
export const createTestOrganization = async () => {
  try {
    console.log('🏢 Création d\'une organisation de test...');
    
    const orgId = await createOrganization({
      name: 'TourCraft Demo',
      description: 'Organisation de démonstration pour TourCraft',
      settings: {
        timezone: 'Europe/Paris',
        currency: 'EUR'
      }
    }, 'local-user');
    
    console.log('✅ Organisation créée:', orgId);
    
    // Définir cette organisation comme courante
    setCurrentOrganization(orgId);
    
    return orgId;
  } catch (error) {
    console.error('❌ Erreur création organisation:', error);
    return null;
  }
};

// Créer des concerts de test
export const seedConcerts = async () => {
  try {
    console.log('🎵 Ajout de concerts de test...');
    
    // Vérifier qu'une organisation est sélectionnée
    let orgId = getCurrentOrganization();
    if (!orgId) {
      console.log('Aucune organisation, création d\'une organisation de test...');
      orgId = await createTestOrganization();
      if (!orgId) {
        throw new Error('Impossible de créer une organisation de test');
      }
    }
    
    console.log('🏢 Organisation courante:', orgId);
    
    // Créer la collection organisationnelle
    const collectionName = `concerts_org_${orgId}`;
    console.log('📁 Collection cible:', collectionName);
    
    const concertsRef = collection(db, collectionName);
    
    // Ajouter chaque concert
    const results = [];
    for (const concertData of sampleConcerts) {
      const docRef = await addDoc(concertsRef, {
        ...concertData,
        organizationId: orgId
      });
      results.push(docRef.id);
      console.log(`✅ Concert ajouté: ${concertData.titre} (${docRef.id})`);
    }
    
    console.log(`🎉 ${results.length} concerts ajoutés avec succès !`);
    return results;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des concerts:', error);
    throw error;
  }
};

// Créer des artistes de test
export const seedArtistes = async () => {
  try {
    console.log('🎤 Ajout d\'artistes de test...');
    
    const orgId = getCurrentOrganization();
    if (!orgId) {
      throw new Error('Aucune organisation sélectionnée');
    }
    
    const artistes = [
      { id: 'artiste-1', nom: 'Les Étoiles du Rock', genre: 'Rock', origine: 'France' },
      { id: 'artiste-2', nom: 'Blue Note Quartet', genre: 'Jazz', origine: 'USA' },
      { id: 'artiste-3', nom: 'Night Vision', genre: 'Électronique', origine: 'Allemagne' },
      { id: 'artiste-4', nom: 'Sarah Moon', genre: 'Folk', origine: 'France' },
      { id: 'artiste-5', nom: 'Urban Flow', genre: 'Hip-Hop', origine: 'France' }
    ];
    
    const collectionName = `artistes_org_${orgId}`;
    
    for (const artiste of artistes) {
      const docRef = doc(db, collectionName, artiste.id);
      await setDoc(docRef, {
        ...artiste,
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Artiste ajouté: ${artiste.nom}`);
    }
    
    console.log('🎉 Artistes ajoutés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des artistes:', error);
    throw error;
  }
};

// Script complet pour initialiser les données de test
export const initializeTestData = async () => {
  try {
    console.log('🚀 Initialisation des données de test...');
    
    // 1. Créer ou vérifier l'organisation
    let orgId = getCurrentOrganization();
    if (!orgId) {
      orgId = await createTestOrganization();
    }
    
    if (!orgId) {
      throw new Error('Impossible d\'initialiser l\'organisation');
    }
    
    // 2. Ajouter les artistes
    await seedArtistes();
    
    // 3. Ajouter les concerts
    await seedConcerts();
    
    console.log('🎉 Initialisation terminée avec succès !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return false;
  }
};