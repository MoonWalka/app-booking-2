import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatDateFr } from '@/utils/dateUtils';
import { Spinner as BootstrapSpinner, Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertDetails.module.css';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts/useConcertDetails';
import useConcertForm from '@/hooks/concerts/useConcertForm';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';

const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Utilisation des hooks personnalisés
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    isSubmitting,
    formData,
    isEditMode,
    formState,
    handleChange,
    handleSubmit,
    toggleEditMode,
    validateForm,
    handleFormGenerated,
    copyToClipboard,
    handleDelete,
    lieuSearch,
    programmateurSearch,
    artisteSearch,
    structureSearch
  } = useConcertDetails(id, location);

  const {
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink
  } = useConcertForm(id, programmateur?.id);

  // Fonction pour initialiser les valeurs de recherche
  React.useEffect(() => {
    if (lieu && !lieuSearch.selectedEntity) {
      lieuSearch.setSelectedEntity(lieu);
      lieuSearch.setSearchTerm(lieu.nom);
    }
    
    if (programmateur && !programmateurSearch.selectedEntity) {
      programmateurSearch.setSelectedEntity(programmateur);
      programmateurSearch.setSearchTerm(programmateur.nom);
    }
    
    if (artiste && !artisteSearch.selectedEntity) {
      artisteSearch.setSelectedEntity(artiste);
      artisteSearch.setSearchTerm(artiste.nom);
    }

    if (structure && !structureSearch.selectedEntity) {
      structureSearch.setSelectedEntity(structure);
      structureSearch.setSearchTerm(structure.nom || structure.raisonSociale || '');
    }
  }, [lieu, programmateur, artiste, structure]);

  // Formater la date pour l'affichage
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne de date
    try {
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateValue;
    }
  };

  // Formater le montant
  const formatMontant = (montant) => {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Vérifier si la date est passée
  const isDatePassed = (dateValue) => {
    if (!dateValue) return false;
    
    const today = new Date();
    const concertDate = dateValue.seconds ? 
      new Date(dateValue.seconds * 1000) : 
      new Date(dateValue);
    
    return concertDate < today;
  };

  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = () => {
    if (!concert) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(concert.date);
    
    switch (concert.statut) {
      case 'contact':
        if (!formData) return { message: 'Formulaire à envoyer', actionNeeded: true, action: 'form' };
        if (formData && (!formData.programmateurData && (!formData.data || Object.keys(formData.data).length === 0))) 
          return { message: 'Formulaire envoyé, en attente de réponse', actionNeeded: false };
        if (formData && (formData.programmateurData || (formData.data && Object.keys(formData.data).length > 0)) && formData.status !== 'validated') 
          return { message: 'Formulaire à valider', actionNeeded: true, action: 'validate_form' };
        if (formData && formData.status === 'validated')
          return { message: 'Contrat à préparer', actionNeeded: true, action: 'prepare_contract' };
        return { message: 'Contact établi', actionNeeded: false };
        
      case 'preaccord':
        if (formData && formData.status === 'validated')
          return { message: 'Contrat à envoyer', actionNeeded: true, action: 'send_contract' };
        return { message: 'Contrat à préparer', actionNeeded: true, action: 'contract' };
        
      case 'contrat':
        return { message: 'Facture acompte à envoyer', actionNeeded: true, action: 'invoice' };
        
      case 'acompte':
        return { message: 'En attente du concert', actionNeeded: false };
        
      case 'solde':
        if (isPastDate) return { message: 'Concert terminé', actionNeeded: false };
        return { message: 'Facture solde envoyée', actionNeeded: false };
        
      default:
        return { message: 'Statut non défini', actionNeeded: false };
    }
  };

  // Fonction pour soumettre le formulaire
  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    handleSubmit(e);
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

  const statusInfo = getStatusInfo();

  return (
    <div className={styles.concertDetailsContainer}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={toggleEditMode}
        onDelete={() => setShowDeleteConfirm(true)}
        isEditMode={isEditMode}
        onSave={handleFormSubmit}
        onCancel={toggleEditMode}
        isSubmitting={isSubmitting}
        canSave={validateForm()}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
      />

      {isEditMode ? (
        /* Mode édition */
        <form className="modern-form" onSubmit={handleFormSubmit}>
          {/* Informations générales */}
          <ConcertGeneralInfo 
            concert={concert}
            isEditMode={isEditMode}
            formData={formState}
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
            isEditMode={isEditMode}
            selectedLieu={lieuSearch.selectedEntity}
            lieuSearchTerm={lieuSearch.searchTerm}
            setLieuSearchTerm={lieuSearch.setSearchTerm}
            showLieuResults={lieuSearch.showResults}
            lieuResults={lieuSearch.results}
            isSearchingLieux={lieuSearch.isSearching}
            handleSelectLieu={lieuSearch.handleSelect}
            handleRemoveLieu={lieuSearch.handleRemove}
            handleCreateLieu={lieuSearch.handleCreate}
            navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          />

          {/* Programmateur */}
          <ConcertOrganizerSection 
            concertId={id}
            programmateur={programmateur}
            isEditMode={isEditMode}
            selectedProgrammateur={programmateurSearch.selectedEntity}
            progSearchTerm={programmateurSearch.searchTerm}
            setProgSearchTerm={programmateurSearch.setSearchTerm}
            showProgResults={programmateurSearch.showResults}
            progResults={programmateurSearch.results}
            isSearchingProgs={programmateurSearch.isSearching}
            handleSelectProgrammateur={programmateurSearch.handleSelect}
            handleRemoveProgrammateur={programmateurSearch.handleRemove}
            handleCreateProgrammateur={programmateurSearch.handleCreate}
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
            isEditMode={isEditMode}
            selectedStructure={structureSearch.selectedEntity}
            structureSearchTerm={structureSearch.searchTerm}
            setStructureSearchTerm={structureSearch.setSearchTerm}
            showStructureResults={structureSearch.showResults}
            structureResults={structureSearch.results}
            isSearchingStructures={structureSearch.isSearching}
            handleSelectStructure={structureSearch.handleSelect}
            handleRemoveStructure={structureSearch.handleRemove}
            handleCreateStructure={() => navigate('/structures/new')}
            navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
          />

          {/* Artiste */}
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={isEditMode}
            selectedArtiste={artisteSearch.selectedEntity}
            artisteSearchTerm={artisteSearch.searchTerm}
            setArtisteSearchTerm={artisteSearch.setSearchTerm}
            showArtisteResults={artisteSearch.showResults}
            artisteResults={artisteSearch.results}
            isSearchingArtistes={artisteSearch.isSearching}
            handleSelectArtiste={artisteSearch.handleSelect}
            handleRemoveArtiste={artisteSearch.handleRemove}
            handleCreateArtiste={artisteSearch.handleCreate}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        </form>
      ) : (
        /* Mode vue */
        <>
          {/* Informations générales */}
          <ConcertGeneralInfo 
            concert={concert}
            isEditMode={isEditMode}
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
            navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          />

          {/* Programmateur */}
          <ConcertOrganizerSection 
            concertId={id}
            programmateur={programmateur}
            isEditMode={isEditMode}
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
            isEditMode={isEditMode}
            navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
          />

          {/* Artiste */}
          {artiste && (
            <ConcertArtistSection 
              concertId={id}
              artiste={artiste}
              isEditMode={isEditMode}
              navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
            />
          )}
        </>
      )}

      {/* Composant pour l'envoi de formulaire */}
      {showFormGenerator && !generatedFormLink && !isEditMode && (
        <div className="p-3 border rounded mb-3">
          <FormGenerator
            concertId={id}
            programmateurId={concert.programmateurId}
            onFormGenerated={handleFormGenerated}
          />
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        concertNom={concert.titre || formatDate(concert.date)}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default ConcertDetails;
