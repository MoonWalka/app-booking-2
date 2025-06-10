// Script pour créer un concert de test avec un lieu associé

// Charger les variables d'environnement
require('./load-env');

const { db, collection, addDoc, doc, setDoc, Timestamp } = require('./firebase-node');

async function createTestData() {
  console.log('=== CRÉATION CONCERT ET LIEU DE TEST ===\n');

  try {
    // Organization ID de test (à ajuster selon votre environnement)
    const organizationId = '9LjkCJG04pEzbABdHkSf'; // Visible dans les résultats précédents
    
    // 1. Créer un lieu de test avec adresse
    console.log('1. Création du lieu de test...');
    const lieuData = {
      nom: 'Salle de Test TourCraft',
      adresse: '123 rue de la Musique',
      codePostal: '75001',
      ville: 'Paris',
      pays: 'France',
      capacite: 500,
      type: 'Salle de concert',
      organizationId: organizationId,
      dateCreation: Timestamp.now(),
      dateModification: Timestamp.now()
    };

    const lieuRef = await addDoc(collection(db, 'lieux'), lieuData);
    console.log(`✅ Lieu créé avec ID: ${lieuRef.id}`);
    console.log(`   Adresse: ${lieuData.adresse}, ${lieuData.codePostal} ${lieuData.ville}`);

    // 2. Créer un contact de test
    console.log('\n2. Création du contact de test...');
    const contactData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      telephone: '0123456789',
      fonction: 'Programmateur',
      organizationId: organizationId,
      dateCreation: Timestamp.now(),
      dateModification: Timestamp.now()
    };

    const contactRef = await addDoc(collection(db, 'contacts'), contactData);
    console.log(`✅ Contact créé avec ID: ${contactRef.id}`);

    // 3. Créer un concert lié au lieu et contact
    console.log('\n3. Création du concert de test...');
    const concertData = {
      titre: 'Concert Test avec Lieu et Carte',
      date: new Date('2025-07-15').toISOString(),
      heure: '20:00',
      statut: 'confirme',
      montant: 1500,
      montantTotal: 1500,
      lieuId: lieuRef.id, // IMPORTANT: Référence au lieu
      contactId: contactRef.id, // IMPORTANT: Référence au contact
      lieuNom: lieuData.nom, // Pour compatibilité
      contactNom: `${contactData.prenom} ${contactData.nom}`, // Pour compatibilité
      organizationId: organizationId,
      notes: 'Concert de test pour vérifier l\'affichage des cartes',
      dateCreation: Timestamp.now(),
      dateModification: Timestamp.now()
    };

    const concertRef = await addDoc(collection(db, 'concerts'), concertData);
    console.log(`✅ Concert créé avec ID: ${concertRef.id}`);

    // 4. Mettre à jour les relations bidirectionnelles
    console.log('\n4. Mise à jour des relations bidirectionnelles...');
    
    // Ajouter le concert aux listes du lieu et du contact
    await setDoc(doc(db, 'lieux', lieuRef.id), {
      concertsIds: [concertRef.id]
    }, { merge: true });
    
    await setDoc(doc(db, 'contacts', contactRef.id), {
      concertsIds: [concertRef.id]
    }, { merge: true });

    console.log('✅ Relations bidirectionnelles mises à jour');

    // 5. Afficher le résumé
    console.log('\n=== RÉSUMÉ ===');
    console.log(`
Concert créé avec succès!
------------------------
ID du concert: ${concertRef.id}
Titre: ${concertData.titre}
Date: ${concertData.date}

Lieu associé:
- ID: ${lieuRef.id}
- Nom: ${lieuData.nom}
- Adresse: ${lieuData.adresse}, ${lieuData.codePostal} ${lieuData.ville}

Contact associé:
- ID: ${contactRef.id}
- Nom: ${contactData.prenom} ${contactData.nom}

OrganizationId: ${organizationId}

Pour tester:
1. Allez sur /concerts/${concertRef.id}
2. La carte du lieu devrait s'afficher
3. Si la carte ne s'affiche pas, allez sur /debug-tools et utilisez l'onglet "Debug Cartes Lieux"
4. Ou allez directement sur /concerts/${concertRef.id}/debug
`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter la création
createTestData().then(() => {
  console.log('\n=== FIN DE LA CRÉATION ===');
  process.exit(0);
});