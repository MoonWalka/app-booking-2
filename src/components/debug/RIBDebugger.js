import React, { useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { useEntreprise } from '@/context/EntrepriseContext';
import { migrateRIBDataForOrganization, checkRIBData } from '@/utils/migrateRIBData';
import styles from './RIBDebugger.module.css';

/**
 * Composant de débogage pour les données RIB
 * Permet de vérifier et migrer les données RIB entre les paramètres de facturation et l'entreprise
 */
const RIBDebugger = () => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ribData, setRibData] = useState(null);

  // Vérifier les données RIB
  const handleCheckRIB = async () => {
    if (!currentEntreprise?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkRIBData(currentEntreprise.id);
      setRibData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Migrer les données RIB
  const handleMigrateRIB = async () => {
    if (!currentEntreprise?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const migrationResult = await migrateRIBDataForOrganization(currentEntreprise.id);
      setResult(migrationResult);
      
      // Recharger les données après migration
      if (migrationResult.success) {
        await handleCheckRIB();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.container}>
      <Card.Header>
        <h5 className="mb-0">🏦 Débogage des données RIB</h5>
      </Card.Header>
      <Card.Body>
        <div className={styles.info}>
          <p>Organisation actuelle : <strong>{currentEntreprise?.name || 'Non sélectionnée'}</strong></p>
          <p>ID : <code>{currentEntreprise?.id || 'N/A'}</code></p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {result && (
          <Alert variant={result.success ? 'success' : 'warning'} className="mb-3">
            <i className={`bi bi-${result.success ? 'check-circle' : 'info-circle'} me-2`}></i>
            {result.message}
            {result.data && (
              <div className="mt-2">
                <strong>Données migrées :</strong>
                <ul className="mb-0">
                  <li>IBAN : {result.data.iban || 'Non défini'}</li>
                  <li>BIC : {result.data.bic || 'Non défini'}</li>
                  <li>Banque : {result.data.banque || 'Non défini'}</li>
                </ul>
              </div>
            )}
          </Alert>
        )}

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleCheckRIB}
            disabled={loading || !currentEntreprise?.id}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Vérification...
              </>
            ) : (
              <>
                <i className="bi bi-search me-2"></i>
                Vérifier les données RIB
              </>
            )}
          </Button>

          <Button
            variant="success"
            onClick={handleMigrateRIB}
            disabled={loading || !currentEntreprise?.id}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Migration...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right-circle me-2"></i>
                Migrer les données RIB
              </>
            )}
          </Button>
        </div>

        {ribData && (
          <div className={styles.dataDisplay}>
            <h6>📊 État actuel des données RIB</h6>
            
            <div className={styles.dataSection}>
              <h6>Paramètres de facturation :</h6>
              <table className={styles.dataTable}>
                <tbody>
                  <tr>
                    <td>IBAN</td>
                    <td>{ribData.factureParameters.iban || <span className="text-muted">Non défini</span>}</td>
                  </tr>
                  <tr>
                    <td>BIC</td>
                    <td>{ribData.factureParameters.bic || <span className="text-muted">Non défini</span>}</td>
                  </tr>
                  <tr>
                    <td>Banque</td>
                    <td>{ribData.factureParameters.banque || <span className="text-muted">Non défini</span>}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.dataSection}>
              <h6>Données entreprise :</h6>
              <table className={styles.dataTable}>
                <tbody>
                  <tr>
                    <td>IBAN</td>
                    <td>{ribData.entrepriseData.iban || <span className="text-muted">Non défini</span>}</td>
                  </tr>
                  <tr>
                    <td>BIC</td>
                    <td>{ribData.entrepriseData.bic || <span className="text-muted">Non défini</span>}</td>
                  </tr>
                  <tr>
                    <td>Banque</td>
                    <td>{ribData.entrepriseData.banque || <span className="text-muted">Non défini</span>}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RIBDebugger;