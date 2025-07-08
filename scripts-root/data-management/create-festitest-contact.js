/**
 * Script pour créer un contact de test "festitest" avec une structure de métadonnées complète
 * À exécuter dans la console du navigateur sur l'application TourCraft
 */

window.createFestitestContact = async function() {
  console.log('🎭 Création du contact de test "festitest"...');
  
  try {
    // Importer les services Firebase
    const { db, collection, doc, setDoc, serverTimestamp, getCurrentOrganization } = await import('./src/services/firebase-service.js');
    
    const currentOrgId = getCurrentOrganization();
    if (!currentOrgId) {
      throw new Error('Aucune organisation sélectionnée. Veuillez vous connecter et sélectionner une organisation.');
    }
    
    console.log('🏢 Organisation courante:', currentOrgId);
    
    // Définir les métadonnées complètes du contact de test
    const festitestContactData = {
      // Informations de base
      nom: 'festitest',
      prenom: 'Test',
      nomLowercase: 'festitest',
      prenomLowercase: 'test',
      email: 'festitest@example.com',
      telephone: '+33 1 23 45 67 89',
      
      // Adresse
      adresse: '123 Rue de la Programmation',
      codePostal: '75001',
      ville: 'Paris',
      pays: 'France',
      
      // Métadonnées organisationnelles
      entrepriseId: currentOrgId,
      
      // Métadonnées festivalières et professionnelles
      nomFestival: 'Festival Test 2025',
      periodeFestivalMois: 'juin',
      periodeFestivalComplete: '15-25 juin 2025',
      bouclage: '2025-03-15',
      
      // Structure associée (si applicable)
      structureId: '',
      structureNom: '',
      structureRaisonSociale: '',
      structureType: '',
      structureSiret: '',
      structureAdresse: '',
      structureCodePostal: '',
      structureVille: '',
      structureTva: '',
      structureNumeroIntracommunautaire: '',
      structureSiteWeb: '',
      
      // Relations bidirectionnelles
      lieuxIds: [], // IDs des lieux associés
      concertsIds: [], // IDs des concerts associés
      artistesIds: [], // IDs des artistes associés
      
      // Métadonnées de qualification
      tags: ['test', 'festival', 'programmation'],
      source: 'Test de développement',
      fonction: 'Programmateur artistique',
      statut: 'actif',
      priorite: 'normale',
      
      // Notes et commentaires
      notes: 'Contact de test créé pour valider la structure interface et les métadonnées. Utilisé pour le refactoring du système de contacts/structures.',
      commentairesInternes: 'Contact factice - ne pas utiliser en production',
      
      // Métadonnées techniques
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: '2.0',
      
      // Préférences de communication
      preferences: {
        newsletter: true,
        relances: true,
        notifications: true,
        communication: 'email'
      },
      
      // Métadonnées de diffusion (pour Brevo)
      diffusion: {
        brevoContactId: null,
        listesBrevo: [],
        optIn: true,
        dateOptIn: serverTimestamp(),
        segmentation: ['festivals', 'test']
      },
      
      // Historique des interactions
      interactions: [],
      dernierContact: null,
      
      // Métadonnées spécifiques au secteur
      secteur: 'Musique',
      sousSecteursActivite: ['Festivals', 'Programmation'],
      budgetEstime: '50000-100000',
      periodeActivite: 'Annuelle',
      
      // Réseaux sociaux
      reseauxSociaux: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        website: 'https://festival-test.example.com'
      },
      
      // Accessibilité et besoins spéciaux
      accessibilite: {
        mobilitereduite: false,
        malentendant: false,
        malvoyant: false,
        autresBesoins: ''
      }
    };
    
    // Déterminer la collection à utiliser (organisationnelle ou principale)
    const useOrgCollection = true; // Utiliser la collection organisationnelle
    const collectionName = useOrgCollection ? `contacts_org_${currentOrgId}` : 'contacts';
    
    console.log(`📁 Création dans la collection: ${collectionName}`);
    
    // Créer le document
    const contactRef = doc(collection(db, collectionName));
    await setDoc(contactRef, festitestContactData);
    
    console.log('✅ Contact "festitest" créé avec succès!');
    console.log(`📄 ID du contact: ${contactRef.id}`);
    console.log(`📁 Collection: ${collectionName}`);
    
    // Afficher les métadonnées créées
    console.log('🔍 Métadonnées du contact créé:');
    console.log(festitestContactData);
    
    // Retourner les informations du contact créé
    return {
      id: contactRef.id,
      collection: collectionName,
      data: festitestContactData
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du contact:', error);
    throw error;
  }
};

// Pour création immédiate
window.createFestitestContactNow = async function() {
  try {
    const result = await window.createFestitestContact();
    console.log('🎉 Contact "festitest" créé et prêt pour les tests!');
    console.log('📋 Résumé:', result);
    return result;
  } catch (error) {
    console.error('💥 Échec de la création:', error);
    return null;
  }
};

console.log('📋 Fonctions disponibles:');
console.log('  - window.createFestitestContact() : Créer le contact "festitest"');
console.log('  - window.createFestitestContactNow() : Créer le contact immédiatement');
console.log('');
console.log('💡 Conseil: Exécutez window.createFestitestContactNow() pour créer le contact de test.');