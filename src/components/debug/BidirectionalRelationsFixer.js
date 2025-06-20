import React, { useState } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { fixArtisteConcertRelations } from '@/utils/fixBidirectionalRelationsBrowser';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import styles from './DebugController.module.css';

const BidirectionalRelationsFixer = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFix = async () => {
    if (!currentOrganization?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const stats = await fixArtisteConcertRelations(currentOrganization.id);
      setResult(stats);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la réparation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.debugCard}>
      <h3>🔧 Réparation des Relations Bidirectionnelles</h3>
      
      <div className={styles.section}>
        <p className={styles.description}>
          Cet outil répare les relations manquantes entre les concerts et les artistes.
          Il s'assure que chaque concert référencé par un artiste existe bien dans 
          la liste concertsIds de cet artiste.
        </p>
        
        <p className={styles.warning}>
          <strong>Organisation actuelle:</strong> {currentOrganization?.name || 'Non définie'}
        </p>
      </div>

      <div className={styles.actions}>
        <button 
          className="btn btn-primary"
          onClick={handleFix}
          disabled={loading || !currentOrganization}
        >
          {loading ? 'Réparation en cours...' : 'Lancer la réparation'}
        </button>
      </div>

      {error && (
        <Alert type="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert type="success" className={styles.alert}>
          <h4>✅ Réparation terminée</h4>
          <ul>
            <li>Concerts vérifiés: {result.checked}</li>
            <li>Relations corrigées: {result.fixed}</li>
            <li>Erreurs: {result.errors}</li>
          </ul>
        </Alert>
      )}
    </Card>
  );
};

export default BidirectionalRelationsFixer;