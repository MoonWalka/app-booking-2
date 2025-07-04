/**
 * Version améliorée du bouton de test qui respecte les workflows réels
 */
import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import { FaFlask, FaBroom, FaPlay, FaDatabase, FaRandom } from 'react-icons/fa';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { v4 as uuidv4 } from 'uuid';

function TestWorkflowButton2({ onDataGenerated, variant = 'outline-primary', size = 'md' }) {
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentOrganization } = useOrganization();
  
  // États pour stocker les entités existantes
  const [existingContacts, setExistingContacts] = useState([]);
  const [existingArtistes, setExistingArtistes] = useState([]);
  const [existingLieux, setExistingLieux] = useState([]);

  // Charger les entités existantes au montage
  useEffect(() => {
    if (currentOrganization?.id) {
      loadExistingEntities();
    }
  }, [currentOrganization?.id]);

  // Ne pas afficher en production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const loadExistingEntities = async () => {
    try {
      // Charger les contacts/structures existants
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('organizationId', '==', currentOrganization.id),
        where('type', '==', 'structure'),
        limit(20)
      );
      const contactsSnap = await getDocs(contactsQuery);
      setExistingContacts(contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Charger les artistes existants
      const artistesQuery = query(
        collection(db, 'artistes'),
        where('organizationId', '==', currentOrganization.id),
        limit(20)
      );
      const artistesSnap = await getDocs(artistesQuery);
      setExistingArtistes(artistesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Charger les lieux existants
      const lieuxQuery = query(
        collection(db, 'lieux'),
        where('organizationId', '==', currentOrganization.id),
        limit(20)
      );
      const lieuxSnap = await getDocs(lieuxQuery);
      setExistingLieux(lieuxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erreur lors du chargement des entités:', error);
    }
  };

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

  /**
   * Scénario 1 : Créer une date avec des entités existantes
   */
  const handleCreateWithExisting = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    if (!existingContacts.length || !existingArtistes.length) {
      toast.warning('Vous devez avoir au moins un contact et un artiste existant');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Création d\'une date avec entités existantes...');

      // Sélectionner aléatoirement des entités existantes
      const contact = randomElement(existingContacts);
      const artiste = randomElement(existingArtistes);
      
      // Créer ou sélectionner un lieu
      let lieu;
      if (existingLieux.length > 0 && Math.random() > 0.5) {
        lieu = randomElement(existingLieux);
      } else {
        // Créer un nouveau lieu
        const lieuData = {
          type: 'lieu',
          nom: `[TEST] Salle ${randomInt(1000, 9999)}`,
          adresse: `${randomInt(1, 200)} rue de Test`,
          codePostal: `${randomInt(10, 95)}000`,
          ville: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse']),
          pays: 'France',
          capacite: randomInt(100, 1000),
          organizationId: currentOrganization.id,
          tags: ['test'],
          isTest: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        const lieuRef = await addDoc(collection(db, 'lieux'), lieuData);
        lieu = { id: lieuRef.id, ...lieuData };
        console.log('✅ Nouveau lieu créé:', lieuRef.id);
      }

      // Créer le concert
      const formToken = uuidv4();
      const concertData = {
        date: new Date(Date.now() + randomInt(7, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        heure: `${randomInt(19, 21)}:${randomElement(['00', '30'])}`,
        // Structure
        structureId: contact.id,
        structureNom: contact.structureRaisonSociale || contact.nom,
        // Compatibilité ancien format
        organisateurId: contact.id,
        organisateurNom: contact.structureRaisonSociale || contact.nom,
        // Lieu
        lieuId: lieu.id,
        lieuNom: lieu.nom,
        lieuVille: lieu.ville,
        // Artiste
        artisteId: artiste.id,
        artisteNom: artiste.nom || artiste.nomArtiste,
        projetNom: artiste.projets?.[0]?.nom || 'Tournée 2025',
        // Infos supplémentaires
        libelle: `[TEST] Concert ${artiste.nom || artiste.nomArtiste} à ${lieu.nom}`,
        genre: artiste.genre || 'Rock',
        cachetBrut: randomInt(500, 5000),
        statut: 'En cours',
        statutFormulaire: 'non_envoye',
        formToken: formToken,
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const concertRef = await addDoc(collection(db, 'concerts'), concertData);
      console.log('✅ Concert créé avec entités existantes:', concertRef.id);

      // Émettre l'événement de rafraîchissement
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('concertCreated', { 
          detail: { concertId: concertRef.id, isTest: true } 
        }));
      }

      toast.success(
        <div>
          <strong>✅ Date créée avec entités existantes !</strong>
          <br />
          <small>
            Structure: {contact.structureRaisonSociale || contact.nom}<br />
            Artiste: {artiste.nom || artiste.nomArtiste}<br />
            Lieu: {lieu.nom}
          </small>
        </div>,
        { autoClose: 10000 }
      );

      if (onDataGenerated) {
        onDataGenerated({
          concert: { id: concertRef.id, ...concertData },
          contact,
          artiste,
          lieu,
          formToken,
          formUrl: `/formulaire/${formToken}`
        });
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Scénario 2 : Créer un workflow complet (tout nouveau)
   */
  const handleCreateCompleteWorkflow = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Création d\'un workflow complet de test...');

      // 1. Créer un artiste
      const artisteData = {
        nom: `[TEST] Artiste ${randomInt(1000, 9999)}`,
        nomArtiste: `[TEST] Artiste ${randomInt(1000, 9999)}`,
        genre: randomElement(['Rock', 'Jazz', 'Pop', 'Electro']),
        projets: [{
          id: uuidv4(),
          nom: `Tournée ${new Date().getFullYear()}`,
          description: 'Projet de test'
        }],
        contactNom: 'Manager Test',
        contactTelephone: `06 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        contactEmail: `test${randomInt(1000, 9999)}@example.com`,
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const artisteRef = await addDoc(collection(db, 'artistes'), artisteData);
      console.log('✅ Artiste créé:', artisteRef.id);

      // 2. Créer un contact/structure
      const contactData = {
        type: 'structure',
        structureRaisonSociale: `[TEST] Structure ${randomInt(1000, 9999)}`,
        nom: `[TEST] Structure ${randomInt(1000, 9999)}`,
        structureAdresse: `${randomInt(1, 200)} rue de Test`,
        structureCodePostal: `${randomInt(10, 95)}000`,
        structureVille: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse']),
        structurePays: 'France',
        personneNom: randomElement(['Dupont', 'Martin', 'Bernard']),
        personnePrenom: randomElement(['Jean', 'Marie', 'Pierre']),
        personneTelephone: `01 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        personneEmail: `contact${randomInt(1000, 9999)}@test.fr`,
        personneFonction: 'Directeur',
        structureSiret: Array.from({ length: 14 }, () => randomInt(0, 9)).join(''),
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const contactRef = await addDoc(collection(db, 'contacts'), contactData);
      console.log('✅ Contact créé:', contactRef.id);

      // 3. Créer un lieu
      const lieuData = {
        type: 'lieu',
        nom: `[TEST] ${randomElement(['Salle', 'Théâtre', 'Zénith'])} ${randomInt(1000, 9999)}`,
        adresse: `${randomInt(1, 200)} avenue du Test`,
        codePostal: `${randomInt(10, 95)}000`,
        ville: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse']),
        pays: 'France',
        capacite: randomInt(100, 2000),
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const lieuRef = await addDoc(collection(db, 'lieux'), lieuData);
      console.log('✅ Lieu créé:', lieuRef.id);

      // 4. Créer le concert
      const formToken = uuidv4();
      const concertData = {
        date: new Date(Date.now() + randomInt(7, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        heure: `${randomInt(19, 21)}:${randomElement(['00', '30'])}`,
        structureId: contactRef.id,
        structureNom: contactData.nom,
        organisateurId: contactRef.id,
        organisateurNom: contactData.nom,
        lieuId: lieuRef.id,
        lieuNom: lieuData.nom,
        lieuVille: lieuData.ville,
        artisteId: artisteRef.id,
        artisteNom: artisteData.nom,
        projetNom: artisteData.projets[0].nom,
        libelle: `[TEST] Concert complet de test`,
        genre: artisteData.genre,
        cachetBrut: randomInt(1000, 5000),
        statut: 'En cours',
        statutFormulaire: 'non_envoye',
        formToken: formToken,
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const concertRef = await addDoc(collection(db, 'concerts'), concertData);
      console.log('✅ Concert créé:', concertRef.id);

      // Émettre l'événement
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('concertCreated', { 
          detail: { concertId: concertRef.id, isTest: true } 
        }));
      }

      toast.success(
        <div>
          <strong>✅ Workflow complet créé !</strong>
          <br />
          <small>
            Toutes les entités ont été créées<br />
            <a href={`/formulaire/${formToken}`} target="_blank" rel="noopener noreferrer">
              Ouvrir le formulaire →
            </a>
          </small>
        </div>,
        { autoClose: 10000 }
      );

      // Recharger les entités existantes
      loadExistingEntities();

      if (onDataGenerated) {
        onDataGenerated({
          artiste: { id: artisteRef.id, ...artisteData },
          contact: { id: contactRef.id, ...contactData },
          lieu: { id: lieuRef.id, ...lieuData },
          concert: { id: concertRef.id, ...concertData },
          formToken,
          formUrl: `/formulaire/${formToken}`
        });
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la création du workflow');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Scénario 3 : Créer des données de base pour tests
   */
  const handleCreateTestData = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Création de données de base pour tests...');

      // Créer 3 artistes
      for (let i = 0; i < 3; i++) {
        const artisteData = {
          nom: `[TEST] ${randomElement(['Les Rockeurs', 'Jazz Quartet', 'DJ Electric'])} ${randomInt(100, 999)}`,
          nomArtiste: `[TEST] Artiste ${randomInt(100, 999)}`,
          genre: randomElement(['Rock', 'Jazz', 'Electro', 'Pop']),
          projets: [{
            id: uuidv4(),
            nom: `Tournée ${new Date().getFullYear()}`,
            description: 'Projet de test'
          }],
          organizationId: currentOrganization.id,
          tags: ['test'],
          isTest: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'artistes'), artisteData);
      }

      // Créer 3 structures
      for (let i = 0; i < 3; i++) {
        const contactData = {
          type: 'structure',
          structureRaisonSociale: `[TEST] ${randomElement(['Association', 'SARL', 'SAS'])} ${randomInt(100, 999)}`,
          nom: `[TEST] Structure ${randomInt(100, 999)}`,
          structureVille: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse']),
          structurePays: 'France',
          organizationId: currentOrganization.id,
          tags: ['test'],
          isTest: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'contacts'), contactData);
      }

      // Créer 3 lieux
      for (let i = 0; i < 3; i++) {
        const lieuData = {
          type: 'lieu',
          nom: `[TEST] ${randomElement(['Salle', 'Théâtre', 'Café'])} ${randomInt(100, 999)}`,
          ville: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse']),
          capacite: randomInt(50, 500),
          organizationId: currentOrganization.id,
          tags: ['test'],
          isTest: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'lieux'), lieuData);
      }

      toast.success('✅ Données de base créées : 3 artistes, 3 structures, 3 lieux');
      
      // Recharger les entités
      loadExistingEntities();

    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la création des données');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Nettoie toutes les données de test
   */
  const handleCleanup = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les données de test ?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('🧹 Nettoyage des données de test...');
      
      const collections = ['concerts', 'lieux', 'contacts', 'artistes'];
      let totalDeleted = 0;

      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('organizationId', '==', currentOrganization.id),
          where('isTest', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
          totalDeleted++;
        }
      }

      toast.success(`🧹 ${totalDeleted} données de test supprimées`);
      
      // Recharger les entités
      loadExistingEntities();
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors du nettoyage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dropdown show={showDropdown} onToggle={setShowDropdown}>
      <Dropdown.Toggle
        variant={variant}
        size={size}
        disabled={loading}
      >
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <FaFlask className="me-1" />
            Test avancé
          </>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>🧪 Scénarios de test</Dropdown.Header>
        
        <Dropdown.Item 
          onClick={handleCreateWithExisting}
          disabled={!existingContacts.length || !existingArtistes.length}
        >
          <FaRandom className="me-2 text-info" />
          Date avec entités existantes
          {(!existingContacts.length || !existingArtistes.length) && (
            <small className="d-block text-muted">
              (Créez d'abord des données de base)
            </small>
          )}
        </Dropdown.Item>
        
        <Dropdown.Item onClick={handleCreateCompleteWorkflow}>
          <FaPlay className="me-2 text-success" />
          Workflow complet (tout nouveau)
        </Dropdown.Item>
        
        <Dropdown.Item onClick={handleCreateTestData}>
          <FaDatabase className="me-2 text-primary" />
          Créer données de base
        </Dropdown.Item>
        
        <Dropdown.Divider />
        
        <Dropdown.Item onClick={handleCleanup} className="text-danger">
          <FaBroom className="me-2" />
          Nettoyer données test
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default TestWorkflowButton2;