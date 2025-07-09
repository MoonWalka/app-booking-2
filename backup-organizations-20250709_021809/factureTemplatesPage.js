import React, { useState, useEffect, useCallback } from 'react';
import { getDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import Button from '@/components/ui/Button';
import FactureTemplateEditorModal from '@/components/factures/FactureTemplateEditorModal';

const FactureTemplatesPage = () => {
  const { user } = useAuth();
  const { currentEntreprise } = useEntreprise();
  const [parameters, setParameters] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les paramètres de facturation
  const loadParameters = useCallback(async () => {
    if (!currentEntreprise) return;
    
    try {
      setIsLoading(true);
      const docRef = doc(db, 'organizations', currentEntreprise.id, 'parametres', 'settings');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setParameters(data.facturation || getDefaultParameters());
      } else {
        setParameters(getDefaultParameters());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setError('Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  }, [currentEntreprise]);

  useEffect(() => {
    loadParameters();
  }, [loadParameters]);

  // Valeurs par défaut
  const getDefaultParameters = () => ({
    // Numérotation
    numeroFormat: 'FACT-YYYY-MM-XXXX',
    numeroPrefix: 'FACT',
    numeroSeparator: '-',
    prochainNumero: 1,
    
    // Informations générales
    titreFacture: 'FACTURE',
    prefixObjet: 'Prestation du',
    
    // TVA
    afficherTva: true,
    tauxTva: 20,
    mentionTva: 'TVA non applicable, art. 293 B du CGI',
    
    // Paiement
    delaiPaiement: 30,
    modePaiement: 'virement',
    
    // Textes légaux
    mentionsLegales: '',
    clauseReserve: 'Clause de réserve de propriété...',
    clausePenalite: 'En cas de retard de paiement...',
    
    // Options d'affichage
    afficherLogo: true,
    afficherSignature: false,
    afficherConditions: true
  });

  // Sauvegarder les paramètres
  const handleSaveParameters = async (newParameters) => {
    if (!currentEntreprise) return;
    
    try {
      const docRef = doc(db, 'organizations', currentEntreprise.id, 'parametres', 'settings');
      
      // Charger le document existant
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};
      
      // Mettre à jour avec les nouveaux paramètres de facturation
      await setDoc(docRef, {
        ...existingData,
        facturation: newParameters,
        lastUpdated: serverTimestamp(),
        updatedBy: user.uid
      });
      
      setParameters(newParameters);
      setSuccess('Paramètres sauvegardés avec succès');
      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Impossible de sauvegarder les paramètres');
      return false;
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Paramètres de facturation</h3>
        <Button
          variant="primary"
          onClick={handleOpenModal}
        >
          <i className="bi bi-gear me-2"></i>
          Configurer
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Configurez les paramètres de vos factures. Ces paramètres seront appliqués au modèle standard lors de la génération de factures depuis la liste des concerts.
        </p>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : parameters && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '2rem',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-hash me-2"></i>
                Format de numérotation
              </h5>
              <p style={{ 
                fontSize: '1.1rem', 
                fontFamily: 'monospace',
                backgroundColor: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {parameters.numeroPrefix}{parameters.numeroSeparator}
                {parameters.numeroFormat?.replace('YYYY', new Date().getFullYear()).replace('MM', String(new Date().getMonth() + 1).padStart(2, '0')).replace('XXXX', '0001')}
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-card-text me-2"></i>
                Informations générales
              </h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>Titre : <strong>{parameters.titreFacture}</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>TVA : <strong>{parameters.afficherTva ? `${parameters.tauxTva}%` : 'Non affichée'}</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Mention TVA : <strong>{parameters.mentionTva}</strong></li>
              </ul>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-credit-card me-2"></i>
                Conditions de paiement
              </h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>Délai : <strong>{parameters.delaiPaiement} jours</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Mode : <strong>{parameters.modePaiement}</strong></li>
              </ul>
            </div>

            <div>
              <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-shield-check me-2"></i>
                Options d'affichage
              </h5>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className={`bi ${parameters.afficherLogo ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'} me-2`}></i>
                  Logo
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className={`bi ${parameters.afficherSignature ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'} me-2`}></i>
                  Signature
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className={`bi ${parameters.afficherConditions ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'} me-2`}></i>
                  Conditions
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && parameters && (
        <FactureTemplateEditorModal
          show={showModal}
          onHide={handleCloseModal}
          parameters={parameters}
          onSave={handleSaveParameters}
        />
      )}
    </div>
  );
};

export default FactureTemplatesPage;