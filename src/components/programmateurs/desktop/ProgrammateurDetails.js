import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useProgrammateurDetails } from '@/hooks/programmateurs';
import ProgrammateurContactSection from './ProgrammateurContactSection';
import ProgrammateurLegalSection from './ProgrammateurLegalSection';
import ProgrammateurConcertsSection from './ProgrammateurConcertsSection';
import ProgrammateurStructuresSection from './ProgrammateurStructuresSection';
import ProgrammateurLieuxSection from './ProgrammateurLieuxSection';
import Spinner from '@/components/common/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './ProgrammateurDetails.module.css';

const ProgrammateurDetails = () => {
  const { id } = useParams();
  const { 
    programmateur,
    structure,
    loading,
    error,
    isEditing,
    toggleEditMode,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting,
    formatValue,
    lieux, // Extraire explicitement les lieux du hook
    loadingLieux,
    concerts, // Extraire explicitement les concerts du hook
    loadingConcerts,
  } = useProgrammateurDetails(id);
  
  // LOGS DE DIAGNOSTIC: Vérifier si les données sont bien extraites du hook
  useEffect(() => {
    console.log(`[DIAGNOSTIC] ProgrammateurDetails - Lieux reçus du hook:`, {
      lieuxCount: lieux?.length || 0,
      lieuxIds: lieux?.map(lieu => lieu.id) || [],
      loadingLieux,
    });
    
    console.log(`[DIAGNOSTIC] ProgrammateurDetails - Concerts reçus du hook:`, {
      concertsCount: concerts?.length || 0,
      concertIds: concerts?.map(concert => concert.id) || [],
      loadingConcerts,
    });
  }, [lieux, loadingLieux, concerts, loadingConcerts]);
  
  if (loading) {
    return <Spinner message="Chargement du programmateur..." contentOnly={true} />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!programmateur) {
    return <ErrorMessage message="Programmateur introuvable" />;
  }
  
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
          {isEditing ? (
            <>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={styles.actionButton}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Enregistrer les modifications
                  </>
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={toggleEditMode}
                disabled={isSubmitting}
                className={styles.actionButton}
              >
                <i className="bi bi-x-lg me-2"></i>
                Annuler
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline-primary" 
                onClick={toggleEditMode}
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
            </>
          )}
        </div>
      </div>
      
      <Row className="mt-4">
        <Col md={5}>
          <ProgrammateurContactSection
            programmateur={programmateur}
            formData={formData}
            handleChange={handleChange}
            isEditing={isEditing}
            formatValue={formatValue}
          />
          
          <div className="mt-4">
            <ProgrammateurStructuresSection 
              programmateur={programmateur}
              structure={structure}  // Passer la structure directement
            />
          </div>
          
          <div className="mt-4">
            <ProgrammateurLieuxSection
              programmateur={programmateur}
              lieux={lieux} // Passer explicitement les lieux
              loadingLieux={loadingLieux} // Ajout du loadingLieux à l'instance existante
              isEditing={isEditing}
            />
          </div>
        </Col>
        <Col md={7}>
          <ProgrammateurLegalSection
            programmateur={programmateur}
            formData={formData}
            handleChange={handleChange}
            isEditing={isEditing}
            formatValue={formatValue}
          />
          
          <div className="mt-4">
            <ProgrammateurConcertsSection
              concertsAssocies={concerts || []}
              isEditing={false}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProgrammateurDetails;
