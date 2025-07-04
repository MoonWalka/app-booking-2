import React, { useState } from 'react';
import { Button, Card, ButtonGroup, Alert } from 'react-bootstrap';
import { FaBuilding, FaUser, FaCheck } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';
import styles from './QuickContactCreator.module.css';

function QuickContactCreator() {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  // Générateurs de données
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

  // Créer une structure complète
  const createStructure = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    try {
      const numero = randomInt(1000, 9999);
      const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille'];
      const types = ['Association', 'SARL', 'SAS', 'SCOP', 'EURL'];
      const noms = ['CultureLive', 'ArtScene', 'MusicProd', 'EventPro', 'SpectaclePlus'];
      
      const structureData = {
        // Type obligatoire
        type: 'structure',
        
        // Nom et raison sociale
        nom: `${randomElement(types)} ${randomElement(noms)} ${numero}`,
        structureRaisonSociale: `${randomElement(types)} ${randomElement(noms)} ${numero}`,
        
        // Adresse complète
        structureAdresse: `${randomInt(1, 200)} ${randomElement(['rue', 'avenue', 'boulevard'])} ${randomElement(['de la Culture', 'des Arts', 'de la Musique', 'du Théâtre'])}`,
        structureCodePostal: `${randomInt(10, 95)}000`,
        structureVille: randomElement(villes),
        structurePays: 'France',
        
        // Informations légales
        structureSiret: Array.from({ length: 14 }, () => randomInt(0, 9)).join(''),
        structureNumeroTva: `FR${randomInt(10, 99)}${Array.from({ length: 9 }, () => randomInt(0, 9)).join('')}`,
        structureLicence: `${randomInt(1, 3)}-${randomInt(100000, 999999)}`,
        
        // Contact principal
        personneNom: randomElement(['Dupont', 'Martin', 'Bernard', 'Durand', 'Moreau']),
        personnePrenom: randomElement(['Jean', 'Marie', 'Pierre', 'Sophie', 'Claude']),
        personneFonction: randomElement(['Directeur', 'Programmateur', 'Responsable culturel', 'Président']),
        personneTelephone: `0${randomInt(1, 9)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        personneEmail: `contact${numero}@${randomElement(noms).toLowerCase()}.fr`,
        
        // Informations bancaires (optionnel)
        iban: `FR${randomInt(10, 99)} ${Array.from({ length: 23 }, () => randomInt(0, 9)).join('')}`,
        bic: `${randomElement(['BNPA', 'SOCE', 'CMCI', 'AGRI'])}FRPP`,
        
        // Métadonnées
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: ['contact', 'structure'],
        
        // Champs supplémentaires pour compatibilité
        email: `contact${numero}@${randomElement(noms).toLowerCase()}.fr`,
        telephone: `0${randomInt(1, 9)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        adresse: `${randomInt(1, 200)} ${randomElement(['rue', 'avenue', 'boulevard'])} ${randomElement(['de la Culture', 'des Arts', 'de la Musique', 'du Théâtre'])}`,
        codePostal: `${randomInt(10, 95)}000`,
        ville: randomElement(villes),
        pays: 'France'
      };

      const docRef = await addDoc(collection(db, 'structures'), structureData);
      
      setLastCreated({
        type: 'structure',
        id: docRef.id,
        nom: structureData.nom
      });

      toast.success(`Structure "${structureData.nom}" créée avec succès !`);
      console.log('Structure créée:', docRef.id, structureData);
      
      // Émettre l'événement pour rafraîchir les listes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('structureCreated', { 
          detail: { structureId: docRef.id } 
        }));
      }

    } catch (error) {
      console.error('Erreur création structure:', error);
      toast.error('Erreur lors de la création de la structure');
    } finally {
      setLoading(false);
    }
  };

  // Créer une personne complète
  const createPersonne = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    try {
      const numero = randomInt(1000, 9999);
      const prenoms = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Claude', 'Michel', 'Françoise', 'Bernard'];
      const noms = ['Dupont', 'Martin', 'Bernard', 'Durand', 'Moreau', 'Lefebvre', 'Leroy', 'Roux'];
      const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille'];
      
      const prenom = randomElement(prenoms);
      const nom = randomElement(noms);
      
      const personneData = {
        // Type obligatoire
        type: 'personne',
        
        // Identité
        nom: nom,
        prenom: prenom,
        
        // Contact
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}${numero}@gmail.com`,
        telephone: `06 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        telephoneFixe: Math.random() > 0.5 ? `0${randomInt(1, 9)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}` : '',
        
        // Adresse personnelle
        adresse: `${randomInt(1, 100)} ${randomElement(['rue', 'avenue', 'place'])} ${randomElement(['des Lilas', 'du Marché', 'de la République', 'Victor Hugo'])}`,
        codePostal: `${randomInt(10, 95)}000`,
        ville: randomElement(villes),
        pays: 'France',
        
        // Fonction
        fonction: randomElement(['Artiste', 'Manager', 'Technicien', 'Chargé de production', 'Régisseur', 'Ingénieur son']),
        
        // Réseaux sociaux (optionnel)
        siteWeb: Math.random() > 0.5 ? `https://www.${prenom.toLowerCase()}-${nom.toLowerCase()}.com` : '',
        facebook: Math.random() > 0.5 ? `@${prenom.toLowerCase()}${nom.toLowerCase()}` : '',
        instagram: Math.random() > 0.5 ? `@${prenom.toLowerCase()}_${nom.toLowerCase()}` : '',
        
        // Notes
        notes: `Contact professionnel dans le domaine culturel. ${randomElement(['Très réactif', 'Expérience confirmée', 'Bon relationnel', 'Expertise technique'])}.`,
        
        // Métadonnées
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: ['contact', 'personne'],
        
        // Champ pour l'affichage
        displayName: `${prenom} ${nom}`
      };

      const docRef = await addDoc(collection(db, 'personnes'), personneData);
      
      setLastCreated({
        type: 'personne',
        id: docRef.id,
        nom: `${prenom} ${nom}`
      });

      toast.success(`Personne "${prenom} ${nom}" créée avec succès !`);
      console.log('Personne créée:', docRef.id, personneData);
      
      // Émettre l'événement pour rafraîchir les listes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('personneCreated', { 
          detail: { personneId: docRef.id } 
        }));
      }

    } catch (error) {
      console.error('Erreur création personne:', error);
      toast.error('Erreur lors de la création de la personne');
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className={styles.card}>
      <Card.Header>
        <h5 className="mb-0">🚀 Création rapide de contacts</h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Créer des contacts complets avec toutes les informations nécessaires
        </p>

        <ButtonGroup className="w-100 mb-3">
          <Button
            variant="primary"
            onClick={createStructure}
            disabled={loading || !currentOrganization}
            className="d-flex align-items-center justify-content-center"
          >
            <FaBuilding className="me-2" />
            Créer une Structure
          </Button>
          <Button
            variant="info"
            onClick={createPersonne}
            disabled={loading || !currentOrganization}
            className="d-flex align-items-center justify-content-center"
          >
            <FaUser className="me-2" />
            Créer une Personne
          </Button>
        </ButtonGroup>

        {lastCreated && (
          <Alert variant="success" className="mb-0">
            <FaCheck className="me-2" />
            Dernier {lastCreated.type} créé : <strong>{lastCreated.nom}</strong>
            <br />
            <small className="text-muted">ID: {lastCreated.id}</small>
          </Alert>
        )}

        {!currentOrganization && (
          <Alert variant="warning" className="mb-0">
            Veuillez sélectionner une organisation
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default QuickContactCreator;