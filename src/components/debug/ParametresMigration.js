import React, { useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Composant pour migrer les paramètres globaux vers l'organisation actuelle
 */
const ParametresMigration = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [migrationStatus, setMigrationStatus] = useState(null);

  // Vérifier l'état de la migration
  const checkMigrationStatus = async () => {
    if (!currentOrganization?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Vérifier les paramètres globaux
      const globalDoc = await getDoc(doc(db, 'parametres', 'global'));
      const hasGlobalParams = globalDoc.exists();

      // Vérifier les paramètres de l'organisation
      const orgDoc = await getDoc(
        doc(db, 'organizations', currentOrganization.id, 'parametres', 'settings')
      );
      const hasOrgParams = orgDoc.exists();

      setMigrationStatus({
        hasGlobalParams,
        hasOrgParams,
        globalData: hasGlobalParams ? globalDoc.data() : null,
        orgData: hasOrgParams ? orgDoc.data() : null
      });

      if (hasGlobalParams && !hasOrgParams) {
        setMessage('⚠️ Migration nécessaire : des paramètres globaux existent mais pas de paramètres pour cette organisation');
      } else if (hasGlobalParams && hasOrgParams) {
        setMessage('ℹ️ Les deux configurations existent. Vous pouvez migrer pour synchroniser.');
      } else if (!hasGlobalParams && hasOrgParams) {
        setMessage('✅ Configuration correcte : paramètres isolés par organisation');
      } else {
        setMessage('ℹ️ Aucune configuration trouvée');
      }

    } catch (error) {
      console.error('Erreur vérification migration:', error);
      setError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  // Effectuer la migration
  const performMigration = async () => {
    if (!currentOrganization?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    if (!migrationStatus?.hasGlobalParams) {
      setError('Aucune donnée globale à migrer');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Migration en cours...');

    try {
      const globalData = migrationStatus.globalData;
      
      // Si des paramètres org existent déjà, fusionner intelligemment
      let finalData = globalData;
      
      if (migrationStatus.hasOrgParams) {
        const orgData = migrationStatus.orgData;
        finalData = { ...globalData };
        
        // Fusionner section par section
        Object.keys(orgData).forEach(section => {
          if (orgData[section] && typeof orgData[section] === 'object') {
            finalData[section] = {
              ...globalData[section],
              ...orgData[section]
            };
          }
        });
      }

      // Sauvegarder dans l'organisation
      await setDoc(
        doc(db, 'organizations', currentOrganization.id, 'parametres', 'settings'),
        finalData
      );

      setMessage('✅ Migration réussie ! Les paramètres sont maintenant isolés par organisation.');
      
      // Forcer un rechargement de la page pour rafraîchir ParametresContext
      setTimeout(() => {
        setMessage('🔄 Rechargement de la page pour appliquer les changements...');
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erreur migration:', error);
      setError(`Erreur lors de la migration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🔄 Migration des Paramètres</h5>
      </Card.Header>
      <Card.Body>
        {message && <Alert variant="info">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading && <LoadingSpinner />}
        
        <div className="mb-3">
          <p>
            <strong>Organisation actuelle :</strong> {currentOrganization?.name || 'Non sélectionnée'}
          </p>
          
          {migrationStatus && (
            <div className="mt-3">
              <h6>État de la migration :</h6>
              <ul>
                <li>
                  Paramètres globaux : {migrationStatus.hasGlobalParams ? '✅ Trouvés' : '❌ Absents'}
                  {migrationStatus.hasGlobalParams && migrationStatus.globalData && (
                    <span className="text-muted">
                      {' '}({Object.keys(migrationStatus.globalData).length} sections)
                    </span>
                  )}
                </li>
                <li>
                  Paramètres organisation : {migrationStatus.hasOrgParams ? '✅ Trouvés' : '❌ Absents'}
                  {migrationStatus.hasOrgParams && migrationStatus.orgData && (
                    <span className="text-muted">
                      {' '}({Object.keys(migrationStatus.orgData).length} sections)
                    </span>
                  )}
                </li>
              </ul>

              {migrationStatus.globalData?.email?.brevo?.apiKey && (
                <Alert variant="warning" className="mt-2">
                  <strong>⚠️ Données sensibles détectées :</strong> Une clé API Brevo chiffrée sera migrée.
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={checkMigrationStatus}
            disabled={loading || !currentOrganization?.id}
          >
            🔍 Vérifier l'état
          </Button>
          
          {migrationStatus?.hasGlobalParams && (
            <Button
              variant="primary"
              onClick={performMigration}
              disabled={loading || !currentOrganization?.id}
            >
              🔄 Migrer les paramètres
            </Button>
          )}
        </div>

        <div className="mt-4">
          <h6>📋 Informations</h6>
          <ul className="small text-muted">
            <li>Cette migration sécurise vos paramètres en les isolant par organisation</li>
            <li>Les clés API et mots de passe restent chiffrés pendant la migration</li>
            <li>Si des paramètres existent déjà pour l'organisation, ils seront fusionnés</li>
            <li>Les paramètres globaux ne sont pas supprimés automatiquement</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ParametresMigration;