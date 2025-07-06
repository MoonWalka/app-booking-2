// src/components/lieux/mobile/LieuView.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import FlexContainer from '@/components/ui/FlexContainer';
import { toast } from 'react-toastify';
// MIGRATION: Utilisation du hook optimisé
import { useLieuDetails } from '@/hooks/lieux';

// Import styles
import styles from './LieuView.module.css';

/**
 * LieuView component - displays a venue's details in read-only mode (mobile version)
 * Version mobile simplifiée qui peut être étendue avec des composants spécifiques mobiles
 */
const LieuView = () => {
  const { id: lieuId } = useParams();
  const navigate = useNavigate();

  // MIGRATION: Utilisation du hook optimisé
  const{
    lieu,
    loading,
    error,
    handleEdit,
    handleDeleteClick,
    relatedData,
    loadingRelated
  } = useLieuDetails(lieuId);

  // Récupérer le contact depuis les entités liées
  const contact = relatedData?.programmateur; // Rétrocompatibilité - données mappées depuis programmateur
  const loadingContact = loadingRelated?.programmateur; // Rétrocompatibilité

  // Handlers mobiles avec notifications - NOUVEAU: Finalisation intelligente
  const handleEditWithNotification = () => {
    toast.info('📱 Passage en mode édition', {
      position: 'bottom-center', // Position adaptée mobile
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      style: {
        fontSize: '14px',
        borderRadius: '8px',
      }
    });
    handleEdit();
  };

  const handleDeleteWithNotification = () => {
    toast.warning('⚠️ Confirmation requise pour supprimer', {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      style: {
        fontSize: '14px',
        borderRadius: '8px',
      }
    });
    handleDeleteClick();
  };

  const handleBackWithNotification = () => {
    toast.dismiss(); // Fermer toutes les notifications avant navigation
    navigate('/lieux');
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <FlexContainer justify="center" align="center" className={styles?.spinnerContainer || "p-5"}>
        <Spinner variant="primary" message="Chargement du lieu..." />
      </FlexContainer>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <div className={styles?.errorContainer || "p-3"}>
        <Alert variant="danger">
          {error}
        </Alert>
        <Button 
          variant="primary" 
          onClick={handleBackWithNotification}
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  // If no lieu or lieu not found after loading is complete, show a message
  if (!lieu && !loading) {
    return (
      <div className={styles?.errorContainer || "p-3"}>
        <Alert variant="warning">
          Ce lieu n'existe pas ou n'a pas pu être chargé.
        </Alert>
        <Button 
          variant="primary" 
          onClick={handleBackWithNotification}
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }
  
  // La condition supplémentaire de sécurité pour éviter une erreur si lieu est null
  if (!lieu) {
    return null;
  }

  return (
    <div className={styles?.lieuContainer || "mobile-lieu-container p-3"}>
      {/* Header avec boutons d'action */}
      <FlexContainer justify="space-between" align="center" className={styles?.header || "mobile-header mb-4"}>
        <FlexContainer align="center">
          <Button 
            variant="text" 
            onClick={handleBackWithNotification}
            className="p-0 me-2"
            icon={<i className="bi bi-arrow-left fs-4"></i>}
          />
          <h1 className="mb-0 h4">{lieu.nom}</h1>
        </FlexContainer>
        
        <FlexContainer>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={handleEditWithNotification}
            icon={<i className="bi bi-pencil"></i>}
          />
          <Button 
            variant="outline-danger" 
            onClick={handleDeleteWithNotification}
            icon={<i className="bi bi-trash"></i>}
          />
        </FlexContainer>
      </FlexContainer>

      {/* Informations de base */}
      <div className={styles?.section || "mobile-section mb-4 p-3 border rounded"}>
        <h2 className="h6 mb-3">Informations générales</h2>
        
        <div className="mb-3">
          <strong>Type :</strong> {lieu.type || "Non spécifié"}
        </div>
        
        <div className="mb-3">
          <strong>Capacité :</strong> {lieu.capacite || "Non spécifiée"}
        </div>
        
        {lieu.description && (
          <div className="mb-3">
            <strong>Description :</strong>
            <p className="mt-2">{lieu.description}</p>
          </div>
        )}
      </div>

      {/* Adresse */}
      <div className={styles?.section || "mobile-section mb-4 p-3 border rounded"}>
        <h2 className="h6 mb-3">Adresse</h2>
        
        <div className="mb-2">{lieu.adresse || "Adresse non spécifiée"}</div>
        <div className="mb-2">
          {lieu.codePostal && lieu.ville ? `${lieu.codePostal} ${lieu.ville}` : ""}
        </div>
        {lieu.pays && <div>{lieu.pays}</div>}
      </div>

      {/* Contact */}
      <div className={styles?.section || "mobile-section mb-4 p-3 border rounded"}>
        <h2 className="h6 mb-3">Contact</h2>
        
        {loadingContact ? (
          <div className="text-center">
            <Spinner variant="primary" size="sm" />
          </div>
        ) : contact ? (
          <div>
            <div className="mb-2">{contact.nom}</div>
            {contact.email && (
              <div className="mb-2">
                <a href={`mailto:${contact.email}`}>
                  <i className="bi bi-envelope me-2"></i>
                  {contact.email}
                </a>
              </div>
            )}
            {contact.telephone && (
              <div>
                <a href={`tel:${contact.telephone}`}>
                  <i className="bi bi-telephone me-2"></i>
                  {contact.telephone}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted">Aucun contact associé</div>
        )}
      </div>

      {/* Dates associés - affichage simplifié */}
      <div className={styles?.section || "mobile-section mb-4 p-3 border rounded"}>
        <FlexContainer justify="space-between" align="center" className="mb-3">
          <h2 className="h6 mb-0">Dates</h2>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => navigate('/dates/nouveau', { state: { lieuId: lieu.id } })}
            icon={<i className="bi bi-plus"></i>}
          >
            Ajouter
          </Button>
        </FlexContainer>
        
        {lieu.concerts && lieu.concerts.length > 0 ? (
          <div className="list-group">
            {lieu.concerts.map(concert => (
              <div 
                key={date.id} 
                className="list-group-item list-group-item-action"
                onClick={() => navigate(`/dates/${date.id}`)}
              >
                <FlexContainer justify="space-between" align="center">
                  <div>
                    <div>{concert.titre || "Date sans titre"}</div>
                    <small className="text-muted">
                      {new Date(concert.date).toLocaleDateString('fr-FR')}
                    </small>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </FlexContainer>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted">Aucun date associé</div>
        )}
      </div>
    </div>
  );
};

export default LieuView;