import React, { useState } from 'react';
import { collection, getDoc, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase-service';
import { useOrganization } from '../../context/OrganizationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import styles from './ContactCreationTester.module.css'; // Réutilisation des styles

const EntityCreationTester = () => {
  const { currentOrganization } = useOrganization();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTests, setSelectedTests] = useState({
    contacts: true,
    lieux: true,
    structures: true
  });
  const [testEntities, setTestEntities] = useState({
    contacts: [],
    lieux: [],
    concerts: [],
    structures: []
  });

  // Fonction pour ajouter un résultat de test
  const addTestResult = (test, status, details) => {
    setTestResults(prev => [...prev, {
      id: Date.now() + Math.random(),
      test,
      status,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Fonction pour nettoyer les données de test
  const cleanupTestData = async () => {
    try {
      for (const entityType of ['contacts', 'lieux', 'concerts', 'structures']) {
        const entities = testEntities[entityType];
        for (const entity of entities) {
          await deleteDoc(doc(db, entityType, entity.id));
          addTestResult(`Suppression ${entityType}`, 'success', 
            `Supprimé: ${entity.nom || entity.titre || entity.raisonSociale || entity.id}`);
        }
      }
      setTestEntities({ contacts: [], lieux: [], concerts: [], structures: [] });
    } catch (error) {
      addTestResult('Nettoyage', 'error', error.message);
    }
  };

  // ============== TESTS DE CRÉATION DE CONTACTS ==============

  // Test 1: Créer un contact depuis un lieu
  const testContactFromLieu = async () => {
    addTestResult('Contact via Lieu', 'running', 'Test création contact depuis formulaire lieu...');
    
    try {
      const contactData = {
        nom: `Contact Test Lieu ${Date.now()}`,
        nomLowercase: `contact test lieu ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'test@lieu.com',
        telephone: '0123456789',
        structureId: '',
        structureNom: '',
        lieuxIds: [],
        concertsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);
      
      const lieuData = {
        nom: `Lieu Test ${Date.now()}`,
        nomLowercase: `lieu test ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        contactIds: [contactId],
        adresse: '123 Rue Test',
        ville: 'Test Ville',
        codePostal: '75000',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: lieuId } = await createEntity('lieux', lieuData);
      await updateBidirectionalRelation('lieu', lieuId, 'contact', contactId);

      addTestResult('Contact via Lieu', 'success', 
        `✅ Contact créé (${contactId}) et associé au lieu (${lieuId})`);
      await verifyBidirectionalRelation(lieuId, contactId, 'lieu-contact');

    } catch (error) {
      addTestResult('Contact via Lieu', 'error', error.message);
    }
  };

  // Test 2: Créer un contact depuis un concert
  const testContactFromConcert = async () => {
    addTestResult('Contact via Concert', 'running', 'Test création contact depuis formulaire concert...');
    
    try {
      const contactData = {
        nom: `Contact Test Concert ${Date.now()}`,
        nomLowercase: `contact test concert ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'test@concert.com',
        concertsIds: [],
        lieuxIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);
      
      const concertData = {
        titre: `Concert Test ${Date.now()}`,
        titreLowercase: `concert test ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        contactId: contactId,
        date: new Date().toISOString(),
        statut: 'En cours',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: concertId } = await createEntity('concerts', concertData);
      await updateBidirectionalRelation('concert', concertId, 'contact', contactId);

      addTestResult('Contact via Concert', 'success', 
        `✅ Contact créé (${contactId}) et associé au concert (${concertId})`);
      await verifyBidirectionalRelation(concertId, contactId, 'concert-contact');

    } catch (error) {
      addTestResult('Contact via Concert', 'error', error.message);
    }
  };

  // ============== TESTS DE CRÉATION DE LIEUX ==============

  // Test 3: Créer un lieu depuis un concert
  const testLieuFromConcert = async () => {
    addTestResult('Lieu via Concert', 'running', 'Test création lieu depuis formulaire concert...');
    
    try {
      const lieuData = {
        nom: `Lieu Test Concert ${Date.now()}`,
        nomLowercase: `lieu test concert ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        adresse: '789 Boulevard Test',
        ville: 'Concert Ville',
        codePostal: '75002',
        contactIds: [],
        concertsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: lieuId } = await createEntity('lieux', lieuData);
      
      const concertData = {
        titre: `Concert avec Lieu ${Date.now()}`,
        titreLowercase: `concert avec lieu ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        lieuId: lieuId, // Un seul lieu principal (pour la carte)
        lieuIds: [lieuId], // Liste des lieux (peut être multiple)
        date: new Date().toISOString(),
        statut: 'En cours',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: concertId } = await createEntity('concerts', concertData);
      await updateBidirectionalRelation('concert', concertId, 'lieu', lieuId);

      addTestResult('Lieu via Concert', 'success', 
        `✅ Lieu créé (${lieuId}) et associé au concert (${concertId})`);
      await verifyBidirectionalRelation(concertId, lieuId, 'concert-lieu');

    } catch (error) {
      addTestResult('Lieu via Concert', 'error', error.message);
    }
  };

  // Test 4: Créer un lieu depuis un contact
  const testLieuFromContact = async () => {
    addTestResult('Lieu via Contact', 'running', 'Test création lieu depuis formulaire contact...');
    
    try {
      const lieuData = {
        nom: `Lieu Test Contact ${Date.now()}`,
        nomLowercase: `lieu test contact ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        adresse: '456 Avenue Contact',
        ville: 'Contact City',
        codePostal: '75003',
        contactIds: [],
        concertsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: lieuId } = await createEntity('lieux', lieuData);
      
      const contactData = {
        nom: `Contact avec Lieu ${Date.now()}`,
        nomLowercase: `contact avec lieu ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'contact.lieu@test.com',
        lieuxIds: [lieuId],
        concertsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);
      
      // Mettre à jour le lieu pour ajouter le contact
      await updateDoc(doc(db, 'lieux', lieuId), {
        contactIds: [contactId],
        updatedAt: new Date()
      });

      addTestResult('Lieu via Contact', 'success', 
        `✅ Lieu créé (${lieuId}) et associé au contact (${contactId})`);
      
      // Note sur le comportement réel
      addTestResult('Note Contact→Lieu', 'info', 
        'Dans l\'app, ContactForm redirige vers /lieux/nouveau avec le contact pré-sélectionné');

    } catch (error) {
      addTestResult('Lieu via Contact', 'error', error.message);
    }
  };

  // ============== TESTS DE CRÉATION DE STRUCTURES ==============

  // Test 5: Créer une structure depuis un contact
  const testStructureFromContact = async () => {
    addTestResult('Structure via Contact', 'running', 'Test création structure depuis formulaire contact...');
    
    try {
      // Simuler la création d'une structure via ContactStructureSection
      const structureData = {
        nom: `Structure Test Contact ${Date.now()}`,
        nomLowercase: `structure test contact ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        raisonSociale: 'SARL Test Contact',
        siret: '12345678900001',
        adresse: '321 Rue Structure',
        ville: 'Structure Ville',
        codePostal: '75004',
        email: 'structure.contact@test.com',
        telephone: '0111223344',
        contactsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: structureId } = await createEntity('structures', structureData);
      
      const contactData = {
        nom: `Contact avec Structure ${Date.now()}`,
        nomLowercase: `contact avec structure ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'contact.structure@test.com',
        structureId: structureId,
        structureNom: structureData.nom,
        structureRaisonSociale: structureData.raisonSociale,
        structureSiret: structureData.siret,
        lieuxIds: [],
        concertsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);
      
      // Mettre à jour la structure pour ajouter le contact
      await updateDoc(doc(db, 'structures', structureId), {
        contactsIds: [contactId],
        updatedAt: new Date()
      });

      addTestResult('Structure via Contact', 'success', 
        `✅ Structure créée (${structureId}) et associée au contact (${contactId})`);
      
      addTestResult('Note Structure', 'info', 
        'ContactForm permet création via API SIRENE ou formulaire manuel');

    } catch (error) {
      addTestResult('Structure via Contact', 'error', error.message);
    }
  };

  // Test 6: Test complexe - Contact avec Lieu ET Structure
  const testComplexRelations = async () => {
    addTestResult('Relations Complexes', 'running', 'Test création avec relations multiples...');
    
    try {
      // Créer une structure
      const structureData = {
        nom: `Structure Complexe ${Date.now()}`,
        nomLowercase: `structure complexe ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        raisonSociale: 'SAS Complexe',
        siret: '98765432100001',
        contactsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const { id: structureId } = await createEntity('structures', structureData);

      // Créer un lieu
      const lieuData = {
        nom: `Lieu Complexe ${Date.now()}`,
        nomLowercase: `lieu complexe ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        adresse: '999 Complexe Street',
        ville: 'Complexe City',
        codePostal: '75005',
        contactIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const { id: lieuId } = await createEntity('lieux', lieuData);

      // Créer un contact associé aux deux
      const contactData = {
        nom: `Contact Complexe ${Date.now()}`,
        nomLowercase: `contact complexe ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'complexe@test.com',
        structureId: structureId,
        structureNom: structureData.nom,
        structureRaisonSociale: structureData.raisonSociale,
        lieuxIds: [lieuId],
        concertsIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const { id: contactId } = await createEntity('contacts', contactData);

      // Créer un concert avec tout ça
      const concertData = {
        titre: `Concert Complexe ${Date.now()}`,
        titreLowercase: `concert complexe ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        contactId: contactId,
        lieuId: lieuId, // Un seul lieu principal (pour la carte)
        lieuIds: [lieuId], // Liste des lieux
        structureId: structureId,
        date: new Date().toISOString(),
        statut: 'En cours',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const { id: concertId } = await createEntity('concerts', concertData);

      // Mettre à jour toutes les relations
      await updateDoc(doc(db, 'structures', structureId), {
        contactsIds: [contactId],
        updatedAt: new Date()
      });
      await updateDoc(doc(db, 'lieux', lieuId), {
        contactIds: [contactId],
        concertsIds: [concertId],
        updatedAt: new Date()
      });
      await updateDoc(doc(db, 'contacts', contactId), {
        concertsIds: [concertId],
        updatedAt: new Date()
      });

      addTestResult('Relations Complexes', 'success', 
        `✅ Création complexe réussie: Concert (${concertId}) + Contact (${contactId}) + Lieu (${lieuId}) + Structure (${structureId})`);

    } catch (error) {
      addTestResult('Relations Complexes', 'error', error.message);
    }
  };

  // Fonction helper pour créer une entité
  const createEntity = async (collectionName, data) => {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, data);
    
    setTestEntities(prev => ({
      ...prev,
      [collectionName]: [...prev[collectionName], { 
        id: docRef.id, 
        nom: data.nom, 
        titre: data.titre,
        raisonSociale: data.raisonSociale 
      }]
    }));
    
    return { id: docRef.id, ...data };
  };

  // Fonction pour mettre à jour les relations bidirectionnelles
  const updateBidirectionalRelation = async (sourceType, sourceId, targetType, targetId) => {
    const updates = [];

    if (sourceType === 'lieu' && targetType === 'contact') {
      const contactRef = doc(db, 'contacts', targetId);
      const contactDoc = await getDoc(contactRef);
      const contactData = contactDoc.data();
      const lieuxIds = contactData.lieuxIds || [];
      
      if (!lieuxIds.includes(sourceId)) {
        updates.push(
          updateDoc(contactRef, { 
            lieuxIds: [...lieuxIds, sourceId],
            updatedAt: new Date()
          })
        );
      }
    }

    if (sourceType === 'concert' && targetType === 'contact') {
      const contactRef = doc(db, 'contacts', targetId);
      const contactDoc = await getDoc(contactRef);
      const contactData = contactDoc.data();
      const concertsIds = contactData.concertsIds || [];
      
      if (!concertsIds.includes(sourceId)) {
        updates.push(
          updateDoc(contactRef, { 
            concertsIds: [...concertsIds, sourceId],
            updatedAt: new Date()
          })
        );
      }
    }

    if (sourceType === 'concert' && targetType === 'lieu') {
      const lieuRef = doc(db, 'lieux', targetId);
      const lieuDoc = await getDoc(lieuRef);
      const lieuData = lieuDoc.data();
      const concertsIds = lieuData.concertsIds || [];
      
      if (!concertsIds.includes(sourceId)) {
        updates.push(
          updateDoc(lieuRef, { 
            concertsIds: [...concertsIds, sourceId],
            updatedAt: new Date()
          })
        );
      }
    }

    await Promise.all(updates);
  };

  // Fonction pour vérifier les relations bidirectionnelles
  const verifyBidirectionalRelation = async (entityId, targetId, relationType) => {
    try {
      if (relationType === 'lieu-contact') {
        const lieuDoc = await getDoc(doc(db, 'lieux', entityId));
        const contactDoc = await getDoc(doc(db, 'contacts', targetId));
        const lieuData = lieuDoc.data();
        const contactData = contactDoc.data();

        if (lieuData.contactIds?.includes(targetId) && contactData.lieuxIds?.includes(entityId)) {
          addTestResult('Vérification', 'success', '✅ Relations lieu ↔ contact OK');
        } else {
          addTestResult('Vérification', 'error', '❌ Relations lieu ↔ contact incomplètes');
        }
      }

      if (relationType === 'concert-contact') {
        const concertDoc = await getDoc(doc(db, 'concerts', entityId));
        const contactDoc = await getDoc(doc(db, 'contacts', targetId));
        const concertData = concertDoc.data();
        const contactData = contactDoc.data();

        if (concertData.contactId === targetId && contactData.concertsIds?.includes(entityId)) {
          addTestResult('Vérification', 'success', '✅ Relations concert ↔ contact OK');
        } else {
          addTestResult('Vérification', 'error', '❌ Relations concert ↔ contact incomplètes');
        }
      }

      if (relationType === 'concert-lieu') {
        const concertDoc = await getDoc(doc(db, 'concerts', entityId));
        const lieuDoc = await getDoc(doc(db, 'lieux', targetId));
        const concertData = concertDoc.data();
        const lieuData = lieuDoc.data();

        if (concertData.lieuIds?.includes(targetId) && lieuData.concertsIds?.includes(entityId)) {
          addTestResult('Vérification', 'success', '✅ Relations concert ↔ lieu OK');
        } else {
          addTestResult('Vérification', 'error', '❌ Relations concert ↔ lieu incomplètes');
        }
      }
    } catch (error) {
      addTestResult('Vérification', 'error', error.message);
    }
  };

  // Lancer les tests sélectionnés
  const runSelectedTests = async () => {
    if (!currentOrganization?.id) {
      addTestResult('Erreur', 'error', 'Aucune organisation sélectionnée');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      addTestResult('Début des tests', 'info', `Tests sélectionnés: ${Object.keys(selectedTests).filter(k => selectedTests[k]).join(', ')}`);

      if (selectedTests.contacts) {
        await testContactFromLieu();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testContactFromConcert();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (selectedTests.lieux) {
        await testLieuFromConcert();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testLieuFromContact();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (selectedTests.structures) {
        await testStructureFromContact();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Test complexe toujours exécuté
      await testComplexRelations();

      addTestResult('Tests terminés', 'success', '✅ Tous les tests sélectionnés ont été exécutés');
    } catch (error) {
      addTestResult('Erreur globale', 'error', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h2>Test de création d'entités depuis formulaires</h2>
          <p className={styles.description}>
            Test complet de création de contacts, lieux et structures depuis différents formulaires 
            avec vérification des relations bidirectionnelles.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Sélectionner les tests à exécuter :</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <label>
              <input 
                type="checkbox" 
                checked={selectedTests.contacts}
                onChange={(e) => setSelectedTests(prev => ({ ...prev, contacts: e.target.checked }))}
                disabled={isRunning}
              />
              {' '}Tests Contacts
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedTests.lieux}
                onChange={(e) => setSelectedTests(prev => ({ ...prev, lieux: e.target.checked }))}
                disabled={isRunning}
              />
              {' '}Tests Lieux
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedTests.structures}
                onChange={(e) => setSelectedTests(prev => ({ ...prev, structures: e.target.checked }))}
                disabled={isRunning}
              />
              {' '}Tests Structures
            </label>
          </div>
        </div>

        <div className={styles.controls}>
          <Button 
            onClick={runSelectedTests} 
            disabled={isRunning || (!selectedTests.contacts && !selectedTests.lieux && !selectedTests.structures)}
            variant="primary"
          >
            {isRunning ? 'Tests en cours...' : 'Lancer les tests sélectionnés'}
          </Button>

          <Button 
            onClick={cleanupTestData} 
            disabled={isRunning}
            variant="secondary"
          >
            Nettoyer les données de test
          </Button>
        </div>

        <div className={styles.results}>
          <h3>Résultats des tests</h3>
          {testResults.length === 0 ? (
            <p className={styles.noResults}>Aucun test exécuté</p>
          ) : (
            <div className={styles.resultsList}>
              {testResults.map((result) => (
                <Alert
                  key={result.id}
                  type={
                    result.status === 'success' ? 'success' : 
                    result.status === 'error' ? 'error' : 
                    result.status === 'warning' ? 'warning' :
                    'info'
                  }
                  className={styles.resultItem}
                >
                  <div className={styles.resultHeader}>
                    <strong>{result.test}</strong>
                    <span className={styles.timestamp}>{result.timestamp}</span>
                  </div>
                  <div className={styles.resultDetails}>{result.details}</div>
                </Alert>
              ))}
            </div>
          )}
        </div>

        {(testEntities.contacts.length > 0 || testEntities.lieux.length > 0 || 
          testEntities.concerts.length > 0 || testEntities.structures.length > 0) && (
          <div className={styles.entities}>
            <h3>Entités de test créées</h3>
            <div className={styles.entityList}>
              {testEntities.contacts.length > 0 && (
                <div>
                  <strong>Contacts:</strong> {testEntities.contacts.map(c => c.nom).join(', ')}
                </div>
              )}
              {testEntities.lieux.length > 0 && (
                <div>
                  <strong>Lieux:</strong> {testEntities.lieux.map(l => l.nom).join(', ')}
                </div>
              )}
              {testEntities.concerts.length > 0 && (
                <div>
                  <strong>Concerts:</strong> {testEntities.concerts.map(c => c.titre || c.nom).join(', ')}
                </div>
              )}
              {testEntities.structures.length > 0 && (
                <div>
                  <strong>Structures:</strong> {testEntities.structures.map(s => s.raisonSociale || s.nom).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h4>Légende des tests :</h4>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>Tests Contacts :</strong> Création de contacts depuis lieux et concerts</li>
            <li><strong>Tests Lieux :</strong> Création de lieux depuis concerts et contacts</li>
            <li><strong>Tests Structures :</strong> Création de structures depuis contacts (API SIRENE ou manuel)</li>
            <li><strong>Test Complexe :</strong> Création avec relations multiples entre toutes les entités</li>
          </ul>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
            <strong>⚠️ Note importante sur les cartes :</strong> Pour qu'une carte s'affiche dans la fiche concert, 
            le concert doit avoir un champ <code>lieuId</code> (lieu principal) en plus de <code>lieuIds</code> (liste des lieux).
            Les concerts créés dans cet outil incluent les deux champs pour assurer l'affichage correct des cartes.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EntityCreationTester;