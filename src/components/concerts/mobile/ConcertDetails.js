import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertDetails.module.css';
import Button from '@/components/ui/Button';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts/useConcertDetails';
import useConcertForm from '@/hooks/concerts/useConcertForm';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

// Import des composants sections mobiles
import ConcertHeaderMobile from './sections/ConcertHeaderMobile';
import ConcertGeneralInfoMobile from './sections/ConcertGeneralInfoMobile';
import ConcertLocationSectionMobile from './sections/ConcertLocationSectionMobile';
import ConcertOrganizerSectionMobile from './sections/ConcertOrganizerSectionMobile';
import ConcertArtistSectionMobile from './sections/ConcertArtistSectionMobile';
import DeleteConcertModal from './sections/DeleteConcertModalMobile';
import ActionBarMobile from './sections/ActionBarMobile';

/**
 * Composant ConcertDetails pour la version mobile
 * Affiche les détails d'un concert avec une interface optimisée pour mobile
 */
const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // État pour la navigation par onglets
  const [activeTab, setActiveTab] = useState('general');
  
  // Utilisation des hooks personnalisés
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    loading,
    isSubmitting,
    formData,
    isEditMode,
    formState,
    handleChange,
    handleSubmit,
    handleDelete,
    toggleEditMode,
    validateForm,
    handleFormGenerated,
    copyToClipboard
  } = useConcertDetails(id, location);

  const {
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink
  } = useConcertForm(id, programmateur?.id);

  // Hooks pour la recherche d'entités
  const lieuSearch = useEntitySearch('lieux');
  const programmateursSearch = useEntitySearch('programmateurs');
  const artistesSearch = useEntitySearch('artistes');

  // Fonction pour initialiser les valeurs de recherche
  useEffect(() => {
    if (lieu && !lieuSearch.selectedEntity) {
      lieuSearch.setSelectedEntity(lieu);
      lieuSearch.setSearchTerm(lieu.nom);
    }
    
    if (programmateur && !programmateursSearch.selectedEntity) {
      programmateursSearch.setSelectedEntity(programmateur);
      programmateursSearch.setSearchTerm(programmateur.nom);
    }
    
    if (artiste && !artistesSearch.selectedEntity) {
      artistesSearch.setSelectedEntity(artiste);
      artistesSearch.setSearchTerm(artiste.nom);
    }
  }, [lieu, programmateur, artiste]);

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
    handleSubmit(
      e, 
      lieuSearch.selectedEntity, 
      programmateursSearch.selectedEntity, 
      artistesSearch.selectedEntity
    );
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
        <p className={styles.loadingText}>Chargement du concert...</p>
      </div>
    );
  }

  // Si le concert n'est pas trouvé
  if (!concert) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="danger">Concert non trouvé</Alert>
        <Button 
          variant="primary"
          onClick={() => navigate('/concerts')}
          icon={<i className="bi bi-arrow-left"></i>}
          className={styles.backButton}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  
  // Déterminer si c'est un nouveau concert ou un concert existant
  const isNewConcert = location.pathname.includes('nouveau-concert');

  return (
    <div className={styles.concertDetailsMobile}>
      {/* En-tête du concert pour mobile */}
      <ConcertHeaderMobile 
        concert={concert}
        formatDate={formatDate}
        isEditMode={isEditMode}
        navigateToList={() => navigate('/concerts')}
      />

      {/* Navigation par onglets pour mobile */}
      <Nav variant="tabs" className={styles.mobileNavTabs}>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
            className={styles.navTab}
          >
            <i className="bi bi-info-circle me-1"></i> Général
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'lieu'}
            onClick={() => setActiveTab('lieu')}
            className={styles.navTab}
          >
            <i className="bi bi-geo-alt me-1"></i> Lieu
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'programmateur'}
            onClick={() => setActiveTab('programmateur')}
            className={styles.navTab}
          >
            <i className="bi bi-person me-1"></i> Organisateur
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'artiste'}
            onClick={() => setActiveTab('artiste')}
            className={styles.navTab}
          >
            <i className="bi bi-music-note-beamed me-1"></i> Artiste
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Contenu des onglets */}
      <div className={styles.tabContent}>
        {activeTab === 'general' && (
          <ConcertGeneralInfoMobile 
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
        )}

        {activeTab === 'lieu' && (
          <ConcertLocationSectionMobile 
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
        )}

        {activeTab === 'programmateur' && (
          <ConcertOrganizerSectionMobile 
            concertId={id}
            programmateur={programmateur}
            isEditMode={isEditMode}
            selectedProgrammateur={programmateursSearch.selectedEntity}
            progSearchTerm={programmateursSearch.searchTerm}
            setProgSearchTerm={programmateursSearch.setSearchTerm}
            showProgResults={programmateursSearch.showResults}
            progResults={programmateursSearch.results}
            isSearchingProgs={programmateursSearch.isSearching}
            handleSelectProgrammateur={programmateursSearch.handleSelect}
            handleRemoveProgrammateur={programmateursSearch.handleRemove}
            handleCreateProgrammateur={programmateursSearch.handleCreate}
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
        )}

        {activeTab === 'artiste' && (
          <ConcertArtistSectionMobile 
            concertId={id}
            artiste={artiste}
            isEditMode={isEditMode}
            selectedArtiste={artistesSearch.selectedEntity}
            artisteSearchTerm={artistesSearch.searchTerm}
            setArtisteSearchTerm={artistesSearch.setSearchTerm}
            showArtisteResults={artistesSearch.showResults}
            artisteResults={artistesSearch.results}
            isSearchingArtistes={artistesSearch.isSearching}
            handleSelectArtiste={artistesSearch.handleSelect}
            handleRemoveArtiste={artistesSearch.handleRemove}
            handleCreateArtiste={artistesSearch.handleCreate}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        )}

        {/* Composant pour l'envoi de formulaire */}
        {activeTab === 'programmateur' && showFormGenerator && !generatedFormLink && !isEditMode && (
          <div className={styles.formGeneratorContainer}>
            <FormGenerator
              concertId={id}
              programmateurId={concert.programmateurId}
              onFormGenerated={handleFormGenerated}
            />
          </div>
        )}
      </div>

      {/* Barre d'action fixe en bas pour mobile */}
      <ActionBarMobile 
        isEditMode={isEditMode}
        onEdit={toggleEditMode}
        onDelete={() => setShowDeleteConfirm(true)}
        onSave={handleFormSubmit}
        onCancel={toggleEditMode}
        isSubmitting={isSubmitting}
        canSave={validateForm()}
      />

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