// src/components/programmateurs/desktop/ProgrammateurView.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ProgrammateurContactSection from './ProgrammateurContactSection';
import ProgrammateurLegalSection from './ProgrammateurLegalSection';
import ProgrammateurConcertsSection from './ProgrammateurConcertsSection';
import ProgrammateurStructuresSection from './ProgrammateurStructuresSection';
import ProgrammateurLieuxSection from './ProgrammateurLieuxSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './ProgrammateurDetails.module.css';

/**
 * Composant d'affichage des détails d'un programmateur - Version Desktop refactorisée
 * MIGRATION: Utilise maintenant les props passées par le composant parent
 */
const ProgrammateurView = ({
  programmateur,
  structure,
  lieux,
  concerts,
  loading,
  loadingStructure,
  loadingLieux,
  loadingConcerts,
  error,
  handleDelete,
  formatValue
}) => {
  console.log('[TRACE-UNIQUE][ProgrammateurView][desktop] Ce composant est exécuté !');
  const navigate = useNavigate();
  
  console.log('[TRACE-UNIQUE][ProgrammateurView] loading:', loading);
  console.log('[TRACE-UNIQUE][ProgrammateurView] error:', error);
  console.log('[TRACE-UNIQUE][ProgrammateurView] programmateur:', programmateur);
  console.log('[TRACE-UNIQUE][ProgrammateurView] structure:', structure);
  
  // État local pour contrôler l'affichage des sections
  const [sections, setSections] = useState({
    contactVisible: true,
    legalVisible: true,
    structureVisible: true,
    lieuxVisible: true,
    concertsVisible: true
  });
  
  // Gestion du toggle des sections
  const toggleSection = (sectionName) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  if (loading) {
    console.log('[TRACE-UNIQUE][ProgrammateurView] Affichage du spinner de chargement');
    return <LoadingSpinner message="Chargement du programmateur..." />;
  }
  
  if (error) {
    console.log('[TRACE-UNIQUE][ProgrammateurView] Affichage de l\'erreur:', error);
    return <ErrorMessage message={error.message || error} />;
  }
  
  if (!programmateur) {
    console.log('[TRACE-UNIQUE][ProgrammateurView] Aucun programmateur trouvé');
    return <ErrorMessage message="Programmateur introuvable" />;
  }
  
  // Fonction pour rediriger vers la page d'édition
  const handleEditClick = () => {
    navigate(`/programmateurs/${programmateur.id}/edit`);
  };
  
  console.log('[TRACE-UNIQUE][ProgrammateurView] Affichage du détail du programmateur');
  return (
    <Container className={styles.programmateurDetails}>
      {/* En-tête avec titre et actions */}
      <Card className="mb-4 bg-light">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                {programmateur.nom || 'Sans nom'} 
                {programmateur.fonction && <span className="text-muted fs-5"> ({programmateur.fonction})</span>}
              </h2>
            </div>
            <div>
              <Button 
                variant="outline-primary" 
                onClick={handleEditClick}
                className="me-2"
              >
                <i className="bi bi-pencil me-2"></i>
                Modifier
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={() => handleDelete(programmateur.id)}
              >
                <i className="bi bi-trash me-2"></i>
                Supprimer
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Disposition en une seule colonne */}
      <Row>
        <Col>
          {/* Carte Contact */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-vcard me-2"></i>
                Informations de contact
              </h5>
              <Button 
                variant="link" 
                className="p-0 text-white" 
                onClick={() => toggleSection('contactVisible')}
              >
                {sections.contactVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </Button>
            </Card.Header>
            
            {sections.contactVisible && (
              <Card.Body>
                <ProgrammateurContactSection
                  programmateur={programmateur}
                  isEditing={false}
                  formatValue={formatValue}
                />
              </Card.Body>
            )}
          </Card>

          {/* Carte Informations Légales */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Informations légales
              </h5>
              <Button 
                variant="link" 
                className="p-0 text-white" 
                onClick={() => toggleSection('legalVisible')}
              >
                {sections.legalVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </Button>
            </Card.Header>
            
            {sections.legalVisible && (
              <Card.Body>
                <ProgrammateurLegalSection
                  programmateur={programmateur}
                  isEditing={false}
                  formatValue={formatValue}
                />
              </Card.Body>
            )}
          </Card>
          
          {/* Carte Structure */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Structure
              </h5>
              <Button 
                variant="link" 
                className="p-0 text-white" 
                onClick={() => toggleSection('structureVisible')}
              >
                {sections.structureVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </Button>
            </Card.Header>
            
            {sections.structureVisible && (
              <Card.Body>
                <ProgrammateurStructuresSection 
                  programmateur={programmateur}
                  structure={structure}
                />
              </Card.Body>
            )}
          </Card>
          
          {/* Carte Lieux */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Lieux associés
              </h5>
              <Button 
                variant="link" 
                className="p-0 text-white" 
                onClick={() => toggleSection('lieuxVisible')}
              >
                {sections.lieuxVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </Button>
            </Card.Header>
            
            {sections.lieuxVisible && (
              <Card.Body>
                <ProgrammateurLieuxSection
                  programmateur={programmateur}
                  lieux={lieux}
                  isEditing={false}
                />
              </Card.Body>
            )}
          </Card>

          {/* Carte Concerts */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Concerts associés
              </h5>
              <Button 
                variant="link" 
                className="p-0 text-white" 
                onClick={() => toggleSection('concertsVisible')}
              >
                {sections.concertsVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </Button>
            </Card.Header>
            
            {sections.concertsVisible && (
              <Card.Body>
                <ProgrammateurConcertsSection
                  concertsAssocies={concerts || []}
                  isEditing={false}
                />
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProgrammateurView;