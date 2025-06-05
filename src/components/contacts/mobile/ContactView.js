// src/components/contacts/mobile/ContactView.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Spinner } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Card from '@/components/ui/Card';
import { useContactDetails } from '@/hooks/contacts';

/**
 * Composant d'affichage des détails d'un contact - Version Mobile
 * Séparé du mode édition pour une meilleure séparation des préoccupations
 */
const ContactView = ({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;
  const{ 
    contact, 
    loading, 
    error,
    handleDelete,
    formatValue
  } = useContactDetails(id);


  // Version temporaire plus détaillée qui peut remplacer le composant UnderConstruction
  // Vous pouvez développer ce composant progressivement

  if (loading) {
    return (
      <FlexContainer justify="center" align="center" className="p-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Chargement...</span>
      </FlexContainer>
    );
  }

  if (error) {
    return (
      <Card 
        className="m-3"
        title="Erreur"
        icon={<i className="bi bi-exclamation-triangle"></i>}
        variant="danger"
      >
        <p>{error}</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/contacts')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </Card>
    );
  }

  if (!contact) {
    return (
      <Card 
        className="m-3"
        title="Contact non trouvé"
        icon={<i className="bi bi-question-circle"></i>}
        variant="warning"
      >
        <p>Le contact demandé n'existe pas ou a été supprimé.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/contacts')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </Card>
    );
  }

  // Fonction pour rediriger vers la page d'édition
  const handleEditClick = () => {
    navigate(`/contacts/edit/${id}`);
  };
  
  // Option 2: Afficher une version simplifiée des détails du contact
  return (
    <div className="contact-mobile-container p-3">
      {/* Header avec actions */}
      <FlexContainer justify="space-between" align="center" className="mb-3">
        <Button 
          variant="link" 
          className="p-0 text-decoration-none"
          onClick={() => navigate('/contacts')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </Button>
        
        <div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2"
            onClick={handleEditClick}
          >
            <i className="bi bi-pencil me-1"></i>
            Modifier
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={handleDelete}
          >
            <i className="bi bi-trash me-1"></i>
            Supprimer
          </Button>
        </div>
      </FlexContainer>
      
      {/* Titre */}
      <div className="h4 mb-3">{contact.nom}</div>
      {contact.fonction && (
        <Badge bg="light" text="dark" className="mb-3">
          {contact.fonction}
        </Badge>
      )}
      
      {/* Informations de contact */}
      <Card 
        className="mb-3"
        title="Contact"
        icon={<i className="bi bi-person-lines-fill"></i>}
      >
        <div className="mb-2">
          {contact.email && (
            <FlexContainer align="center" className="mb-2">
              <i className="bi bi-envelope me-2 text-muted"></i>
              <a href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </FlexContainer>
          )}
          
          {contact.telephone && (
            <FlexContainer align="center" className="mb-2">
              <i className="bi bi-telephone me-2 text-muted"></i>
              <a href={`tel:${contact.telephone}`}>
                {contact.telephone}
              </a>
            </FlexContainer>
          )}
        </div>
      </Card>
      
      {/* Structure associée */}
      <Card 
        className="mb-3"
        title="Structure"
        icon={<i className="bi bi-building"></i>}
      >
        {contact.structureId ? (
          <div>
            <div className="fw-bold">{contact.structureNom || "Structure associée"}</div>
            <small className="text-muted">
              {contact.structureType && `Type : ${contact.structureType}`}
            </small>
          </div>
        ) : (
          <span className="text-muted">Aucune structure associée</span>
        )}
      </Card>
      
      {/* Concerts associés */}
      <Card 
        className="mb-3"
        title="Concerts"
        icon={<i className="bi bi-calendar-event"></i>}
      >
        {contact.concertsAssocies && contact.concertsAssocies.length > 0 ? (
          <div className="list-group list-group-flush">
            {contact.concertsAssocies.slice(0, 3).map(concert => (
              <div 
                key={concert.id} 
                className="list-group-item list-group-item-action"
                onClick={() => navigate(`/concerts/${concert.id}`)}
              >
                <FlexContainer justify="space-between" align="center">
                  <div>
                    <div className="fw-semibold">{concert.titre || "Concert sans titre"}</div>
                    <small className="text-muted">
                      {new Date(concert.date).toLocaleDateString('fr-FR')}
                      {concert.lieu && ` - ${concert.lieu}`}
                    </small>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </FlexContainer>
              </div>
            ))}
            
            {contact.concertsAssocies.length > 3 && (
              <button 
                className="list-group-item list-group-item-action text-center text-primary"
                onClick={() => navigate(`/concerts?contact=${contact.id}`)}
              >
                Voir tous les concerts ({contact.concertsAssocies.length})
              </button>
            )}
          </div>
        ) : (
          <div className="text-muted">
            Aucun concert associé à ce contact
          </div>
        )}
      </Card>
      
      {/* Informations supplémentaires */}
      {contact.createdAt && (
        <div className="text-muted small mt-3">
          Créé le {formatValue(contact.createdAt, 'date')}
          {contact.updatedAt && ` • Modifié le ${formatValue(contact.updatedAt, 'date')}`}
        </div>
      )}
    </div>
  );
};

export default ContactView;