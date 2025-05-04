// src/components/programmateurs/desktop/ProgrammateurView.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useProgrammateurDetails } from '@/hooks/programmateurs';
import ProgrammateurContactSection from './ProgrammateurContactSection';
import ProgrammateurLegalSection from './ProgrammateurLegalSection';
import ProgrammateurConcertsSection from './ProgrammateurConcertsSection';
import ProgrammateurStructuresSection from './ProgrammateurStructuresSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './ProgrammateurDetails.module.css';

/**
 * Composant d'affichage des détails d'un programmateur - Version Desktop
 * Séparé du mode édition pour une meilleure séparation des préoccupations
 */
const ProgrammateurView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    programmateur, 
    structure,  // Récupérer la structure du hook
    loading, 
    error,
    handleDelete,
    isSubmitting,
    formatValue
  } = useProgrammateurDetails(id);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!programmateur) {
    return <ErrorMessage message="Programmateur introuvable" />;
  }
  
  // Fonction pour rediriger vers la page d'édition
  const handleEditClick = () => {
    navigate(`/programmateurs/edit/${id}`);
  };
  
  return (
    <Container className={styles.programmateurDetails}>
      <div className={styles.header}>
        <h2>
          {programmateur.nom}
          {programmateur.fonction && (
            <span className={styles.fonction}> - {programmateur.fonction}</span>
          )}
        </h2>
        <div className={styles.actions}>
          <Button 
            variant="outline-primary" 
            onClick={handleEditClick}
            className={styles.actionButton}
          >
            <i className="bi bi-pencil me-2"></i>
            Modifier
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={handleDelete}
            className={styles.actionButton}
          >
            <i className="bi bi-trash me-2"></i>
            Supprimer
          </Button>
        </div>
      </div>
      
      <Row className="mt-4">
        <Col md={5}>
          <ProgrammateurContactSection
            programmateur={programmateur}
            isEditing={false}
            formatValue={formatValue}
          />
          
          <div className="mt-4">
            <ProgrammateurStructuresSection 
              programmateur={programmateur}
              structure={structure}  // Passer la structure directement
            />
          </div>
        </Col>
        <Col md={7}>
          <ProgrammateurLegalSection
            programmateur={programmateur}
            isEditing={false}
            formatValue={formatValue}
          />
          
          <div className="mt-4">
            <ProgrammateurConcertsSection
              concertsAssocies={programmateur.concertsAssocies || []}
              isEditing={false}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProgrammateurView;