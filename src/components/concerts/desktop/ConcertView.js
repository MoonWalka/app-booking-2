// src/components/concerts/desktop/ConcertView.js
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import { useConcertStatus } from '@/hooks/concerts'; // conserver uniquement pour status si nécessaire

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
 * N'est responsable que de l'affichage et utilise les hooks pour toute la logique
 */
const ConcertView = ({ id: propId, detailsHook }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Utiliser l'ID passé en prop s'il existe, sinon utiliser l'ID de l'URL
  const id = propId || urlId;
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Ajout de l'état local pour gérer le mode édition
  const [isEditMode, setIsEditMode] = useState(false);
  // Ajout d'un état local pour les données éditées
  const [editData, setEditData] = useState(null);
  
  // Utiliser uniquement le hook optimisé passé en prop
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
  } = detailsHook;

  // Optionnel : on peut utiliser detailsHook.getStatusInfo, sinon fallback

  // Fonction pour passer en mode édition
  const handleEdit = () => {
    setEditData({ ...concert });
    setIsEditMode(true);
  };

  // Fonction pour annuler l'édition
  const handleCancel = () => {
    setIsEditMode(false);
    setEditData(null);
  };

  // Fonction pour gérer les changements dans les inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour enregistrer les modifications (à adapter selon l'API/hook)
  const handleSave = async () => {
    if (detailsHook && detailsHook.handleSave) {
      await detailsHook.handleSave(editData);
      setIsEditMode(false);
      setEditData(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
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
  const statusInfo = getStatusInfo();

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
        concert={isEditMode ? editData : concert}
        onEdit={handleEdit}
        onDelete={handleOpenDeleteModal}
        isEditMode={isEditMode}
        formatDate={formatDate}
        navigateToList={() => {
          navigate('/concerts');
        }}
        onSave={isEditMode ? handleSave : undefined}
        onCancel={isEditMode ? handleCancel : undefined}
      />

      {/* Mode vue */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={isEditMode ? editData : concert}
          isEditMode={isEditMode}
          formData={isEditMode ? editData : undefined}
          onChange={isEditMode ? handleChange : undefined}
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
          isEditMode={isEditMode}
          formData={isEditMode ? editData : undefined}
          onChange={isEditMode ? handleChange : undefined}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={isEditMode}
          formData={isEditMode ? editData : undefined}
          onChange={isEditMode ? handleChange : undefined}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          showFormGenerator={showFormGenerator}
          setShowFormGenerator={setShowFormGenerator}
          generatedFormLink={generatedFormLink}
          setGeneratedFormLink={setGeneratedFormLink}
          handleFormGenerated={handleFormGenerated}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          concert={isEditMode ? editData : concert}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={isEditMode}
          formData={isEditMode ? editData : undefined}
          onChange={isEditMode ? handleChange : undefined}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={isEditMode}
            formData={isEditMode ? editData : undefined}
            onChange={isEditMode ? handleChange : undefined}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        )}
      </>

      {/* Composant pour l'envoi de formulaire */}
      {showFormGenerator && !generatedFormLink && (
        <div className="p-3 border rounded mb-3">
          <FormGenerator
            concertId={id}
            programmateurId={concert.programmateurId}
            onFormGenerated={handleFormGenerated}
          />
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {isEditMode && (
        <DeleteConcertModal
          show={showDeleteConfirm}
          concertNom={concert.titre || formatDate(concert.date)}
          onClose={handleCloseDeleteModal}
          onConfirm={() => {
            console.log('[LOG][ConcertView] onConfirm suppression appelé');
            detailsHook.handleDeleteClick();
          }}
          isDeleting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ConcertView;