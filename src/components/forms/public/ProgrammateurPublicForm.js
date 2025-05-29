import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import FormField from '@/components/ui/FormField';
import styles from './ProgrammateurPublicForm.module.css';

/**
 * Formulaire public simple pour les programmateurs
 * Permet aux programmateurs de soumettre leurs informations via un lien public
 */
const ProgrammateurPublicForm = ({ 
  token, 
  concertId, 
  formLinkId, 
  initialLieuData, 
  onSubmitSuccess 
}) => {
  const [formData, setFormData] = useState({
    // Contact
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: '',
    
    // Structure  
    structure: '',
    structureType: '',
    structureAdresse: '',
    structureCodePostal: '',
    structureVille: '',
    structurePays: 'France',
    siret: '',
    tva: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Gestionnaire de changement pour les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation simple
  const validateForm = () => {
    const errors = [];
    
    if (!formData.nom.trim()) errors.push('Le nom est requis');
    if (!formData.email.trim()) errors.push('L\'email est requis');
    if (!formData.structure.trim()) errors.push('La raison sociale est requise');
    
    // Validation email basique
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }
    
    return errors;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validation
      const errors = validateForm();
      if (errors.length > 0) {
        setSubmitError(errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      // Créer la soumission dans formSubmissions avec la structure attendue
      const submissionData = {
        concertId,
        formLinkId,
        token,
        
        // Données du programmateur dans le format attendu par FormValidationInterface
        programmateurData: {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          fonction: formData.fonction,
          
          // Structure en format imbriqué pour la validation
          structure: {
            raisonSociale: formData.structure,
            type: formData.structureType,
            adresse: formData.structureAdresse,
            codePostal: formData.structureCodePostal,
            ville: formData.structureVille,
            pays: formData.structurePays,
            siret: formData.siret,
            tva: formData.tva
          }
        },
        
        // Métadonnées
        submittedAt: serverTimestamp(),
        status: 'submitted',
        validated: false
      };

      // Sauvegarder la soumission
      const submissionRef = await addDoc(collection(db, 'formSubmissions'), submissionData);
      
      // Marquer le lien comme complété
      await updateDoc(doc(db, 'formLinks', formLinkId), {
        completed: true,
        completedAt: serverTimestamp(),
        submissionId: submissionRef.id
      });

      console.log('Formulaire soumis avec succès:', submissionRef.id);
      
      // Callback de succès
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitError('Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tc-form-public">
      {submitError && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {submitError}
        </div>
      )}

      {/* Section Contact */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Informations de contact</h4>
        
        <div className="row">
          <div className="col-md-6">
            <FormField
              label="Nom *"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Votre nom"
            />
          </div>
          
          <div className="col-md-6">
            <FormField
              label="Prénom"
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Votre prénom"
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <FormField
              label="Email *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@exemple.com"
            />
          </div>
          
          <div className="col-md-6">
            <FormField
              label="Téléphone"
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>
        
        <FormField
          label="Fonction"
          type="text"
          name="fonction"
          value={formData.fonction}
          onChange={handleChange}
          placeholder="Ex: Directeur artistique"
        />
      </div>

      {/* Section Structure */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Informations de la structure</h4>
        
        <div className="row">
          <div className="col-md-8">
            <FormField
              label="Raison sociale *"
              type="text"
              name="structure"
              value={formData.structure}
              onChange={handleChange}
              required
              placeholder="Nom de votre structure"
            />
          </div>
          
          <div className="col-md-4">
            <FormField
              label="Type"
              as="select"
              name="structureType"
              value={formData.structureType}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              <option value="association">Association</option>
              <option value="sarl">SARL</option>
              <option value="sas">SAS</option>
              <option value="collectivite">Collectivité</option>
              <option value="autre">Autre</option>
            </FormField>
          </div>
        </div>
        
        <FormField
          label="Adresse"
          type="text"
          name="structureAdresse"
          value={formData.structureAdresse}
          onChange={handleChange}
          placeholder="Adresse de la structure"
        />
        
        <div className="row">
          <div className="col-md-4">
            <FormField
              label="Code postal"
              type="text"
              name="structureCodePostal"
              value={formData.structureCodePostal}
              onChange={handleChange}
              placeholder="75001"
            />
          </div>
          
          <div className="col-md-4">
            <FormField
              label="Ville"
              type="text"
              name="structureVille"
              value={formData.structureVille}
              onChange={handleChange}
              placeholder="Paris"
            />
          </div>
          
          <div className="col-md-4">
            <FormField
              label="Pays"
              type="text"
              name="structurePays"
              value={formData.structurePays}
              onChange={handleChange}
              placeholder="France"
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <FormField
              label="SIRET"
              type="text"
              name="siret"
              value={formData.siret}
              onChange={handleChange}
              placeholder="12345678901234"
              maxLength="14"
            />
          </div>
          
          <div className="col-md-6">
            <FormField
              label="N° TVA"
              type="text"
              name="tva"
              value={formData.tva}
              onChange={handleChange}
              placeholder="FR12345678901"
            />
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
      <div className={styles.submitButton}>
        <button 
          type="submit" 
          className="tc-btn-submit-public"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Envoi en cours...
            </>
          ) : (
            'Envoyer le formulaire'
          )}
        </button>
      </div>

      {/* Mention RGPD déjà affichée par PublicFormContainer */}
    </form>
  );
};

export default ProgrammateurPublicForm; 