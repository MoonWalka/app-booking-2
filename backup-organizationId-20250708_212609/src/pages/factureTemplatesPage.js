import React, { useState, useEffect, useCallback } from 'react';
import { getDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import Button from '@/components/ui/Button';
import FactureTemplateEditorModal from '@/components/factures/FactureTemplateEditorModal';
import styles from '@/components/parametres/ParametresGeneraux.module.css';
import factureStyles from '@/components/parametres/ParametresFactures.module.css';

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
    if (!user || !currentEntreprise?.id) return;
    
    try {
      setIsLoading(true);
      // Charger les paramètres depuis un document unique
      const parametersRef = doc(db, 'organizations', currentEntreprise.id, 'settings', 'factureParameters');
      const parametersDoc = await getDoc(parametersRef);
      
      if (parametersDoc.exists()) {
        setParameters(parametersDoc.data().parameters || {});
      } else {
        // Paramètres par défaut
        setParameters({
          numeroPrefix: 'FAC',
          numeroFormat: 'YYYY-MM-XXXX',
          numeroSeparator: '-',
          titreFacture: 'FACTURE',
          afficherTva: true,
          tauxTva: 20,
          mentionTva: 'TVA non applicable, article 293B du CGI',
          conditionsPaiement: 'Paiement à réception de facture',
          penalitesRetard: 'En cas de retard de paiement, des pénalités de retard sont exigibles (taux légal en vigueur).',
          escompte: 'Pas d\'escompte pour paiement anticipé',
          afficherNumeroTva: true,
          afficherMentionsLegales: true,
          afficherIban: true,
          afficherBic: true,
          iban: '',
          bic: '',
          nomBanque: '',
          showLogo: true,
          logoUrl: '',
          afficherPiedDePage: true,
          textePiedDePage: '',
          couleurPrimaire: '#3b82f6',
          couleurSecondaire: '#1f2937'
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres:', err);
      setError('Erreur lors du chargement des paramètres de facturation');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentEntreprise]);

  useEffect(() => {
    loadParameters();
  }, [user, currentEntreprise, loadParameters]);

  // Sauvegarder les paramètres
  const handleSaveParameters = async (configData) => {
    if (!currentEntreprise?.id) return;
    
    try {
      setError(null);
      const parametersRef = doc(db, 'organizations', currentEntreprise.id, 'settings', 'factureParameters');
      
      // Sauvegarder les paramètres
      await setDoc(parametersRef, {
        ...configData,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
        organizationId: currentEntreprise.id
      });
      
      setSuccess('Paramètres de facturation mis à jour avec succès');
      setShowModal(false);
      await loadParameters();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde des paramètres');
    }
  };

  // Ouvrir le modal pour éditer les paramètres
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Paramètres de facturation</h3>
        <Button
          variant="primary"
          onClick={handleOpenModal}
          className={styles.headerButton}
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

      <div className={styles.content}>
        <p className={styles.description}>
          Configurez les paramètres de vos factures. Ces paramètres seront appliqués au modèle standard lors de la génération de factures depuis la liste des concerts.
        </p>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : parameters && (
          <div className={factureStyles.parametersCard}>
            <div className={factureStyles.parameterSection}>
              <h5 className={factureStyles.parameterTitle}>
                <i className="bi bi-hash me-2"></i>
                Format de numérotation
              </h5>
              <p className={factureStyles.parameterValue}>
                {parameters.numeroPrefix}{parameters.numeroSeparator}
                {parameters.numeroFormat?.replace('YYYY', new Date().getFullYear()).replace('MM', String(new Date().getMonth() + 1).padStart(2, '0')).replace('XXXX', '0001')}
              </p>
            </div>

            <div className={factureStyles.parameterSection}>
              <h5 className={factureStyles.parameterTitle}>
                <i className="bi bi-card-text me-2"></i>
                Informations générales
              </h5>
              <ul className={factureStyles.parameterList}>
                <li>Titre : <strong>{parameters.titreFacture}</strong></li>
                <li>TVA : <strong>{parameters.afficherTva ? `${parameters.tauxTva}%` : 'Non affichée'}</strong></li>
                <li>Mention TVA : <strong>{parameters.mentionTva}</strong></li>
              </ul>
            </div>

            <div className={factureStyles.parameterSection}>
              <h5 className={factureStyles.parameterTitle}>
                <i className="bi bi-credit-card me-2"></i>
                Conditions de paiement
              </h5>
              <ul className={factureStyles.parameterList}>
                <li>Conditions : <strong>{parameters.conditionsPaiement}</strong></li>
                <li>Pénalités : <strong>{parameters.penalitesRetard}</strong></li>
                <li>Escompte : <strong>{parameters.escompte}</strong></li>
              </ul>
            </div>

            <div className={factureStyles.parameterSection}>
              <h5 className={factureStyles.parameterTitle}>
                <i className="bi bi-bank me-2"></i>
                Informations bancaires
              </h5>
              <ul className={factureStyles.parameterList}>
                <li>Banque : <strong>{parameters.nomBanque || 'Non renseignée'}</strong></li>
                <li>IBAN : <strong>{parameters.iban || 'Non renseigné'}</strong></li>
                <li>BIC : <strong>{parameters.bic || 'Non renseigné'}</strong></li>
              </ul>
            </div>

            <div className={factureStyles.parameterSection}>
              <h5 className={factureStyles.parameterTitle}>
                <i className="bi bi-toggle-on me-2"></i>
                Options d'affichage
              </h5>
              <div className={factureStyles.optionsList}>
                <span className={`${factureStyles.optionBadge} ${parameters.showLogo ? factureStyles.optionActive : ''}`}>
                  <i className={`bi bi-${parameters.showLogo ? 'check' : 'x'}`}></i> Logo
                </span>
                <span className={`${factureStyles.optionBadge} ${parameters.afficherNumeroTva ? factureStyles.optionActive : ''}`}>
                  <i className={`bi bi-${parameters.afficherNumeroTva ? 'check' : 'x'}`}></i> N° TVA
                </span>
                <span className={`${factureStyles.optionBadge} ${parameters.afficherIban ? factureStyles.optionActive : ''}`}>
                  <i className={`bi bi-${parameters.afficherIban ? 'check' : 'x'}`}></i> IBAN
                </span>
                <span className={`${factureStyles.optionBadge} ${parameters.afficherBic ? factureStyles.optionActive : ''}`}>
                  <i className={`bi bi-${parameters.afficherBic ? 'check' : 'x'}`}></i> BIC
                </span>
                <span className={`${factureStyles.optionBadge} ${parameters.afficherMentionsLegales ? factureStyles.optionActive : ''}`}>
                  <i className={`bi bi-${parameters.afficherMentionsLegales ? 'check' : 'x'}`}></i> Mentions légales
                </span>
                <span className={`${factureStyles.optionBadge} ${parameters.afficherSignature ? factureStyles.optionActive : ''}`}>
                  <i className={`bi bi-${parameters.afficherSignature ? 'check' : 'x'}`}></i> Signature
                </span>
              </div>
            </div>

            <div className={factureStyles.parameterSection}>
              <h5 className={factureStyles.parameterTitle}>
                <i className="bi bi-palette me-2"></i>
                Personnalisation visuelle
              </h5>
              <div className={factureStyles.colorPreview}>
                <div className={factureStyles.colorItem}>
                  <span className={factureStyles.colorLabel}>Couleur primaire :</span>
                  <span 
                    className={factureStyles.colorSwatch} 
                    style={{ backgroundColor: parameters.couleurPrimaire }}
                  ></span>
                  <span className={factureStyles.colorCode}>{parameters.couleurPrimaire}</span>
                </div>
                <div className={factureStyles.colorItem}>
                  <span className={factureStyles.colorLabel}>Couleur secondaire :</span>
                  <span 
                    className={factureStyles.colorSwatch} 
                    style={{ backgroundColor: parameters.couleurSecondaire }}
                  ></span>
                  <span className={factureStyles.colorCode}>{parameters.couleurSecondaire}</span>
                </div>
              </div>
            </div>

            {/* Section Pied de page */}
            {parameters.afficherPiedDePage && parameters.textePiedDePage && (
              <div className={factureStyles.parameterSection}>
                <h5 className={factureStyles.parameterTitle}>
                  <i className="bi bi-file-text me-2"></i>
                  Pied de page personnalisé
                </h5>
                <p className={factureStyles.parameterValue} style={{ fontStyle: 'italic' }}>
                  "{parameters.textePiedDePage}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal pour éditer les paramètres */}
      <FactureTemplateEditorModal
        isOpen={showModal}
        onClose={handleCloseModal}
        parameters={parameters}
        onSave={handleSaveParameters}
      />
    </div>
  );
};

export default FactureTemplatesPage;