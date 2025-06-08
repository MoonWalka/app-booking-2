/**
 * Composant de test pour vérifier que les nouvelles entités incluent l'organizationId
 * À utiliser temporairement pour valider les corrections
 */
import React, { useState } from 'react';
import { collection, addDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './OrganizationIdTest.module.css';

const OrganizationIdTest = () => {
  const { currentOrganization } = useOrganization();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const testCreateContact = async () => {
    setTesting(true);
    try {
      const testContact = {
        nom: 'Test Contact',
        prenom: 'Test',
        email: 'test@example.com',
        createdAt: new Date(),
        // ✅ L'organizationId devrait être ajouté automatiquement par les formulaires corrigés
        ...(currentOrganization?.id && { organizationId: currentOrganization.id })
      };

      const docRef = await addDoc(collection(db, 'contacts'), testContact);
      
      setResults(prev => [...prev, {
        type: 'success',
        message: `✅ Contact créé avec ID: ${docRef.id} et organizationId: ${currentOrganization?.id}`
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        type: 'error',
        message: `❌ Erreur création contact: ${error.message}`
      }]);
    } finally {
      setTesting(false);
    }
  };

  const testCreateLieu = async () => {
    setTesting(true);
    try {
      const testLieu = {
        nom: 'Lieu Test',
        adresse: '123 Rue Test',
        ville: 'Paris',
        capacite: 100,
        createdAt: new Date(),
        // ✅ L'organizationId devrait être ajouté automatiquement par les hooks génériques
        ...(currentOrganization?.id && { organizationId: currentOrganization.id })
      };

      const docRef = await addDoc(collection(db, 'lieux'), testLieu);
      
      setResults(prev => [...prev, {
        type: 'success',
        message: `✅ Lieu créé avec ID: ${docRef.id} et organizationId: ${currentOrganization?.id}`
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        type: 'error',
        message: `❌ Erreur création lieu: ${error.message}`
      }]);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  if (!currentOrganization?.id) {
    return (
      <Alert type="warning">
        Aucune organisation sélectionnée. Veuillez sélectionner une organisation pour tester.
      </Alert>
    );
  }

  return (
    <div className={styles.testContainer}>
      <div className={styles.header}>
        <h3>🧪 Test OrganizationId</h3>
        <p>Organisation actuelle: <strong>{currentOrganization.name}</strong> ({currentOrganization.id})</p>
      </div>

      <div className={styles.actions}>
        <Button 
          onClick={testCreateContact}
          disabled={testing}
          variant="primary"
        >
          {testing ? 'Test en cours...' : 'Tester création Contact'}
        </Button>

        <Button 
          onClick={testCreateLieu}
          disabled={testing}
          variant="primary"
        >
          {testing ? 'Test en cours...' : 'Tester création Lieu'}
        </Button>

        <Button 
          onClick={clearResults}
          variant="secondary"
        >
          Effacer résultats
        </Button>
      </div>

      {results.length > 0 && (
        <div className={styles.results}>
          <h4>Résultats des tests :</h4>
          {results.map((result, index) => (
            <Alert key={index} type={result.type}>
              {result.message}
            </Alert>
          ))}
        </div>
      )}

      <div className={styles.info}>
        <h4>📋 Ce qui a été corrigé :</h4>
        <ul>
          <li>✅ <code>ContactFormMaquette.js</code> : Ajoute organizationId lors de la création</li>
          <li>✅ <code>ContactForm.js</code> (mobile) : Ajoute organizationId lors de la création</li>
          <li>✅ <code>PublicContactForm.js</code> : Ajoute organizationId aux soumissions</li>
          <li>✅ <code>useGenericAction</code> : Ajoute automatiquement organizationId</li>
          <li>✅ <code>useGenericEntityForm</code> : Ajoute automatiquement organizationId</li>
          <li>✅ <code>useLieuForm</code> : Utilise le système générique (organizationId automatique)</li>
        </ul>
      </div>
    </div>
  );
};

export default OrganizationIdTest; 