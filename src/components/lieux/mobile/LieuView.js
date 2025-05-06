// src/components/lieux/mobile/LieuView.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { useLieuDetailsV2 } from '@/hooks/lieux';

// Import styles
import styles from './LieuView.module.css';

/**
 * LieuView component - displays a venue's details in read-only mode (mobile version)
 * Version mobile simplifiée qui peut être étendue avec des composants spécifiques mobiles
 */
const LieuView = () => {
  const { id: lieuId } = useParams();
  const navigate = useNavigate();

  // Use custom hooks
  const{
    lieu,
    loading,
    error,
    handleEdit,
    handleDeleteClick,
    programmateur,
    loadingProgrammateur
  } = useLieuDetailsV2(lieuId);

  // If loading, show a spinner
  if (loading) {
    return (
      <div className={styles?.spinnerContainer || "d-flex justify-content-center align-items-center p-5"}>
        <Spinner variant="primary" message="Chargement du lieu..." />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <div className={styles?.errorContainer || "p-3"}>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
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
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Ce lieu n'existe pas ou n'a pas pu être chargé.
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
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
      <div className={styles?.header || "mobile-header d-flex justify-content-between align-items-center mb-4"}>
        <div className="d-flex align-items-center">
          <Button 
            variant="text" 
            onClick={() => navigate('/lieux')}
            className="p-0 me-2"
            icon={<i className="bi bi-arrow-left fs-4"></i>}
          />
          <h1 className="mb-0 h4">{lieu.nom}</h1>
        </div>
        
        <div className="d-flex">
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={handleEdit}
            icon={<i className="bi bi-pencil"></i>}
          />
          <Button 
            variant="outline-danger" 
            onClick={handleDeleteClick}
            icon={<i className="bi bi-trash"></i>}
          />
        </div>
      </div>

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
        
        {lieu.contactNom && (
          <div className="mb-3">
            <strong>Nom :</strong> {lieu.contactNom}
          </div>
        )}
        
        {lieu.contactEmail && (
          <div className="mb-3">
            <strong>Email :</strong> 
            <a href={`mailto:${lieu.contactEmail}`}>{lieu.contactEmail}</a>
          </div>
        )}
        
        {lieu.contactTelephone && (
          <div className="mb-3">
            <strong>Téléphone :</strong> 
            <a href={`tel:${lieu.contactTelephone}`}>{lieu.contactTelephone}</a>
          </div>
        )}
      </div>

      {/* Programmateur */}
      <div className={styles?.section || "mobile-section mb-4 p-3 border rounded"}>
        <h2 className="h6 mb-3">Programmateur</h2>
        
        {loadingProgrammateur ? (
          <div className="text-center">
            <Spinner variant="primary" size="sm" />
          </div>
        ) : programmateur ? (
          <div>
            <div className="mb-2">{programmateur.nom}</div>
            {programmateur.email && (
              <div className="mb-2">
                <a href={`mailto:${programmateur.email}`}>
                  <i className="bi bi-envelope me-2"></i>
                  {programmateur.email}
                </a>
              </div>
            )}
            {programmateur.telephone && (
              <div>
                <a href={`tel:${programmateur.telephone}`}>
                  <i className="bi bi-telephone me-2"></i>
                  {programmateur.telephone}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted">Aucun programmateur associé</div>
        )}
      </div>

      {/* Concerts associés - affichage simplifié */}
      <div className={styles?.section || "mobile-section mb-4 p-3 border rounded"}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 mb-0">Concerts</h2>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => navigate('/concerts/nouveau', { state: { lieuId: lieu.id } })}
            icon={<i className="bi bi-plus"></i>}
          >
            Ajouter
          </Button>
        </div>
        
        {lieu.concerts && lieu.concerts.length > 0 ? (
          <div className="list-group">
            {lieu.concerts.map(concert => (
              <div 
                key={concert.id} 
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                onClick={() => navigate(`/concerts/${concert.id}`)}
              >
                <div>
                  <div>{concert.titre || "Concert sans titre"}</div>
                  <small className="text-muted">
                    {new Date(concert.date).toLocaleDateString('fr-FR')}
                  </small>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted">Aucun concert associé</div>
        )}
      </div>
    </div>
  );
};

export default LieuView;