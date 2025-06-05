// src/components/contacts/desktop/ContactView.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { ContactHeader } from './sections/ContactHeader';
import ContactSection from './ContactContactSection';
import ContactConcertsSectionV2 from './sections/ContactConcertsSectionV2';
import ContactStructureSectionV2 from './sections/ContactStructureSectionV2';
import ContactLieuxSectionV2 from './sections/ContactLieuxSectionV2';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './ContactDetails.module.css';

/**
 * Composant d'affichage des détails d'un contact - Version Desktop
 * Adapté du style maquette concert details
 */
const ContactView = ({
  contact,
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
  const navigate = useNavigate();
  
  console.log('[TRACE-UNIQUE][ContactView] loading:', loading);
  console.log('[TRACE-UNIQUE][ContactView] error:', error);
  console.log('[TRACE-UNIQUE][ContactView] contact:', contact);
  console.log('[TRACE-UNIQUE][ContactView] structure:', structure);
  console.log('[TRACE-UNIQUE][ContactView] lieux:', lieux);
  console.log('[TRACE-UNIQUE][ContactView] concerts:', concerts);
  console.log('[TRACE-UNIQUE][ContactView] loadingStructure:', loadingStructure);
  console.log('[TRACE-UNIQUE][ContactView] loadingLieux:', loadingLieux);
  console.log('[TRACE-UNIQUE][ContactView] loadingConcerts:', loadingConcerts);
  
  // État local pour contrôler l'affichage des sections
  const [sections, setSections] = useState({
    contactVisible: true,
    structureVisible: true,
    lieuxVisible: true,
    concertsVisible: true
  });
  
  // Gestion du toggle des sections - Commenté car non utilisé actuellement
  // const toggleSection = (sectionName) => {
  //   setSections(prev => ({
  //     ...prev,
  //     [sectionName]: !prev[sectionName]
  //   }));
  // };
  
  if (loading) {
    return <LoadingSpinner message="Chargement du contact..." />;
  }
  
  if (error) {
    console.log('[TRACE-UNIQUE][ContactView] Affichage de l\'erreur:', error);
    return <ErrorMessage message={error.message || error} />;
  }
  
  if (!contact) {
    console.log('[TRACE-UNIQUE][ContactView] Aucun contact trouvé');
    return <ErrorMessage message="Contact introuvable" />;
  }
  
  // Fonction pour rediriger vers la page d'édition
  const handleEditClick = () => {
    navigate(`/contacts/${contact.id}/edit`);
  };
  
  return (
    <div className={styles.contactDetails}>
      {/* Header avec ContactHeader en mode lecture */}
      <ContactHeader 
        contact={contact}
        isEditMode={false}
        isNewFromUrl={false}
        onEdit={handleEditClick}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={() => handleDelete(contact.id)}
        isSubmitting={false}
        canSave={false}
        navigateToList={() => navigate('/contacts')}
      />
      
      {/* Sections - style maquette concert details */}
      <div>
        {/* Section Contact - style maquette */}
        <Card
          title="Informations de contact"
          icon={<i className="bi bi-person-vcard"></i>}
          headerClassName="contact"
          collapsible={true}
          defaultCollapsed={!sections.contactVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, contactVisible: !collapsed}))}
        >
          <ContactSection
            contact={contact}
            isEditing={false}
            formatValue={formatValue}
            showCardWrapper={false}
          />
        </Card>
        
        {/* Section Structure - style maquette */}
        <Card
          title="Structure"
          icon={<i className="bi bi-building"></i>}
          headerClassName="contact"
          collapsible={true}
          defaultCollapsed={!sections.structureVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, structureVisible: !collapsed}))}
        >
          <ContactStructureSectionV2 
            contactId={contact?.id}
            structure={structure}
            isEditMode={false}
            navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
          />
        </Card>
        
        {/* Section Lieux - style maquette */}
        <Card
          title="Lieux associés"
          icon={<i className="bi bi-geo-alt"></i>}
          headerClassName="lieu"
          collapsible={true}
          defaultCollapsed={!sections.lieuxVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, lieuxVisible: !collapsed}))}
        >
          <ContactLieuxSectionV2
            contactId={contact?.id}
            lieux={lieux}
            isEditMode={false}
            navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          />
        </Card>

        {/* Section Concerts - style maquette */}
        <Card
          title="Concerts associés"
          icon={<i className="bi bi-calendar-event"></i>}
          headerClassName="info"
          collapsible={true}
          defaultCollapsed={!sections.concertsVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, concertsVisible: !collapsed}))}
        >
          <ContactConcertsSectionV2
            contactId={contact?.id}
            isEditMode={false}
            navigateToConcertDetails={(concertId) => navigate(`/concerts/${concertId}`)}
          />
        </Card>
      </div>
    </div>
  );
};

export default ContactView;