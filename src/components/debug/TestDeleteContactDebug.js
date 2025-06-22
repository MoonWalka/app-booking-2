import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge } from 'react-bootstrap';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import structuresService from '@/services/contacts/structuresService';
import personnesService from '@/services/contacts/personnesService';

/**
 * Composant de débogage pour tester la suppression directe via les services
 */
function TestDeleteContactDebug() {
  const { currentOrganization } = useOrganization();
  const [testStructure, setTestStructure] = useState(null);
  const [testPersonne, setTestPersonne] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Charger des données de test
  const loadTestData = async () => {
    if (!currentOrganization?.id) {
      addLog('Aucune organisation sélectionnée', 'error');
      return;
    }

    setLoading(true);
    try {
      // Chercher une structure sans liaisons actives
      addLog('Recherche d\'une structure de test...');
      const structuresQuery = query(
        collection(db, 'structures'),
        where('organizationId', '==', currentOrganization.id),
        limit(10)
      );
      const structuresSnapshot = await getDocs(structuresQuery);
      
      // Pour chaque structure, vérifier les liaisons
      for (const doc of structuresSnapshot.docs) {
        const structureId = doc.id;
        const liaisonsQuery = query(
          collection(db, 'liaisons'),
          where('structureId', '==', structureId),
          where('actif', '==', true)
        );
        const liaisonsSnapshot = await getDocs(liaisonsQuery);
        
        if (liaisonsSnapshot.empty) {
          setTestStructure({
            id: doc.id,
            ...doc.data()
          });
          addLog(`Structure trouvée: ${doc.data().raisonSociale} (ID: ${doc.id})`, 'success');
          break;
        }
      }

      // Chercher une personne libre
      addLog('Recherche d\'une personne libre...');
      const personnesQuery = query(
        collection(db, 'personnes'),
        where('organizationId', '==', currentOrganization.id),
        where('isPersonneLibre', '==', true),
        limit(1)
      );
      const personnesSnapshot = await getDocs(personnesQuery);
      
      if (!personnesSnapshot.empty) {
        const doc = personnesSnapshot.docs[0];
        setTestPersonne({
          id: doc.id,
          ...doc.data()
        });
        addLog(`Personne libre trouvée: ${doc.data().prenom} ${doc.data().nom} (ID: ${doc.id})`, 'success');
      } else {
        addLog('Aucune personne libre trouvée', 'warning');
      }
    } catch (error) {
      addLog(`Erreur: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tester la suppression d'une structure
  const testDeleteStructure = async () => {
    if (!testStructure) {
      addLog('Aucune structure de test sélectionnée', 'error');
      return;
    }

    addLog(`Tentative de suppression de la structure ${testStructure.raisonSociale}...`);
    
    try {
      const result = await structuresService.deleteStructure(testStructure.id);
      
      if (result.success) {
        addLog('✅ Structure supprimée avec succès!', 'success');
        setTestStructure(null);
      } else {
        addLog(`❌ Échec: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
    }
  };

  // Tester la suppression d'une personne
  const testDeletePersonne = async () => {
    if (!testPersonne) {
      addLog('Aucune personne de test sélectionnée', 'error');
      return;
    }

    addLog(`Tentative de suppression de ${testPersonne.prenom} ${testPersonne.nom}...`);
    
    try {
      const result = await personnesService.deletePersonne(testPersonne.id);
      
      if (result.success) {
        addLog('✅ Personne supprimée avec succès!', 'success');
        setTestPersonne(null);
      } else {
        addLog(`❌ Échec: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    loadTestData();
  }, [currentOrganization?.id]);

  return (
    <div className="p-3">
      <h3>Test de suppression directe via les services</h3>
      
      <div className="row mb-3">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>Structure de test</h5>
            </Card.Header>
            <Card.Body>
              {testStructure ? (
                <>
                  <p><strong>Nom:</strong> {testStructure.raisonSociale}</p>
                  <p><strong>ID:</strong> <code>{testStructure.id}</code></p>
                  <p><strong>Type:</strong> {testStructure.type || 'Non défini'}</p>
                  <Button
                    variant="danger"
                    onClick={testDeleteStructure}
                    className="w-100"
                  >
                    Supprimer cette structure
                  </Button>
                </>
              ) : (
                <Alert variant="warning">
                  Aucune structure sans liaisons actives trouvée
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>Personne libre de test</h5>
            </Card.Header>
            <Card.Body>
              {testPersonne ? (
                <>
                  <p><strong>Nom:</strong> {testPersonne.prenom} {testPersonne.nom}</p>
                  <p><strong>ID:</strong> <code>{testPersonne.id}</code></p>
                  <p><strong>Email:</strong> {testPersonne.email || 'Non défini'}</p>
                  <Button
                    variant="danger"
                    onClick={testDeletePersonne}
                    className="w-100"
                  >
                    Supprimer cette personne
                  </Button>
                </>
              ) : (
                <Alert variant="warning">
                  Aucune personne libre trouvée
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Journal des opérations</h5>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadTestData}
            disabled={loading}
          >
            Recharger les données
          </Button>
        </Card.Header>
        <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <p className="text-muted">Aucune opération effectuée</p>
          ) : (
            <div className="small">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.type === 'error' ? 'text-danger' :
                    log.type === 'success' ? 'text-success' :
                    log.type === 'warning' ? 'text-warning' :
                    ''
                  }`}
                >
                  <Badge bg="secondary" className="me-2">{log.timestamp}</Badge>
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default TestDeleteContactDebug;