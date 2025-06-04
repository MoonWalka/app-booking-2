// src/components/concerts/mobile/ConcertView.js
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './ConcertView.module.css';

// Import des hooks
import { useConcertDetails } from '@hooks/concerts';
import useConcertDelete from '@hooks/concerts/useConcertDelete';

// Import des composants
import FormGenerator from '../../forms/FormGenerator';
import ConcertHeaderMobile from './sections/ConcertHeaderMobile';
import ConcertGeneralInfoMobile from './sections/ConcertGeneralInfoMobile';
import ConcertLocationSectionMobile from './sections/ConcertLocationSectionMobile';
import ConcertOrganizerSectionMobile from './sections/ConcertOrganizerSectionMobile';
import ConcertArtistSectionMobile from './sections/ConcertArtistSectionMobile';
// SUPPRESSION : Plus besoin de DeleteConcertModalMobile
// import DeleteConcertModalMobile from './sections/DeleteConcertModalMobile';
// Pour ConcertStructureSection, utilisez la version desktop si la version mobile n'existe pas encore
import ConcertStructureSection from '../desktop/ConcertStructureSection';
import NotesSection from '../sections/NotesSection';

/**
 * Composant de vue des détails d'un concert - Version Mobile
 * N'est responsable que de l'affichage et utilise les hooks pour toute la logique
 * Partage la même structure que la version desktop mais avec des composants adaptés pour mobile
 * Suppression directe sans modal de confirmation
 */
const ConcertView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hook de suppression directe
  const {
    isDeleting,
    handleDeleteConcert
  } = useConcertDelete(() => navigate('/concerts'));
  
  // Utilisation des hooks personnalisés
  const hookResult = useConcertDetails(id, location);
  
  // Destructuration avec valeurs par défaut pour éviter les erreurs
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    formData,
    copyToClipboard = () => {},
    formatDate = (date) => date,
    formatMontant = (montant) => montant,
    isDatePassed = () => false,
    getStatusInfo = () => ({}),
    formDataStatus,
    showFormGenerator = false,
    setShowFormGenerator = () => {},
    generatedFormLink = '',
    setGeneratedFormLink = () => {},
    handleFormGenerated = () => {}
  } = hookResult || {};

  // Gestionnaire de suppression directe
  const handleDirectDelete = () => {
    if (id) {
      console.log('[ConcertViewMobile] Suppression directe du concert:', id);
      handleDeleteConcert(id);
    }
  };

  // Gestionnaire d'édition
  const handleEdit = () => {
    navigate(`/concerts/${id}/edit`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
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

  // Utiliser getStatusInfo du hook (avec valeur par défaut)
  const statusInfo = getStatusInfo();

  return (
    <div className={styles.concertViewContainer}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeaderMobile 
        concert={concert}
        onEdit={handleEdit}
        onDelete={handleDirectDelete}
        isEditMode={false}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
        isDeleting={isDeleting}
      />

      {/* Mode vue - version mobile */}
      <div className={styles.mobileContent}>
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
          formDataStatus={formDataStatus}
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

        {/* Notes */}
        <NotesSection 
          notes={concert?.notes}
          isEditMode={false}
        />
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

      {/* SUPPRESSION : Plus de modal de confirmation */}
      {/* Plus besoin de DeleteConcertModalMobile */}
    </div>
  );
};

export default ConcertView;