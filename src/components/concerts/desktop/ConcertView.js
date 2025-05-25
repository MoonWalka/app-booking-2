// src/components/concerts/desktop/ConcertView.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts';
import { useConcertStatus } from '@/hooks/concerts';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';

/**
 * Composant de vue des détails d'un concert - Version Desktop
 * Gère ses propres données via les hooks
 */
const ConcertView = ({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  
  // Utiliser l'ID passé en prop s'il existe, sinon utiliser l'ID de l'URL
  const id = propId || urlId;
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Utiliser le hook pour récupérer les données du concert
  const detailsHook = useConcertDetails(id);
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    isSubmitting,
    formData,
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    toggleEditMode,
    handleDelete,
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    getStatusInfo,
    handleFormGenerated,
    isEditMode: detailsEditMode
  } = detailsHook || {};

  // Hook de statut avancé pour fonctionnalités sophistiquées
  const concertStatus = useConcertStatus();
  
  // Système de statut intelligent combinant les deux hooks
  const getAdvancedStatusInfo = () => {
    if (!getStatusInfo) return {};
    
    const basicStatus = getStatusInfo();
    const advancedStatus = concertStatus.getStatusDetails?.(concert?.statut);
    
    return {
      ...basicStatus,
      ...advancedStatus,
      // Combinaison intelligente des informations
      statusBadge: advancedStatus?.badge || basicStatus?.badge,
      actionButtons: advancedStatus?.actions || [],
      urgencyLevel: advancedStatus?.urgency || 'normal'
    };
  };

  // Fonction pour passer en mode édition
  const handleEdit = () => {
    console.log("[🔍 ConcertView] Clic sur Modifier. Basculement en mode édition");
    if (toggleEditMode) toggleEditMode();
  };

  // Fonction pour annuler l'édition
  const handleCancel = () => {
    if (toggleEditMode) toggleEditMode();
  };

  // Fonction pour gérer les changements dans les inputs
  const handleChange = (e) => {
    if (detailsHook && detailsHook.handleChange) {
      detailsHook.handleChange(e);
    }
  };

  // Fonction pour enregistrer les modifications
  const handleSave = async () => {
    if (detailsHook && detailsHook.handleSave) {
      await detailsHook.handleSave();
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du concert...</span>
          </div>
          <p className="mt-2">Chargement du concert...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return <Alert variant="danger">Concert non trouvé</Alert>;
  }

  // Utiliser soit getStatusInfo du hook useConcertDetails ou du hook useConcertStatus
  const statusInfo = getAdvancedStatusInfo();

  // Ajout log ouverture modale suppression
  const handleOpenDeleteModal = () => {
    console.log('[LOG][ConcertView] Ouverture de la modale suppression');
    setShowDeleteConfirm(true);
  };
  
  // Ajout log fermeture modale suppression
  const handleCloseDeleteModal = () => {
    console.log('[LOG][ConcertView] Fermeture de la modale suppression');
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.concertViewContainer || 'concert-view-container'}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={handleEdit}
        onDelete={handleOpenDeleteModal}
        isEditMode={detailsEditMode}
        formatDate={formatDate}
        navigateToList={() => {
          navigate('/concerts');
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        canSave={true}
      />

      {/* Mode vue */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={formDataStatus}
        />

        {/* Lieu */}
        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          showFormGenerator={showFormGenerator}
          setShowFormGenerator={setShowFormGenerator}
          generatedFormLink={generatedFormLink}
          setGeneratedFormLink={setGeneratedFormLink}
          handleFormGenerated={handleFormGenerated}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          concert={concert}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={detailsEditMode}
            formData={formData}
            onChange={handleChange}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        )}
      </>

      {/* Composant pour l'envoi de formulaire */}
      {showFormGenerator && (
        <FormGenerator
          concert={concert}
          programmateur={programmateur}
          onFormGenerated={handleFormGenerated}
          onClose={() => setShowFormGenerator(false)}
        />
      )}

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        onHide={handleCloseDeleteModal}
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirm(false);
        }}
        concertTitle={concert?.titre}
      />
    </div>
  );
};

export default ConcertView;