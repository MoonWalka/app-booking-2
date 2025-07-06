// src/components/dates/mobile/DateView.js
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './DateView.module.css';

// Import des hooks
// import { useDateDetails } from '@/hooks/dates';
import useDateDelete from '@hooks/dates/useDateDelete';

// Import des composants
import FormGenerator from '../../forms/FormGenerator';
import DateHeaderMobile from './sections/DateHeaderMobile';
import DateGeneralInfoMobile from './sections/DateGeneralInfoMobile';
import DateLocationSectionMobile from './sections/DateLocationSectionMobile';
import DateOrganizerSectionMobile from './sections/DateOrganizerSectionMobile';
import DateArtistSectionMobile from './sections/DateArtistSectionMobile';
// SUPPRESSION : Plus besoin de DeleteDateModalMobile
// import DeleteDateModalMobile from './sections/DeleteDateModalMobile';
// Pour DateStructureSection, utilisez la version desktop si la version mobile n'existe pas encore
import DateStructureSection from '../desktop/DateStructureSection';
import NotesSection from '../sections/NotesSection';

/**
 * Composant de vue des détails d'un date - Version Mobile
 * N'est responsable que de l'affichage et utilise les hooks pour toute la logique
 * Partage la même structure que la version desktop mais avec des composants adaptés pour mobile
 * Suppression directe sans modal de confirmation
 */
const DateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hook de suppression directe
  const {
    isDeleting,
    handleDeleteDate
  } = useDateDelete(() => navigate('/dates'));
  
  // Utilisation des hooks personnalisés
  // const hookResult = useDateDetails(id, location);
  
  // Destructuration avec valeurs par défaut pour éviter les erreurs
  const {
    date,
    lieu,
    contact,
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
  } = {} || {}; // Remplacer les usages par null ou des placeholders si nécessaire.

  // Gestionnaire de suppression directe
  const handleDirectDelete = () => {
    if (id) {
      console.log('[DateViewMobile] Suppression directe du date:', id);
      handleDeleteDate(id);
    }
  };

  // Gestionnaire d'édition
  const handleEdit = () => {
    navigate(`/dates/${id}/edit`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement du date...</p>
        </div>
      </div>
    );
  }

  if (!date) {
    return <Alert variant="danger">Date non trouvé</Alert>;
  }

  // Utiliser getStatusInfo du hook (avec valeur par défaut)
  const statusInfo = getStatusInfo();

  return (
    <div className={styles.dateViewContainer}>
      {/* En-tête avec titre et boutons d'action */}
      <DateHeaderMobile 
        date={date}
        onEdit={handleEdit}
        onDelete={handleDirectDelete}
        isEditMode={false}
        formatDate={formatDate}
        navigateToList={() => navigate('/dates')}
        isDeleting={isDeleting}
      />

      {/* Mode vue - version mobile */}
      <div className={styles.mobileContent}>
        {/* Informations générales */}
        <DateGeneralInfoMobile 
          date={date}
          isEditMode={false}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={formDataStatus}
        />

        {/* Lieu */}
        <DateLocationSectionMobile 
          dateId={id}
          lieu={lieu}
          isEditMode={false}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
        />

        {/* Contact */}
        <DateOrganizerSectionMobile 
          dateId={id}
          contact={contact}
          isEditMode={false}
          navigateToContactDetails={(progId) => navigate(`/contacts/${progId}`)}
          formData={formData}
          formDataStatus={formDataStatus}
          showFormGenerator={showFormGenerator}
          setShowFormGenerator={setShowFormGenerator}
          generatedFormLink={generatedFormLink}
          setGeneratedFormLink={setGeneratedFormLink}
          handleFormGenerated={handleFormGenerated}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          date={date}
        />

        {/* Structure */}
        <DateStructureSection 
          dateId={id}
          structure={structure}
          isEditMode={false}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <DateArtistSectionMobile 
            dateId={id}
            artiste={artiste}
            isEditMode={false}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        )}

        {/* Notes */}
        <NotesSection 
          notes={date?.notes}
          isEditMode={false}
        />
      </div>

      {/* Composant pour l'envoi de formulaire */}
      {showFormGenerator && !generatedFormLink && (
        <div className="p-3 border rounded mb-3">
          <FormGenerator
            dateId={id}
            contactId={date.contactId}
            onFormGenerated={handleFormGenerated}
          />
        </div>
      )}

      {/* SUPPRESSION : Plus de modal de confirmation */}
      {/* Plus besoin de DeleteDateModalMobile */}
    </div>
  );
};

export default DateView;