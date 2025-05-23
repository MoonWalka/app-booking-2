// src/components/concerts/mobile/ConcertView.js
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import {
  useConcertDetails,
  useConcertFormOptimized,
  useConcertStatus
} from '@/hooks/concerts';

// Import des composants mobile spécifiques depuis le répertoire sections
import ConcertHeaderMobile from './sections/ConcertHeaderMobile';
import ConcertGeneralInfoMobile from './sections/ConcertGeneralInfoMobile';
import ConcertLocationSectionMobile from './sections/ConcertLocationSectionMobile';
import ConcertOrganizerSectionMobile from './sections/ConcertOrganizerSectionMobile';
import ConcertArtistSectionMobile from './sections/ConcertArtistSectionMobile';
import DeleteConcertModalMobile from './sections/DeleteConcertModalMobile';
// Pour ConcertStructureSection, utilisez la version desktop si la version mobile n'existe pas encore
import ConcertStructureSection from '../desktop/ConcertStructureSection';

/**
 * Composant de vue des détails d'un concert - Version Mobile
 * N'est responsable que de l'affichage et utilise les hooks pour toute la logique
 * Partage la même structure que la version desktop mais avec des composants adaptés pour mobile
 */
const ConcertView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Utilisation des hooks personnalisés
  const{
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    isSubmitting,
    formData,
    toggleEditMode,
    handleDeleteClick,
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    getStatusInfo,
    isEditMode
  } = useConcertDetails(id, location);

  const{
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    handleFormGenerated
  } = useConcertFormOptimized(id, programmateur?.id);
  
  // Utiliser directement le hook de statut pour éviter la duplication de code
  const { getStatusInfo: getStatusFromHook } = useConcertStatus();

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
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
  const statusInfo = getStatusInfo ? getStatusInfo() : getStatusFromHook(concert.statut, concert, formData);

  return (
    <div className={styles.concertViewContainer || 'concert-view-container-mobile'}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeaderMobile 
        concert={concert}
        onEdit={toggleEditMode}
        onDelete={() => setShowDeleteConfirm(true)}
        isEditMode={false}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
      />

      {/* Mode vue - version mobile */}
      <div className={styles.mobileContent || 'mobile-content'}>
        {/* Informations générales */}
        <ConcertGeneralInfoMobile 
          concert={concert}
          isEditMode={false}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={formDataStatus}
        />

        {/* Lieu */}
        <ConcertLocationSectionMobile 
          concertId={id}
          lieu={lieu}
          isEditMode={false}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
        />

        {/* Programmateur */}
        <ConcertOrganizerSectionMobile 
          concertId={id}
          programmateur={programmateur}
          isEditMode={false}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          formData={formData}
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
          isEditMode={false}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <ConcertArtistSectionMobile 
            concertId={id}
            artiste={artiste}
            isEditMode={false}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        )}
      </div>

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
        <DeleteConcertModalMobile
          show={showDeleteConfirm}
          concertNom={concert.titre || formatDate(concert.date)}
          onClose={() => {
            console.log('[LOG][ConcertViewMobile] Fermeture de la modal suppression');
            setShowDeleteConfirm(false);
          }}
          onConfirm={() => {
            console.log('[LOG][ConcertViewMobile] Confirmation suppression');
            handleDeleteClick();
          }}
          isDeleting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ConcertView;