// src/components/devis/DevisEditor.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import DevisForm from './DevisForm';
import DevisPreview from './DevisPreview';
import styles from './DevisEditor.module.css';

/**
 * Éditeur de devis avec layout split
 * Gauche: Formulaire d'édition
 * Droite: Preview PDF temps réel
 */
function DevisEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrg } = useOrganization();
  const { currentUser } = useAuth();
  
  const [devis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Récupérer les paramètres optionnels depuis l'URL
  const concertId = searchParams.get('concertId');
  const structureId = searchParams.get('structureId');

  // État du devis
  const [devisData, setDevisData] = useState({
    // Informations générales
    numero: '',
    statut: 'brouillon',
    emetteur: currentUser?.displayName || currentUser?.email || '',
    
    // Destinataire
    structureId: structureId || '',
    structureNom: '',
    contactId: '',
    contactNom: '',
    
    // Événement
    concertId: concertId || '',
    artisteNom: '',
    dateEvenement: '',
    titreEvenement: '',
    
    // Conditions financières
    lignesObjet: [
      {
        id: 1,
        objet: '',
        quantite: 1,
        unite: 'forfait',
        prixUnitaire: 0,
        montantHT: 0,
        tauxTVA: 20
      }
    ],
    
    // Règlement
    lignesReglement: [],
    
    // Conditions
    conditionsParticulieres: '',
    modalitesPaiement: '',
    
    // Totaux
    totalHT: 0,
    totalTVA: 0,
    totalTTC: 0,
    
    // Métadonnées
    organizationId: currentOrg?.id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Charger le devis existant si ID fourni
  useEffect(() => {
    const loadDevis = async () => {
      if (!id || id === 'nouveau') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // TODO: Charger le devis depuis Firebase
        console.log('Chargement devis:', id);
        
        // Simulation pour l'instant
        setDevisData(prev => ({
          ...prev,
          id: id,
          numero: `DEV-${id.substring(0, 6)}`
        }));
        
      } catch (err) {
        console.error('Erreur lors du chargement du devis:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDevis();
  }, [id]);

  // Charger les données du concert si concertId fourni
  useEffect(() => {
    const loadConcertData = async () => {
      if (!concertId) return;
      
      try {
        // TODO: Charger les données du concert depuis Firebase
        console.log('Chargement concert:', concertId);
        
        // Simulation pour l'instant
        setDevisData(prev => ({
          ...prev,
          concertId: concertId,
          artisteNom: 'Artiste depuis concert',
          dateEvenement: '2024-06-01',
          titreEvenement: 'Concert test'
        }));
        
      } catch (err) {
        console.error('Erreur lors du chargement du concert:', err);
      }
    };

    loadConcertData();
  }, [concertId]);

  // Sauvegarder le devis
  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Sauvegarder dans Firebase
      console.log('Sauvegarde devis:', devisData);
      
      // Simulation pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Changer le statut
  const handleStatusChange = async (newStatus) => {
    try {
      setDevisData(prev => ({
        ...prev,
        statut: newStatus,
        updatedAt: new Date()
      }));
      
      await handleSave();
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  // Calculer les totaux
  const calculateTotals = (lignes) => {
    const totalHT = lignes.reduce((sum, ligne) => sum + (ligne.montantHT || 0), 0);
    const totalTVA = lignes.reduce((sum, ligne) => {
      const montantTVA = (ligne.montantHT || 0) * (ligne.tauxTVA || 0) / 100;
      return sum + montantTVA;
    }, 0);
    const totalTTC = totalHT + totalTVA;

    setDevisData(prev => ({
      ...prev,
      totalHT,
      totalTVA,
      totalTTC
    }));
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <h4>Erreur</h4>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className={styles.devisEditor}>
      {/* Barre d'état */}
      <div className={styles.statusBar}>
        <Container fluid>
          <Row className="align-items-center">
            <Col md={6}>
              <h3 className="mb-0">
                {id === 'nouveau' ? 'Nouveau devis' : `Devis ${devisData.numero}`}
              </h3>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex justify-content-end align-items-center gap-3">
                {/* Dropdown statut */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={devisData.statut}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="envoye">Envoyé</option>
                  <option value="accepte">Accepté</option>
                  <option value="termine">Terminé</option>
                  <option value="refuse">Refusé</option>
                  <option value="annule">Annulé</option>
                </select>
                
                {/* Boutons d'action */}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/devis')}
                >
                  Fermer
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Layout principal */}
      <Container fluid className={styles.mainLayout}>
        <Row className="h-100">
          {/* Éditeur (gauche) */}
          <Col lg={6} className={styles.editorPanel}>
            <Card className="h-100">
              <Card.Body>
                <DevisForm
                  devisData={devisData}
                  setDevisData={setDevisData}
                  onCalculateTotals={calculateTotals}
                  readonly={devisData.statut !== 'brouillon'}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Preview PDF (droite) */}
          <Col lg={6} className={styles.previewPanel}>
            <Card className="h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Aperçu PDF</h5>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-printer"></i> Imprimer
                    </button>
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-download"></i> Télécharger
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <DevisPreview devisData={devisData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DevisEditor;