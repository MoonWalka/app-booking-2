import React, { useState } from 'react';
import { Form, Alert, Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './ProgrammateurForm.module.css';

// Import des sous-composants
import ContactInfoSection from '../sections/ContactInfoSection';
import StructureInfoSection from '../sections/StructureInfoSection';
import LieuInfoSection from '../sections/LieuInfoSection';
import CompanySearchSection from '../sections/CompanySearchSection';
import ProgrammateurLegalSection from './ProgrammateurLegalSection';
import ProgrammateurConcertsSection from './ProgrammateurConcertsSection';
import ProgrammateurLieuxSection from './ProgrammateurLieuxSection';
import Card from '../../../components/ui/Card';

// MIGRATION: Utilisation du hook optimisé
import { useProgrammateurForm } from '@/hooks/programmateurs';
import { useCompanySearch } from '@/hooks/common';
import { useAddressSearch } from '@/hooks/common';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import useDeleteProgrammateur from '@/hooks/programmateurs/useDeleteProgrammateur';

/**
 * Formulaire d'édition d'un programmateur - Version Desktop harmonisée avec ProgrammateurView
 * MIGRATION: Utilise maintenant le hook optimisé pour une meilleure performance et gestion des erreurs
 */
const ProgrammateurForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Détecter le mode "nouveau" via l'URL
  const isNewFromUrl = location.pathname.endsWith('/nouveau');

  // LOGS TEMPORAIREMENT DÉSACTIVÉS POUR ÉVITER LA BOUCLE
  // console.log('[DEBUG][ProgrammateurForm] Mode détecté:', isNewFromUrl ? 'nouveau' : 'édition');

  // MIGRATION: Utilisation du hook optimisé
  const{ 
    programmateur, 
    structure,
    loading, 
    error,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isSubmitting,
    formatValue,
    handleStructureChange,
    handleCancel: hookHandleCancel
  } = useProgrammateurForm(id);
  
  
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
  const companySearch = useCompanySearch((company) => {
    // MIGRATION: Utiliser handleStructureChange du hook optimisé
    handleStructureChange(company);
  });

  const addressSearch = useAddressSearch(
    formData, 
    setFormData, 
    { nom: '', adresse: '', codePostal: '', ville: '', capacite: '', latitude: null, longitude: null }, 
    () => {}
  );
  
  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDelete
  } = useDeleteProgrammateur(() => navigate('/programmateurs'));
  
  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = () => {
    hookHandleCancel();
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
        <Card 
          className="mb-4"
          variant="light"
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                {isNewFromUrl ? 'Nouveau programmateur' : `Éditer: ${programmateur?.nom || 'Programmateur'}`}
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
            <Card 
              className="mb-4"
              title="Informations de contact"
              icon={<i className="bi bi-person-vcard"></i>}
              variant="primary"
              headerActions={
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
              }
            >
              {sections.contactVisible && (
                <ContactInfoSection 
                  formData={formData}
                  handleChange={handleChange}
                  errors={{}}
                />
              )}
            </Card>

            {/* Carte Informations Légales */}
            <Card 
              className="mb-4"
              title="Informations légales"
              icon={<i className="bi bi-file-earmark-text"></i>}
              variant="primary"
              headerActions={
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
              }
            >
              {sections.legalVisible && (
                <ProgrammateurLegalSection
                  programmateur={programmateur}
                  isEditing={true}
                  formData={formData}
                  handleChange={handleChange}
                  showCardWrapper={false}
                />
              )}
            </Card>
            
            {/* Carte Structure */}
            <Card 
              className="mb-4"
              title="Structure"
              icon={<i className="bi bi-building"></i>}
              variant="primary"
              headerActions={
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
              }
            >
              {sections.structureVisible && (
                <>
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
                    structure={structure}
                    formatValue={formatValue}
                  />
                </>
              )}
            </Card>
            
            {/* Carte Lieux */}
            <Card 
              className="mb-4"
              title="Lieux associés"
              icon={<i className="bi bi-geo-alt"></i>}
              variant="primary"
              headerActions={
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
              }
            >
              {sections.lieuxVisible && (
                <>
                  {/* Section d'informations sur les lieux - NOUVEAU: Finalisation intelligente */}
                  <LieuInfoSection
                    formData={formData}
                    handleChange={handleChange}
                    errors={{}}
                    lieuxOptions={[]}
                    setShowLieuModal={() => {}}
                  />
                  
                  {/* Section des lieux associés existants */}
                  <ProgrammateurLieuxSection
                    programmateur={programmateur}
                    isEditing={true}
                    showCardWrapper={false}
                  />
                </>
              )}
            </Card>

            {/* Carte Concerts */}
            <Card 
              className="mb-4"
              title="Concerts associés"
              icon={<i className="bi bi-calendar-event"></i>}
              variant="primary"
              headerActions={
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
              }
            >
              {sections.concertsVisible && (
                <ProgrammateurConcertsSection
                  concertsAssocies={programmateur?.concertsAssocies || []}
                  isEditing={true}
                  showCardWrapper={false}
                />
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
                {!isNewFromUrl && (
                  <Button 
                    variant="outline-danger"
                    onClick={() => handleDelete(id)}
                    disabled={isSubmitting || isDeleting}
                    className="me-2"
                    type="button"
                  >
                    {isDeleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Supprimer
                      </>
                    )}
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
