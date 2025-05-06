import React, { useState, useEffect } from 'react';
import { Form, Alert, Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ProgrammateurForm.module.css';

// Import des sous-composants
import ContactInfoSection from '../sections/ContactInfoSection';
import StructureInfoSection from '../sections/StructureInfoSection';
import LieuInfoSection from '../sections/LieuInfoSection';
import CompanySearchSection from '../sections/CompanySearchSection';
import ProgrammateurLegalSection from './ProgrammateurLegalSection';
import ProgrammateurConcertsSection from './ProgrammateurConcertsSection';
import ProgrammateurLieuxSection from './ProgrammateurLieuxSection';

// Import des hooks personnalisés
import { useProgrammateurDetails } from '@/hooks/programmateurs';
import { useCompanySearch } from '@/hooks/programmateurs';
import { useAddressSearch } from '@/hooks/common';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

/**
 * Formulaire d'édition d'un programmateur - Version Desktop harmonisée avec ProgrammateurView
 * Utilise la même structure en cartes que la vue mais en mode édition
 */
const ProgrammateurForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Utiliser le même hook que ProgrammateurView pour la consistance
  const { 
    programmateur, 
    structure,
    loading, 
    error,
    isEditing,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting,
    formatValue
  } = useProgrammateurDetails(id);
  
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

  // Hooks pour la recherche d'entreprise et d'adresses
  const companySearch = useCompanySearch(setFormData);

  const addressSearch = useAddressSearch(
    formData, 
    setFormData, 
    { nom: '', adresse: '', codePostal: '', ville: '', capacite: '', latitude: null, longitude: null }, 
    () => {}
  );
  
  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = () => {
    navigate(`/programmateurs/${id}`);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!programmateur && id !== 'nouveau') {
    return <ErrorMessage message="Programmateur introuvable" />;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Container className={styles.programmateurForm}>
        {/* En-tête avec titre et actions */}
        <Card className="mb-4 bg-light">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">
                  {id === 'nouveau' ? 'Nouveau programmateur' : `Éditer: ${programmateur?.nom || 'Programmateur'}`}
                  {programmateur?.fonction && <span className="text-muted fs-5"> ({programmateur.fonction})</span>}
                </h2>
              </div>
              <div>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSubmitting}
                  className="me-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Enregistrer
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  type="button"
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Annuler
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        {/* Message d'erreur global si nécessaire */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        
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
                  type="button"
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
                  <ContactInfoSection 
                    formData={formData}
                    handleChange={handleChange}
                    errors={{}}
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
                  type="button"
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
                    isEditing={true}
                    formData={formData}
                    handleChange={handleChange}
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
                  type="button"
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
                  {/* Options de recherche d'entreprise */}
                  <CompanySearchSection 
                    searchType={companySearch.searchType}
                    setSearchType={companySearch.setSearchType}
                    searchTerm={companySearch.searchTerm}
                    setSearchTerm={companySearch.setSearchTerm}
                    searchResults={companySearch.searchResults}
                    isSearchingCompany={companySearch.isSearchingCompany}
                    handleSelectCompany={companySearch.handleSelectCompany}
                  />
                  
                  {/* Formulaire de structure juridique */}
                  <StructureInfoSection 
                    formData={formData}
                    handleChange={handleChange}
                    errors={{}}
                    addressSuggestions={addressSearch.addressSuggestions} 
                    isSearchingAddress={addressSearch.isSearchingAddress}
                    addressFieldActive={addressSearch.addressFieldActive}
                    setAddressFieldActive={addressSearch.setAddressFieldActive}
                    handleSelectAddress={addressSearch.handleSelectAddress}
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
                  type="button"
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
                    isEditing={true}
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
                  type="button"
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
                    concertsAssocies={programmateur?.concertsAssocies || []}
                    isEditing={true}
                  />
                </Card.Body>
              )}
            </Card>
            
            {/* Boutons du formulaire */}
            <div className="d-flex justify-content-between mt-4 mb-5">
              <Button 
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                type="button"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour
              </Button>
              
              <div>
                {id !== 'nouveau' && (
                  <Button 
                    variant="outline-danger"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="me-2"
                    type="button"
                  >
                    <i className="bi bi-trash me-2"></i>
                    Supprimer
                  </Button>
                )}
                
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Form>
  );
};

export default ProgrammateurForm;
