import React, { useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase-service';
import { useOrganization } from '../../context/OrganizationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import styles from './ContactCreationTester.module.css';

const ContactCreationTester = () => {
  const { currentOrganization } = useOrganization();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
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
          addTestResult(`Suppression ${entityType}`, 'success', `Supprimé: ${entity.nom || entity.titre || entity.id}`);
        }
      }
      setTestEntities({ contacts: [], lieux: [], concerts: [], structures: [] });
    } catch (error) {
      addTestResult('Nettoyage', 'error', error.message);
    }
  };

  // Test 1: Créer un contact depuis un lieu
  const testContactFromLieu = async () => {
    addTestResult('Test Contact via Lieu', 'running', 'Création en cours...');
    
    try {
      // Simuler la création d'un contact via useEntitySearch
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
        artistesIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Créer le contact
      const { id: contactId } = await createEntity('contacts', contactData);
      
      // Créer un lieu avec ce contact
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

      // Simuler la mise à jour bidirectionnelle
      await updateBidirectionalRelation('lieu', lieuId, 'contact', contactId);

      addTestResult('Test Contact via Lieu', 'success', 
        `Contact créé (${contactId}) et associé au lieu (${lieuId})`);

      // Vérifier les relations
      await verifyBidirectionalRelation(lieuId, contactId, 'lieu-contact');

    } catch (error) {
      addTestResult('Test Contact via Lieu', 'error', error.message);
    }
  };

  // Test 2: Créer un contact depuis un concert
  const testContactFromDate = async () => {
    addTestResult('Test Contact via Date', 'running', 'Création en cours...');
    
    try {
      // Créer un contact
      const contactData = {
        nom: `Contact Test Date ${Date.now()}`,
        nomLowercase: `contact test date ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'test@date.com',
        concertsIds: [],
        lieuxIds: [],
        artistesIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);
      
      // Créer un date avec ce contact
      const dateData = {
        titre: `Date Test ${Date.now()}`,
        titreLowercase: `concert test ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        contactIds: [contactId], // Nouveau format unifié (array)
        date: new Date().toISOString(),
        statut: 'En cours',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: dateId } = await createEntity('concerts', dateData);

      // Simuler la mise à jour bidirectionnelle
      await updateBidirectionalRelation('concert', dateId, 'contact', contactId);

      addTestResult('Test Contact via Date', 'success', 
        `Contact créé (${contactId}) et associé au date (${dateId})`);

      // Vérifier les relations
      await verifyBidirectionalRelation(dateId, contactId, 'concert-contact');

    } catch (error) {
      addTestResult('Test Contact via Date', 'error', error.message);
    }
  };

  // Test 3: Associer un contact existant à une structure
  const testContactFromStructure = async () => {
    addTestResult('Test Contact via Structure', 'running', 'Test d\'association en cours...');
    
    try {
      // D'abord créer un contact
      const contactData = {
        nom: `Contact Test Structure ${Date.now()}`,
        nomLowercase: `contact test structure ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'test@structure.com',
        telephone: '0123456789',
        fonction: 'Responsable',
        structureId: '', // Sera mis à jour après
        structureNom: '',
        structureRaisonSociale: '',
        lieuxIds: [],
        concertsIds: [],
        artistesIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);
      
      // Créer une structure avec ce contact
      const structureData = {
        nom: `Structure Test ${Date.now()}`,
        nomLowercase: `structure test ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        raisonSociale: 'SARL Structure Test',
        contactIds: [contactId], // Association du contact (nouveau format unifié)
        adresse: '456 Avenue Test',
        ville: 'Test City',
        codePostal: '75001',
        pays: 'France',
        email: 'structure@test.com',
        telephone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: structureId } = await createEntity('structures', structureData);

      // Simuler la mise à jour bidirectionnelle
      await updateBidirectionalRelation('structure', structureId, 'contact', contactId);

      addTestResult('Test Contact via Structure', 'success', 
        `Contact créé (${contactId}) et associé à la structure (${structureId})`);

      // Vérifier les relations
      await verifyBidirectionalRelation(structureId, contactId, 'structure-contact');

      // Note importante sur le comportement réel
      addTestResult('Note Structure', 'info', 
        'Dans l\'app réelle, StructureForm ne peut PAS créer de contacts inline, il redirige vers /contacts/nouveau');

    } catch (error) {
      addTestResult('Test Contact via Structure', 'error', error.message);
    }
  };

  // Test 4: Partager un contact entre plusieurs entités
  const testSharedContact = async () => {
    addTestResult('Test Contact Partagé', 'running', 'Création en cours...');
    
    try {
      // Créer un contact
      const contactData = {
        nom: `Contact Partagé ${Date.now()}`,
        nomLowercase: `contact partagé ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        email: 'test@partage.com',
        concertsIds: [],
        lieuxIds: [],
        artistesIds: [],
        structureId: '',
        structureNom: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: contactId } = await createEntity('contacts', contactData);

      // Créer un lieu
      const lieuData = {
        nom: `Lieu Partagé ${Date.now()}`,
        nomLowercase: `lieu partagé ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        contactIds: [contactId],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: lieuId } = await createEntity('lieux', lieuData);

      // Créer un date (sans lieu - pas de carte)
      const dateData = {
        titre: `Date Partagé ${Date.now()}`,
        titreLowercase: `concert partagé ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        contactIds: [contactId], // Nouveau format unifié (array)
        date: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: dateId } = await createEntity('concerts', dateData);

      // Créer une structure
      const structureData = {
        nom: `Structure Partagée ${Date.now()}`,
        nomLowercase: `structure partagée ${Date.now()}`.toLowerCase(),
        organizationId: currentOrganization.id,
        raisonSociale: 'EURL Structure Partagée',
        contactIds: [contactId], // Nouveau format unifié
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { id: structureId } = await createEntity('structures', structureData);

      // Mettre à jour les relations bidirectionnelles
      await updateBidirectionalRelation('lieu', lieuId, 'contact', contactId);
      await updateBidirectionalRelation('concert', dateId, 'contact', contactId);
      await updateBidirectionalRelation('structure', structureId, 'contact', contactId);

      addTestResult('Test Contact Partagé', 'success', 
        `Contact (${contactId}) associé au lieu (${lieuId}), date (${dateId}) ET structure (${structureId})`);

      // Vérifier toutes les relations
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      const contactFinal = contactDoc.data();
      
      if (contactFinal.lieuxIds?.includes(lieuId) && 
          contactFinal.concertsIds?.includes(dateId) &&
          contactFinal.structureId === structureId) {
        addTestResult('Vérification Contact Partagé', 'success', 
          'Le contact contient bien les références au lieu, date ET structure');
      } else {
        addTestResult('Vérification Contact Partagé', 'error', 
          'Les relations bidirectionnelles ne sont pas complètes');
      }

    } catch (error) {
      addTestResult('Test Contact Partagé', 'error', error.message);
    }
  };

  // Test 4: Vérifier la visibilité dans la liste
  const testContactVisibility = async () => {
    addTestResult('Test Visibilité Liste', 'running', 'Vérification en cours...');
    
    try {
      // Requête pour récupérer tous les contacts de test
      const q = query(
        collection(db, 'contacts'),
        where('organizationId', '==', currentOrganization.id),
        where('nom', '>=', 'Contact Test'),
        where('nom', '<=', 'Contact Test\uf8ff')
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.size > 0) {
        addTestResult('Test Visibilité Liste', 'success', 
          `${snapshot.size} contacts de test trouvés dans la liste`);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          addTestResult('Contact trouvé', 'info', 
            `${data.nom} - Lieux: ${data.lieuxIds?.length || 0}, Dates: ${data.concertsIds?.length || 0}, Structure: ${data.structureNom || 'Aucune'}`);
        });
      } else {
        addTestResult('Test Visibilité Liste', 'warning', 
          'Aucun contact de test trouvé');
      }

    } catch (error) {
      addTestResult('Test Visibilité Liste', 'error', error.message);
    }
  };

  // Fonction helper pour créer une entité
  const createEntity = async (collectionName, data) => {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, data);
    
    // Ajouter à la liste des entités de test pour le nettoyage
    setTestEntities(prev => ({
      ...prev,
      [collectionName]: [...prev[collectionName], { id: docRef.id, nom: data.nom, titre: data.titre }]
    }));
    
    return { id: docRef.id, ...data };
  };

  // Fonction pour mettre à jour les relations bidirectionnelles
  const updateBidirectionalRelation = async (sourceType, sourceId, targetType, targetId) => {
    const updates = [];

    if (sourceType === 'lieu' && targetType === 'contact') {
      // Mise à jour du contact pour ajouter le lieu
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
      // Mise à jour du contact pour ajouter le concert
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

    if (sourceType === 'structure' && targetType === 'contact') {
      // Mise à jour du contact pour ajouter la structure
      const contactRef = doc(db, 'contacts', targetId);
      const structureDoc = await getDoc(doc(db, 'structures', sourceId));
      const structureData = structureDoc.data();
      
      updates.push(
        updateDoc(contactRef, { 
          structureId: sourceId,
          structureNom: structureData.nom || '',
          structureRaisonSociale: structureData.raisonSociale || '',
          updatedAt: new Date()
        })
      );
    }

    await Promise.all(updates);
  };

  // Fonction pour vérifier les relations bidirectionnelles
  const verifyBidirectionalRelation = async (entityId, contactId, relationType) => {
    try {
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      const contactData = contactDoc.data();

      if (relationType === 'lieu-contact') {
        const lieuDoc = await getDoc(doc(db, 'lieux', entityId));
        const lieuData = lieuDoc.data();

        if (lieuData.contactIds?.includes(contactId) && contactData.lieuxIds?.includes(entityId)) {
          addTestResult('Vérification Bidirectionnelle', 'success', 
            'Relations lieu ↔ contact correctement établies');
        } else {
          addTestResult('Vérification Bidirectionnelle', 'error', 
            'Relations lieu ↔ contact incomplètes');
        }
      }

      if (relationType === 'concert-contact') {
        const dateDoc = await getDoc(doc(db, 'concerts', entityId));
        const dateData = dateDoc.data();

        if (dateData.contactIds?.includes(contactId) && contactData.concertsIds?.includes(entityId)) {
          addTestResult('Vérification Bidirectionnelle', 'success', 
            'Relations date ↔ contact correctement établies');
        } else {
          addTestResult('Vérification Bidirectionnelle', 'error', 
            'Relations date ↔ contact incomplètes');
        }
      }

      if (relationType === 'structure-contact') {
        const structureDoc = await getDoc(doc(db, 'structures', entityId));
        const structureData = structureDoc.data();

        if (structureData.contactIds?.includes(contactId) && contactData.structureId === entityId) {
          addTestResult('Vérification Bidirectionnelle', 'success', 
            'Relations structure ↔ contact correctement établies');
        } else {
          addTestResult('Vérification Bidirectionnelle', 'error', 
            'Relations structure ↔ contact incomplètes');
        }
      }
    } catch (error) {
      addTestResult('Vérification Bidirectionnelle', 'error', error.message);
    }
  };

  // Lancer tous les tests
  const runAllTests = async () => {
    if (!currentOrganization?.id) {
      addTestResult('Erreur', 'error', 'Aucune organisation sélectionnée');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      await testContactFromLieu();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Délai entre les tests

      await testContactFromDate();
      await new Promise(resolve => setTimeout(resolve, 1000));

      await testContactFromStructure();
      await new Promise(resolve => setTimeout(resolve, 1000));

      await testSharedContact();
      await new Promise(resolve => setTimeout(resolve, 1000));

      await testContactVisibility();

      addTestResult('Tests terminés', 'success', 'Tous les tests ont été exécutés');
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
          <h2>Test de création de contacts via formulaires</h2>
          <p className={styles.description}>
            Cet outil teste la création de contacts depuis différents formulaires 
            et vérifie les relations bidirectionnelles.
          </p>
        </div>

        <div className={styles.controls}>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            variant="primary"
          >
            {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
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

        {testEntities.contacts.length > 0 && (
          <div className={styles.entities}>
            <h3>Entités de test créées</h3>
            <div className={styles.entityList}>
              <div>
                <strong>Contacts:</strong> {testEntities.contacts.map(c => c.nom).join(', ')}
              </div>
              <div>
                <strong>Lieux:</strong> {testEntities.lieux.map(l => l.nom).join(', ')}
              </div>
              <div>
                <strong>Dates:</strong> {testEntities.concerts.map(c => c.titre || c.nom || c.id).join(', ')}
              </div>
              <div>
                <strong>Structures:</strong> {testEntities.structures.map(s => s.nom).join(', ')}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContactCreationTester;