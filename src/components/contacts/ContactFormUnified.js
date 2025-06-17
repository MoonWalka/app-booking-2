import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import FormHeader from '@/components/ui/FormHeader';

// Import des nouvelles sections
import ContactStructureSection from '@/components/contacts/sections/ContactStructureSection';
import ContactPersonneSection from '@/components/contacts/sections/ContactPersonneSection';
import ContactQualificationSection from '@/components/contacts/sections/ContactQualificationSection';
import ContactDiffusionSection from '@/components/contacts/sections/ContactDiffusionSection';
import ContactSalleSection from '@/components/contacts/sections/ContactSalleSection';

import styles from './ContactForm.module.css';

/**
 * ContactFormUnified - Formulaire unifié pour créer Structure ou Personne
 * Intègre toutes les sections de métadonnées avec validation intelligente
 */
const ContactFormUnified = () => {
  const { id, type } = useParams(); // type = 'structure' ou 'personne'
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganization } = useOrganization();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Détecter le mode "nouveau" et le type
  const isNewFromUrl = location.pathname.includes('/nouveau');
  const contactType = type || 'personne'; // par défaut personne
  
  // Debug logs
  console.log('[ContactFormUnified] location.pathname:', location.pathname);
  console.log('[ContactFormUnified] params id:', id);
  console.log('[ContactFormUnified] params type:', type);
  console.log('[ContactFormUnified] isNewFromUrl:', isNewFromUrl);
  
  // État complet du formulaire avec toutes les métadonnées
  const [formData, setFormData] = useState({
    // Type de contact
    type: contactType,
    
    // Section Structure
    structureRaisonSociale: '',
    structureAdresse: '',
    structureSuiteAdresse1: '',
    structureCodePostal: '',
    structureVille: '',
    structureDepartement: '',
    structureRegion: '',
    structurePays: 'France',
    structureSiteWeb: '',
    structureTelephone1: '',
    structureTelephone2: '',
    structureMobile: '',
    structureFax: '',
    structureEmail: '',
    structureCommentaires1: '',
    structureCommentaires2: '',
    structureCommentaires3: '',
    structureCommentaires4: '',
    structureCommentaires5: '',
    structureCommentaires6: '',
    
    // Section Personne 1 (principale)
    civilite: '',
    prenom: '',
    nom: '',
    prenomNom: '',
    fonction: '',
    telDirect: '',
    telPerso: '',
    mobile: '',
    mailDirect: '',
    mailPerso: '',
    fax: '',
    site: '',
    adresse: '',
    suiteAdresse1: '',
    codePostal: '',
    ville: '',
    region: '',
    province: '',
    pays: 'France',
    commentaires1: '',
    commentaires2: '',
    commentaires3: '',
    
    // Section Personne 2
    civilite2: '',
    prenom2: '',
    nom2: '',
    prenomNom2: '',
    fonction2: '',
    telDirect2: '',
    telPerso2: '',
    mobile2: '',
    mailDirect2: '',
    mailPerso2: '',
    fax2: '',
    site2: '',
    adresse2: '',
    suiteAdresse2: '',
    codePostal2: '',
    ville2: '',
    region2: '',
    province2: '',
    pays2: 'France',
    commentaires12: '',
    commentaires22: '',
    commentaires32: '',
    
    // Section Personne 3
    civilite3: '',
    prenom3: '',
    nom3: '',
    prenomNom3: '',
    fonction3: '',
    telDirect3: '',
    telPerso3: '',
    mobile3: '',
    mailDirect3: '',
    mailPerso3: '',
    fax3: '',
    site3: '',
    adresse3: '',
    suiteAdresse3: '',
    codePostal3: '',
    ville3: '',
    region3: '',
    province3: '',
    pays3: 'France',
    commentaires13: '',
    commentaires23: '',
    commentaires33: '',
    
    // Section Qualification
    tags: [],
    client: false,
    source: '',
    createdAt: null,
    updatedAt: null,
    
    // Section Diffusion
    nomFestival: '',
    periodeFestivalMois: '',
    periodeFestivalComplete: '',
    bouclage: '',
    diffusionCommentaires1: '',
    diffusionCommentaires2: '',
    diffusionCommentaires3: '',
    
    // Section Salle
    salleNom: '',
    salleAdresse: '',
    salleSuiteAdresse: '',
    salleCodePostal: '',
    salleVille: '',
    salleDepartement: '',
    salleRegion: '',
    sallePays: 'France',
    salleTelephone: '',
    salleJauge1: '',
    salleJauge2: '',
    salleJauge3: '',
    salleOuverture: '',
    salleProfondeur: '',
    salleHauteur: ''
  });

  // Chargement des données du contact existant
  useEffect(() => {
    const loadContact = async () => {
      // Si c'est un nouveau contact OU s'il n'y a pas d'ID, ne pas essayer de charger
      if (isNewFromUrl || !id) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'contacts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Charger toutes les données dans formData
          setFormData(prevData => ({
            ...prevData,
            ...data
          }));
        } else {
          setError('Contact introuvable');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement du contact');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id, isNewFromUrl]);

  // Gestionnaire de changement des champs
  const handleChange = useCallback((e) => {
    const { name, value, type: inputType, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: inputType === 'checkbox' ? checked : value
      };

      // Auto-calcul du prénom+nom pour les personnes
      if (name === 'prenom' || name === 'nom') {
        const prenom = name === 'prenom' ? value : prev.prenom;
        const nom = name === 'nom' ? value : prev.nom;
        newData.prenomNom = `${prenom} ${nom}`.trim();
      }

      return newData;
    });
  }, []);

  // Validation intelligente selon le type
  const validateForm = () => {
    const errors = [];
    
    if (contactType === 'structure') {
      // Pour une structure : au minimum la raison sociale
      if (!formData.structureRaisonSociale?.trim()) {
        errors.push('La raison sociale est obligatoire pour une structure');
      }
    } else {
      // Pour une personne : au minimum prénom + nom
      if (!formData.prenom?.trim()) {
        errors.push('Le prénom est obligatoire pour une personne');
      }
      if (!formData.nom?.trim()) {
        errors.push('Le nom est obligatoire pour une personne');
      }
    }
    
    // Validation des emails si fournis
    const emailFields = ['structureEmail', 'mailDirect', 'mailPerso', 'mailDirect2', 'mailPerso2', 'mailDirect3', 'mailPerso3'];
    emailFields.forEach(field => {
      if (formData[field]?.trim() && !/^\S+@\S+\.\S+$/.test(formData[field])) {
        errors.push(`Format d'email invalide pour ${field}`);
      }
    });
    
    return errors;
  };

  // Auto-détection du type selon les champs remplis
  const detectContactType = () => {
    const hasStructureData = formData.structureRaisonSociale?.trim();
    const hasPersonneData = formData.prenom?.trim() && formData.nom?.trim();
    
    if (hasStructureData && !hasPersonneData) return 'structure';
    if (hasPersonneData && !hasStructureData) return 'personne';
    if (hasStructureData && hasPersonneData) return 'mixte';
    return contactType; // garder le type initial
  };

  // Gestionnaire de sauvegarde avec structure sectionnée
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '));
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Détection automatique du type
      const detectedType = detectContactType();
      
      // Structure sectionnée pour Firebase
      const contact = {
        type: detectedType,
        structure: {
          raisonSociale: formData.structureRaisonSociale?.trim() || '',
          adresse: formData.structureAdresse?.trim() || '',
          suiteAdresse1: formData.structureSuiteAdresse1?.trim() || '',
          codePostal: formData.structureCodePostal?.trim() || '',
          ville: formData.structureVille?.trim() || '',
          departement: formData.structureDepartement?.trim() || '',
          region: formData.structureRegion?.trim() || '',
          pays: formData.structurePays?.trim() || '',
          siteWeb: formData.structureSiteWeb?.trim() || '',
          telephone1: formData.structureTelephone1?.trim() || '',
          telephone2: formData.structureTelephone2?.trim() || '',
          mobile: formData.structureMobile?.trim() || '',
          fax: formData.structureFax?.trim() || '',
          email: formData.structureEmail?.trim() || '',
          commentaires1: formData.structureCommentaires1?.trim() || '',
          commentaires2: formData.structureCommentaires2?.trim() || '',
          commentaires3: formData.structureCommentaires3?.trim() || '',
          commentaires4: formData.structureCommentaires4?.trim() || '',
          commentaires5: formData.structureCommentaires5?.trim() || '',
          commentaires6: formData.structureCommentaires6?.trim() || ''
        },
        personne1: {
          civilite: formData.civilite?.trim() || '',
          prenom: formData.prenom?.trim() || '',
          nom: formData.nom?.trim() || '',
          prenomNom: formData.prenomNom?.trim() || '',
          fonction: formData.fonction?.trim() || '',
          telDirect: formData.telDirect?.trim() || '',
          telPerso: formData.telPerso?.trim() || '',
          mobile: formData.mobile?.trim() || '',
          mailDirect: formData.mailDirect?.trim() || '',
          mailPerso: formData.mailPerso?.trim() || '',
          fax: formData.fax?.trim() || '',
          site: formData.site?.trim() || '',
          adresse: formData.adresse?.trim() || '',
          suiteAdresse1: formData.suiteAdresse1?.trim() || '',
          codePostal: formData.codePostal?.trim() || '',
          ville: formData.ville?.trim() || '',
          region: formData.region?.trim() || '',
          province: formData.province?.trim() || '',
          pays: formData.pays?.trim() || '',
          commentaires1: formData.commentaires1?.trim() || '',
          commentaires2: formData.commentaires2?.trim() || '',
          commentaires3: formData.commentaires3?.trim() || ''
        },
        personne2: {
          civilite: formData.civilite2?.trim() || '',
          prenom: formData.prenom2?.trim() || '',
          nom: formData.nom2?.trim() || '',
          prenomNom: formData.prenomNom2?.trim() || '',
          fonction: formData.fonction2?.trim() || '',
          telDirect: formData.telDirect2?.trim() || '',
          telPerso: formData.telPerso2?.trim() || '',
          mobile: formData.mobile2?.trim() || '',
          mailDirect: formData.mailDirect2?.trim() || '',
          mailPerso: formData.mailPerso2?.trim() || '',
          fax: formData.fax2?.trim() || '',
          site: formData.site2?.trim() || '',
          adresse: formData.adresse2?.trim() || '',
          suiteAdresse1: formData.suiteAdresse2?.trim() || '',
          codePostal: formData.codePostal2?.trim() || '',
          ville: formData.ville2?.trim() || '',
          region: formData.region2?.trim() || '',
          province: formData.province2?.trim() || '',
          pays: formData.pays2?.trim() || '',
          commentaires1: formData.commentaires12?.trim() || '',
          commentaires2: formData.commentaires22?.trim() || '',
          commentaires3: formData.commentaires32?.trim() || ''
        },
        personne3: {
          civilite: formData.civilite3?.trim() || '',
          prenom: formData.prenom3?.trim() || '',
          nom: formData.nom3?.trim() || '',
          prenomNom: formData.prenomNom3?.trim() || '',
          fonction: formData.fonction3?.trim() || '',
          telDirect: formData.telDirect3?.trim() || '',
          telPerso: formData.telPerso3?.trim() || '',
          mobile: formData.mobile3?.trim() || '',
          mailDirect: formData.mailDirect3?.trim() || '',
          mailPerso: formData.mailPerso3?.trim() || '',
          fax: formData.fax3?.trim() || '',
          site: formData.site3?.trim() || '',
          adresse: formData.adresse3?.trim() || '',
          suiteAdresse1: formData.suiteAdresse3?.trim() || '',
          codePostal: formData.codePostal3?.trim() || '',
          ville: formData.ville3?.trim() || '',
          region: formData.region3?.trim() || '',
          province: formData.province3?.trim() || '',
          pays: formData.pays3?.trim() || '',
          commentaires1: formData.commentaires13?.trim() || '',
          commentaires2: formData.commentaires23?.trim() || '',
          commentaires3: formData.commentaires33?.trim() || ''
        },
        qualification: {
          tags: formData.tags || [],
          client: formData.client || false,
          source: formData.source?.trim() || '',
          createdAt: formData.createdAt,
          updatedAt: new Date()
        },
        diffusion: {
          nomFestival: formData.nomFestival?.trim() || '',
          periodeFestivalMois: formData.periodeFestivalMois?.trim() || '',
          periodeFestivalComplete: formData.periodeFestivalComplete?.trim() || '',
          bouclage: formData.bouclage?.trim() || '',
          commentaires1: formData.diffusionCommentaires1?.trim() || '',
          commentaires2: formData.diffusionCommentaires2?.trim() || '',
          commentaires3: formData.diffusionCommentaires3?.trim() || ''
        },
        salle: {
          nom: formData.salleNom?.trim() || '',
          adresse: formData.salleAdresse?.trim() || '',
          suiteAdresse: formData.salleSuiteAdresse?.trim() || '',
          codePostal: formData.salleCodePostal?.trim() || '',
          ville: formData.salleVille?.trim() || '',
          departement: formData.salleDepartement?.trim() || '',
          region: formData.salleRegion?.trim() || '',
          pays: formData.sallePays?.trim() || '',
          telephone: formData.salleTelephone?.trim() || '',
          jauge1: formData.salleJauge1 ? parseInt(formData.salleJauge1) : null,
          jauge2: formData.salleJauge2 ? parseInt(formData.salleJauge2) : null,
          jauge3: formData.salleJauge3 ? parseInt(formData.salleJauge3) : null,
          ouverture: formData.salleOuverture?.trim() || '',
          profondeur: formData.salleProfondeur?.trim() || '',
          hauteur: formData.salleHauteur?.trim() || ''
        }
      };

      let savedContactId;
      
      if (isNewFromUrl) {
        contact.qualification.createdAt = new Date();
        if (currentOrganization?.id) {
          contact.organizationId = currentOrganization.id;
        }
        const docRef = await addDoc(collection(db, 'contacts'), contact);
        savedContactId = docRef.id;
        toast.success(`${detectedType === 'structure' ? 'Structure' : 'Personne'} créée avec succès !`);
      } else {
        const docRef = doc(db, 'contacts', id);
        await updateDoc(docRef, contact);
        savedContactId = id;
        toast.success(`${detectedType === 'structure' ? 'Structure' : 'Personne'} modifiée avec succès !`);
      }

      // Navigation après succès
      navigate(`/contacts/${savedContactId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire d'annulation
  const handleCancel = () => {
    toast.info('Édition annulée');
    if (isNewFromUrl) {
      navigate('/contacts');
    } else {
      navigate(`/contacts/${id}`);
    }
  };

  // Gestionnaire de suppression
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Confirmation de suppression
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const docRef = doc(db, 'contacts', id);
      await deleteDoc(docRef);
      toast.success('Contact supprimé avec succès');
      navigate('/contacts');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fermeture du modal de suppression
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner message="Chargement du contact..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const pageTitle = isNewFromUrl 
    ? `Nouveau Contact - ${contactType === 'structure' ? 'Structure' : 'Personne'}`
    : 'Modifier Contact';

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSave}>
        <div className={styles.formContainer}>
          {/* Header */}
          <FormHeader
            title={pageTitle}
            icon={<i className={`bi bi-${contactType === 'structure' ? 'building' : 'person-badge'}`}></i>}
            isLoading={isSubmitting}
            roundedTop={true}
            actions={[
              <button 
                key="save"
                type="submit" 
                className={`${styles.tcBtn} ${styles.tcBtnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Enregistrer
                  </>
                )}
              </button>,
              <button 
                key="cancel"
                type="button" 
                className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle"></i>
                Annuler
              </button>,
              ...(isNewFromUrl ? [] : [
                <button 
                  key="delete"
                  type="button" 
                  className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-trash"></i>
                  Supprimer
                </button>
              ])
            ]}
          />

          <div className={styles.sectionBody}>
            {/* Section Structure */}
            <ContactStructureSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Personne 1 */}
            <ContactPersonneSection 
              personneNumber={1}
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Personne 2 */}
            <ContactPersonneSection 
              personneNumber={2}
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Personne 3 */}
            <ContactPersonneSection 
              personneNumber={3}
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Qualification */}
            <ContactQualificationSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
              isEditing={!isNewFromUrl}
            />

            {/* Section Diffusion */}
            <ContactDiffusionSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Salle */}
            <ContactSalleSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />
          </div>
        </div>
      </form>

      {/* Modal de suppression */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le contact"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce contact ?"
        entityName={formData.structureRaisonSociale || `${formData.prenom} ${formData.nom}` || 'Contact'}
        variant="danger"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ContactFormUnified;