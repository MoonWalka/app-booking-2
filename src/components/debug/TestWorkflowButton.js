/**
 * Wrapper simple pour le bouton de test de workflow
 * Évite les problèmes d'import circulaire
 */
import React, { useState } from 'react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import { FaFlask, FaBroom, FaPlay } from 'react-icons/fa';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';

// Import direct du service simplifié
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { v4 as uuidv4 } from 'uuid';

function TestWorkflowButton({ onDataGenerated, variant = 'outline-primary', size = 'md' }) {
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentOrganization } = useOrganization();

  // Ne pas afficher en production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

  /**
   * Crée un workflow de test complet
   */
  const handleCreateWorkflow = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Création du workflow de test...');
      console.log('🏢 OrganizationId utilisé:', currentOrganization.id);

      // 1. Créer un artiste simple
      const artisteData = {
        nom: `[TEST] Artiste ${randomInt(1000, 9999)}`,
        nomArtiste: `[TEST] Artiste ${randomInt(1000, 9999)}`,
        genre: randomElement(['Rock', 'Jazz', 'Pop']),
        projets: [{
          id: uuidv4(),
          nom: `Tournée ${new Date().getFullYear()}`,
          description: 'Projet de test'
        }],
        contactNom: 'Manager Test',
        contactTelephone: '06 12 34 56 78',
        contactEmail: 'test@example.com',
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const artisteRef = await addDoc(collection(db, 'artistes'), artisteData);
      console.log('✅ Artiste créé:', artisteRef.id);

      // 2. Créer un programmateur
      const programmateurData = {
        type: 'structure',
        structureRaisonSociale: `[TEST] Structure ${randomInt(1000, 9999)}`,
        nom: `[TEST] Structure ${randomInt(1000, 9999)}`,
        structureAdresse: '123 rue de Test',
        structureCodePostal: '75001',
        structureVille: 'Paris',
        structurePays: 'France',
        personneNom: 'Dupont',
        personnePrenom: 'Jean',
        personneTelephone: '01 23 45 67 89',
        personneEmail: 'contact@test.fr',
        personneFonction: 'Directeur',
        structureSiret: '12345678901234',
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const programmateurRef = await addDoc(collection(db, 'contacts'), programmateurData);
      console.log('✅ Programmateur créé:', programmateurRef.id);

      // 3. Créer un lieu
      const lieuData = {
        type: 'lieu',
        nom: `[TEST] Salle ${randomInt(1000, 9999)}`,
        adresse: '456 avenue du Test',
        codePostal: '75002',
        ville: 'Paris',
        pays: 'France',
        capacite: 500,
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const lieuRef = await addDoc(collection(db, 'lieux'), lieuData);
      console.log('✅ Lieu créé:', lieuRef.id);

      // 4. Créer un concert
      const formToken = uuidv4();
      const dateData = {
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 30 jours
        heure: '20:30',
        // Structure (nouveau format)
        structureId: programmateurRef.id,
        structureNom: programmateurData.nom,
        // Organisateur (ancien format pour compatibilité)
        organisateurId: programmateurRef.id,
        organisateurNom: programmateurData.nom,
        lieuId: lieuRef.id,
        lieuNom: lieuData.nom,  // Ajout du nom du lieu
        lieuVille: lieuData.ville,  // Ajout de la ville du lieu
        artisteId: artisteRef.id,
        artisteNom: artisteData.nom,
        projetNom: artisteData.projets[0].nom,
        libelle: `[TEST] Date de test`,
        genre: artisteData.genre,
        cachetBrut: 1000,
        statut: 'En cours',
        statutFormulaire: 'non_envoye',
        formToken: formToken,
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const concertRef = await addDoc(collection(db, 'dates'), dateData);
      console.log('✅ Date créé:', concertRef.id);
      
      // Debug : Vérifier exactement ce qui a été créé
      console.log('📊 Données du date créé :', {
        id: concertRef.id,
        date: dateData.date,
        organizationId: dateData.organizationId,
        structureId: dateData.structureId,
        structureNom: dateData.structureNom,
        organisateurId: dateData.organisateurId,
        organisateurNom: dateData.organisateurNom,
        lieuId: dateData.lieuId,
        artisteId: dateData.artisteId,
        artisteNom: dateData.artisteNom
      });

      // Vérifier immédiatement si la date est visible
      console.log('🔍 Vérification de la visibilité de la date...');
      const verificationQuery = query(
        collection(db, 'dates'),
        where('organizationId', '==', currentOrganization.id),
        orderBy('date', 'desc')
      );
      
      try {
        const snapshot = await getDocs(verificationQuery);
        const dates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const testDate = dates.find(d => d.id === concertRef.id);
        
        if (testDate) {
          console.log('✅ Date de test trouvée dans la requête !', testDate);
        } else {
          console.log('❌ Date de test NON trouvée dans la requête !');
          console.log('📊 Nombre total de dates trouvées:', dates.length);
        }
      } catch (verifyError) {
        console.error('⚠️ Erreur lors de la vérification:', verifyError);
        if (verifyError.message && verifyError.message.includes('index')) {
          console.error('💡 Il semble qu\'il manque un index composite dans Firestore pour: organizationId + date');
        }
      }

      // Notification de succès
      toast.success(
        <div>
          <strong>✅ Workflow de test créé !</strong>
          <br />
          <small>
            Artiste: {artisteData.nom}<br />
            Lieu: {lieuData.nom}<br />
            <a href={`/formulaire/${formToken}`} target="_blank" rel="noopener noreferrer">
              Ouvrir le formulaire →
            </a>
          </small>
        </div>,
        { autoClose: 10000 }
      );

      // Émettre un événement pour forcer le rafraîchissement des listes
      if (typeof window !== 'undefined') {
        console.log('🔄 Émission événement de rafraîchissement des concerts');
        window.dispatchEvent(new CustomEvent('concertCreated', { 
          detail: { dateId: concertRef.id, isTest: true } 
        }));
      }

      if (onDataGenerated) {
        onDataGenerated({
          artiste: { id: artisteRef.id, ...artisteData },
          programmateur: { id: programmateurRef.id, ...programmateurData },
          lieu: { id: lieuRef.id, ...lieuData },
          concert: { id: concertRef.id, ...dateData },
          formToken: formToken,
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
            Test
          </>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>🧪 Outils de test</Dropdown.Header>
        
        <Dropdown.Item onClick={handleCreateWorkflow}>
          <FaPlay className="me-2 text-success" />
          Créer workflow complet
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

export default TestWorkflowButton;