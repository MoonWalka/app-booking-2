// src/components/contacts/desktop/ContactViewModern.js
import React, { useState, useMemo, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './ContactView.module.css';

// Import des hooks personnalisés
import { useGenericEntityDetails } from '@/hooks/common';

// Import des composants sections existants
import { ContactHeader } from './sections/ContactHeader';
import ContactGeneralInfo from './ContactGeneralInfo';
import ContactStructureSection from './ContactStructuresSection';
import ContactLieuxSection from './ContactLieuxSection';
import ContactConcertsSection from './ContactConcertsSection';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

/**
 * Composant de vue des détails d'un contact - Version Desktop MODERNE
 * Basé sur l'architecture de ConcertView
 */
const ContactViewModern = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = propId || urlId;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);

  // Configuration des relations pour le contact
  const relationsConfig = useMemo(() => [
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      nameField: 'structureNom',
      type: 'one-to-one',
      essential: true
    },
    {
      name: 'lieux',
      collection: 'lieux',
      idField: 'lieuxIds',
      nameField: 'lieuxNoms',
      type: 'one-to-many',
      essential: false
    }
  ], []);

  // Hook générique pour les détails du contact
  const genericDetails = useGenericEntityDetails({
    entityType: 'contact',
    collectionName: 'contacts',
    id,
    relationsConfig,
    onSaveSuccess: () => {},
    onSaveError: () => {},
    onDeleteSuccess: () => navigate('/contacts'),
    onDeleteError: () => {},
    navigate,
    returnPath: '/contacts',
    editPath: '/contacts/:id/edit'
  });

  const {
    entity: contact,
    relatedData,
    loading,
    isSubmitting,
    formData,
    handleSave,
    handleChange,
    handleDelete
  } = genericDetails || {};

  // Extraire les entités liées
  const structure = relatedData?.structure;
  const lieux = relatedData?.lieux || [];

  // Callbacks stables
  const stableCallbacks = useMemo(() => ({
    handleEdit: () => navigate(`/contacts/${id}/edit`),
    handleCancel: () => navigate(`/contacts/${id}`),
    handleOpenDeleteModal: () => setShowDeleteConfirm(true),
    handleCloseDeleteModal: () => setShowDeleteConfirm(false)
  }), [navigate, id]);

  // Callbacks de navigation
  const navigationCallbacks = useMemo(() => ({
    navigateToList: () => navigate('/contacts'),
    navigateToStructureDetails: (structureId) => navigate(`/structures/${structureId}`),
    navigateToLieuDetails: (lieuId) => navigate(`/lieux/${lieuId}`),
    navigateToConcertDetails: (concertId) => navigate(`/concerts/${concertId}`),
    handleCreateStructure: () => navigate('/structures/nouveau'),
    handleCreateLieu: () => navigate('/lieux/nouveau')
  }), [navigate]);

  // Gestion d'erreur
  if (!genericDetails && isEditMode) {
    console.error("[ContactViewModern] Erreur critique: genericDetails est indéfini en mode édition.");
    return <Alert variant="danger">Erreur lors du chargement des données d'édition du contact.</Alert>;
  }
  if (!genericDetails && !isEditMode) {
    if (!id) return <Alert variant="danger">ID de contact manquant.</Alert>;
    return <Alert variant="danger">Erreur lors du chargement des données de vue du contact.</Alert>;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du contact...</span>
          </div>
          <p className="mt-2">Chargement du contact...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactViewContainer || 'contact-view-container'}>
      <ContactHeader 
        contact={contact}
        onEdit={stableCallbacks.handleEdit}
        onDelete={stableCallbacks.handleOpenDeleteModal}
        isEditMode={isEditMode}
        navigateToList={navigationCallbacks.navigateToList}
        onSave={handleSave}
        onCancel={stableCallbacks.handleCancel}
        isSubmitting={isSubmitting}
        canSave={true}
      />

      <ContactGeneralInfo 
        contact={contact}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
      />

      <ContactStructureSection 
        contactId={id}
        structure={structure}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToStructureDetails={navigationCallbacks.navigateToStructureDetails}
      />

      <ContactLieuxSection 
        contactId={id}
        lieux={lieux}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToLieuDetails={navigationCallbacks.navigateToLieuDetails}
      />

      <ContactConcertsSection 
        contactId={id}
        isEditMode={isEditMode}
        navigateToConcertDetails={navigationCallbacks.navigateToConcertDetails}
      />

      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={stableCallbacks.handleCloseDeleteModal}
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirm(false);
        }}
        title="Supprimer le contact"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce contact ?"
        entityName={contact?.nom}
        variant="danger"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
      />
    </div>
  );
});

export default ContactViewModern;