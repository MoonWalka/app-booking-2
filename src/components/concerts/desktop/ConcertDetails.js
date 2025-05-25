import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
// Import des styles
import styles from './ConcertDetails.module.css';

// Import des hooks personnalisés - Utilisation de la version Optimized
import { useConcertDetails } from '@/hooks/concerts';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';
import Button from '@/components/ui/Button';
import NotesSection from '../sections/NotesSection';

const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Utilisation du hook optimisé pour bénéficier des meilleures pratiques
  // Nous n'utilisons que les propriétés dont nous avons besoin
  const {
    // Données principales du hook
    concert,
    loading,
    isSubmitting,
    error,
    
    // Entités liées
    lieu,
    programmateur,
    artiste, 
    structure,
    
    // Données des formulaires spécifiques aux concerts
    formData,
    
    // Fonctions de gestion
    handleDelete,
    
    // Fonctions spécifiques aux concerts
    handleFormGenerated,
    getStatusInfo,
    
    // Fonctions utilitaires
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    
    // Objets de recherche pour les entités liées
    lieuSearch,
    programmateurSearch,
    artisteSearch,
    structureSearch
    
  } = useConcertDetails(id, location);

  // Redirection vers création si l'ID n'existe pas, après chargement
  useEffect(() => {
    console.log('[🔍 ConcertDetails] redirect-check', { id, loading, concert, error });
    // Redirection vers création uniquement si échec de fetch (404) ou entité absente, et pas un nouveau concert
    if (
      id !== 'nouveau' &&
      !loading &&
      (error?.status === 404 || !concert)
    ) {
      console.log('[🔍 ConcertDetails] REDIRECTION: données manquantes, navigation vers nouveau');
      navigate('/concerts/nouveau', { replace: true });
    }
  }, [id, loading, concert, error, navigate]);

  console.log("[🔍 ConcertDetails] APRÈS HOOK - loading=" + loading, {
    hasConcert: !!concert,
    hasError: !!error,
    currentPath: location.pathname,
    concertId: concert?.id
  });

  // Fonction pour initialiser les valeurs de recherche
  useEffect(() => {
    console.log("[🔍 ConcertDetails] useEffect [lieu, programmateur, artiste, structure]. Lieu:", lieu, "Prog:", programmateur, "Artiste:", artiste, "Structure:", structure);
    
    if (lieu && !lieuSearch.selectedEntity) {
      lieuSearch.setSelectedEntity(lieu);
      lieuSearch.setSearchTerm && lieuSearch.setSearchTerm(lieu.nom);
    }
    
    if (programmateur && !programmateurSearch.selectedEntity) {
      programmateurSearch.setSelectedEntity(programmateur);
      programmateurSearch.setSearchTerm && programmateurSearch.setSearchTerm(programmateur.nom);
    }
    
    if (artiste && !artisteSearch.selectedEntity) {
      artisteSearch.setSelectedEntity(artiste);
      artisteSearch.setSearchTerm && artisteSearch.setSearchTerm(artiste.nom);
    }

    if (structure && !structureSearch.selectedEntity) {
      structureSearch.setSelectedEntity(structure);
      structureSearch.setSearchTerm && structureSearch.setSearchTerm(structure.nom || structure.raisonSociale || '');
    }
  }, [lieu, programmateur, artiste, structure, lieuSearch, programmateurSearch, artisteSearch, structureSearch]);

  // Vérification complète des conditions de chargement
  if (loading || !concert) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du concert...</span>
          </div>
          <p className="mt-2">{loading ? 'Chargement du concert...' : 'Préparation des données...'}</p>
          {!loading && !concert && (
            <Alert variant="warning" className="mt-3">
              Données non disponibles. <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => navigate('/concerts')}>Retour à la liste</Button>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // Obtenir les informations de statut du concert seulement si concert existe
  const statusInfo = concert ? getStatusInfo() : { message: '', actionNeeded: false };

  // Handle concert deletion
  const confirmDelete = () => {
    if (concert) {
      console.log("[ConcertDetails] Suppression du concert avec ID:", concert.id);
      // Passer seulement l'ID du concert au lieu de l'objet entier
      handleDelete(concert.id);
    } else {
      console.error("[ConcertDetails] Tentative de suppression d'un concert inexistant");
      navigate('/concerts');
    }
  };

  console.log("[🔍 ConcertDetails] JUSTE AVANT LE RENDER FINAL - concert:", !!concert, "id:", concert?.id);
  
  return (
    <div className={styles.concertDetailsContainer}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={() => {
          console.log("[🔍 ConcertDetails] Clic sur Modifier. Navigation vers /concerts/" + id + "/edit");
          navigate(`/concerts/${id}/edit`);
        }}
        onDelete={() => setShowDeleteConfirm(true)}
        isEditMode={false}
        isSubmitting={isSubmitting}
        canSave={false}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
      />

      {/* Contenu principal - avec vérification de sécurité */}
      {concert && (
        <>
          {/* Informations générales */}
          <ConcertGeneralInfo 
            concert={concert}
            isEditMode={false} /* Forcer le mode lecture seule */
            formatDate={formatDate}
            formatMontant={formatMontant}
            isDatePassed={isDatePassed}
            statusInfo={statusInfo}
            artiste={artiste}
          />

          {/* Lieu */}
          <ConcertLocationSection 
            concertId={id}
            lieu={lieu}
            isEditMode={false} /* Forcer le mode lecture seule */
            navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          />

          {/* Programmateur */}
          <ConcertOrganizerSection 
            concertId={id}
            programmateur={programmateur}
            isEditMode={false} /* Forcer le mode lecture seule */
            navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
            formData={formData}
            handleFormGenerated={handleFormGenerated}
            copyToClipboard={copyToClipboard}
            formatDate={formatDate}
            concert={concert}
          />

          {/* Structure */}
          <ConcertStructureSection 
            concertId={id}
            structure={structure}
            isEditMode={false} /* Forcer le mode lecture seule */
            navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
          />

          {/* Artiste */}
          {artiste && (
            <ConcertArtistSection 
              concertId={id}
              artiste={artiste}
              isEditMode={false} /* Forcer le mode lecture seule */
              navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
            />
          )}

          {/* Notes */}
          <NotesSection notes={concert?.notes || ''} onChange={() => {}} />
        </>
      )}

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        concertNom={concert?.titre || (concert ? formatDate(concert.date) : 'Concert')}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default ConcertDetails;
