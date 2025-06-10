import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/services/firebase-service';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// Import des composants UI standardisés
import LoadingSpinner from '@components/ui/LoadingSpinner';
import Button from '@components/ui/Button';
import ErrorMessage from '@components/ui/ErrorMessage';

// MIGRATION: Utilisation du hook optimisé
import { useContactForm } from '@/hooks/contacts';
import { useCompanySearch } from '@/hooks/common';
import { useAddressSearch } from '@/hooks/common';
import useDeleteContact from '@/hooks/contacts/useDeleteContact';

// Import section components
import { ContactHeader } from './sections/ContactHeader';
import ContactSection from './sections/ContactContactSection';
import ContactStructureSection from './sections/ContactStructureSection';
import ContactLieuxSectionWrapper from './sections/ContactLieuxSectionWrapper';
import ContactConcertsSectionWrapper from './sections/ContactConcertsSectionWrapper';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

// Import des styles CSS Module
import styles from './ContactForm.module.css';

/**
 * ContactForm component - displays a programmer's details in edit mode
 * Peut fonctionner en mode normal (édition) ou en mode public (soumission de formulaire)
 */
const ContactForm = ({ 
  // Props pour le mode public
  token,
  concertId,
  formLinkId,
  initialLieuData,
  onSubmitSuccess
}) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Détecter le mode public vs normal
  const isPublicMode = !!(token && concertId);
  
  // En mode public, on n'utilise pas l'ID de l'URL
  const contactId = isPublicMode ? null : id;
  
  // Détecter le mode "nouveau" via l'URL (seulement en mode normal)
  const isNewFromUrl = !isPublicMode && location.pathname.endsWith('/nouveau');

  // MIGRATION: Utilisation du hook optimisé
  const{ 
    contact, 
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
  } = useContactForm(contactId);

  // Hooks pour la recherche d'entreprise et d'adresses
  const companySearch = useCompanySearch({
    onCompanySelect: (company) => {
      handleStructureChange(company);
    }
  });

  const addressSearch = useAddressSearch(
    formData, 
    setFormData, 
    { nom: '', adresse: '', codePostal: '', ville: '', capacite: '', latitude: null, longitude: null }, 
    () => {}
  );
  
  // Hook de suppression optimisé (seulement en mode normal)
  const deleteHook = useDeleteContact(() => navigate('/contacts'));
  const {
    isDeleting,
    showDeleteModal,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  } = isPublicMode ? {} : deleteHook;

  // Information sur les concerts associés (seulement en mode normal)
  const hasAssociatedConcerts = !isPublicMode && (contact?.concertsAssocies?.length > 0 || false);

  // Handlers avec notifications
  const handleSaveWithNotification = async (e) => {
    try {
      if (isPublicMode) {
        // Mode public : créer une soumission de formulaire
        await handlePublicSubmit(e);
        toast.success('Formulaire envoyé avec succès !', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
        });
        // Appeler le callback de succès
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        // Mode normal : enregistrer le contact
        await handleSubmit(e);
        toast.success('Contact enregistré avec succès !', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      const message = isPublicMode ? 'Erreur lors de l\'envoi du formulaire' : 'Erreur lors de l\'enregistrement';
      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  // Fonction pour gérer la soumission en mode public
  const handlePublicSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Soumission publique:', { token, concertId, formLinkId, formData });
      
      // Créer la soumission de formulaire
      const submissionData = {
        // Métadonnées
        concertId,
        formLinkId,
        token,
        submittedAt: serverTimestamp(),
        status: 'pending', // pending, validated, rejected
        
        // Données du contact (structure PLATE)
        contactData: {
          // Champs du contact
          nom: formData.nom || '',
          prenom: formData.prenom || '',
          fonction: formData.fonction || '',
          email: formData.email || '',
          telephone: formData.telephone || '',
          
          // Champs de la structure
          structureId: formData.structureId || null,
          structureNom: formData.structureNom || '',
          structureRaisonSociale: formData.structureRaisonSociale || '',
          structureAdresse: formData.structureAdresse || '',
          structureCodePostal: formData.structureCodePostal || '',
          structureVille: formData.structureVille || '',
          structurePays: formData.structurePays || 'France',
          structureSiret: formData.structureSiret || '',
          structureTva: formData.structureTva || '',
          structureType: formData.structureType || ''
        },
        
        // Données du lieu si modifiées
        lieuData: initialLieuData || {},
        
        // Données brutes complètes pour référence
        rawData: formData
      };
      
      // Créer le document dans formSubmissions
      const submissionRef = await addDoc(collection(db, 'formSubmissions'), submissionData);
      
      console.log('Soumission créée avec ID:', submissionRef.id);
      
      // Marquer le lien de formulaire comme complété
      if (formLinkId) {
        await updateDoc(doc(db, 'formLinks', formLinkId), {
          completed: true,
          completedAt: serverTimestamp(),
          submissionId: submissionRef.id
        });
      }
      
      // Optionnel : mettre à jour le concert avec la référence de soumission
      await updateDoc(doc(db, 'concerts', concertId), {
        lastFormSubmissionId: submissionRef.id,
        hasFormSubmission: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('Formulaire soumis avec succès');
      return submissionRef.id;
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      throw error;
    }
  };

  const handleCancelWithNotification = () => {
    if (isPublicMode) {
      // En mode public, on ne fait rien ou on peut rappeler onSubmitSuccess avec un flag d'annulation
      toast.info('Formulaire annulé', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } else {
      // Mode normal
      toast.info('Édition annulée', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      hookHandleCancel();
    }
  };

  // En mode public, on n'affiche pas les erreurs et chargements de la même façon
  // If loading, show a spinner
  if (loading && !isPublicMode) {
    return (
      <div className={styles.spinnerContainer}>
        <LoadingSpinner variant="primary" message="Chargement du contact..." />
      </div>
    );
  }

  // If error, show an error message (seulement en mode normal)
  if (error && !isPublicMode) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="danger" icon="exclamation-triangle-fill">
          {error.message || error}
        </ErrorMessage>
        <Button 
          variant="primary" 
          onClick={() => navigate('/contacts')}
          iconStart="arrow-left"
        >
          Retour à la liste des contacts
        </Button>
      </div>
    );
  }

  // If no contact and not creating new one (seulement en mode normal)
  if (!contact && !isNewFromUrl && !loading && !isPublicMode) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="warning" icon="exclamation-triangle-fill">
          Ce contact n'existe pas ou n'a pas pu être chargé.
        </ErrorMessage>
        <Button 
          variant="primary" 
          onClick={() => navigate('/contacts')}
          iconStart="arrow-left"
        >
          Retour à la liste des contacts
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSaveWithNotification}>
        {/* Header with title and action buttons - seulement en mode normal */}
        {!isPublicMode && (
          <ContactHeader 
            contact={contact}
            isEditMode={true}
            isNewFromUrl={isNewFromUrl}
            onEdit={() => {}}
            onSave={handleSaveWithNotification}
            onCancel={handleCancelWithNotification}
            onDelete={() => handleDeleteClick(contact)}
            isSubmitting={isSubmitting}
            canSave={true}
            navigateToList={() => navigate('/contacts')}
          />
        )}

        {/* Sections empilées verticalement en mode édition */}
        <div className={styles.sectionsStack}>
          <ContactSection 
            contact={contact}
            isEditMode={true}
            formData={formData}
            onChange={handleChange}
            errors={{}}
          />
          
          <ContactStructureSection
            contact={contact}
            structure={structure}
            isEditMode={true}
            formData={formData}
            onChange={handleChange}
            onStructureChange={handleStructureChange}
            companySearch={companySearch}
            addressSearch={addressSearch}
            formatValue={formatValue}
            errors={{}}
          />
          
          {/* Sections lieux et concerts seulement en mode normal */}
          {!isPublicMode && (
            <>
              <ContactLieuxSectionWrapper
                contact={contact}
                isEditMode={true}
                formData={formData}
                onChange={handleChange}
              />
              
              <ContactConcertsSectionWrapper
                contact={contact}
                isEditMode={true}
                concertsAssocies={contact?.concertsAssocies || []}
              />
            </>
          )}
          
          {/* En mode public, ajouter un bouton de soumission */}
          {isPublicMode && (
            <div className="mt-4 text-center">
              <Button 
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                iconStart={isSubmitting ? "spinner" : "check"}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le formulaire'}
              </Button>
            </div>
          )}
        </div>

        {/* Delete confirmation modal - seulement en mode normal */}
        {!isPublicMode && (
          <ConfirmationModal
            show={showDeleteModal}
            onHide={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            title="Supprimer le contact"
            message="Êtes-vous sûr de vouloir supprimer définitivement ce contact ?"
            entityName={contact?.nom || contact?.prenom}
            variant="danger"
            confirmText="Supprimer définitivement"
            cancelText="Annuler"
            isLoading={isDeleting}
            warnings={hasAssociatedConcerts ? ['Ce contact a des concerts associés. Ils seront également affectés.'] : undefined}
          />
        )}
      </form>
    </div>
  );
};

export default ContactForm;
