/**
 * Composant exemple démontrant l'utilisation de useStructureForm
 * 
 * Ce composant sert d'exemple pour illustrer comment utiliser le hook optimisé
 * pour les formulaires de structures, conformément au plan de dépréciation
 * qui prévoit la suppression des hooks spécifiques d'ici novembre 2025.
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { useStructureForm } from '@/hooks/structures';
import styles from './StructureFormExemple.module.css';

/**
 * Composant exemple démontrant l'utilisation de useStructureForm
 */
const StructureFormExemple = () => {
  const { id } = useParams();
  
  // Utilisation du hook optimisé
  const {
    // États du formulaire
    formData,
    formErrors,
    isLoading,
    isSaving,
    
    // Fonctions de modification des données
    updateFormData,
    updateContactInfo,
    resetForm,
    
    // Fonctions de sauvegarde et validation
    saveForm,
    validateAndSave,
    validateHtmlForm,
    
    // Propriétés spécifiques à la structure (raccourcis pour une meilleure DX)
    isNewStructure,
    structure,
    contact,
    getFormattedAddress,
    
    // Gestion des erreurs et de l'annulation
    handleCancel
  } = useStructureForm(id);
  
  // Gestion du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du formulaire HTML avant de sauvegarder
    if (!validateHtmlForm(e.target)) {
      return;
    }
    
    await validateAndSave();
  };
  
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.textCenterLoading}>
          <h3>Chargement de la structure...</h3>
          <p>Veuillez patienter pendant le chargement des données.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      {/* En-tête du formulaire */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isNewStructure ? 'Nouvelle Structure' : `Modifier la Structure: ${structure.nom || ''}`}
        </h1>
        <span className={`${styles.badge} ${isNewStructure ? styles.infoBadge : styles.successBadge}`}>
          {isNewStructure ? 'Création' : 'Édition'}
        </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Informations principales */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Informations principales</h3>
          
          <div className={styles.field}>
            <label htmlFor="nom" className={styles.label}>Nom de la structure *</label>
            <input
              id="nom"
              type="text"
              className={styles.input}
              value={structure.nom || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, nom: e.target.value }))}
              required
              placeholder="Nom d'usage de la structure"
            />
            {formErrors.nom && <p className={styles.error}>{formErrors.nom}</p>}
          </div>
          
          <div className={styles.field}>
            <label htmlFor="raisonSociale" className={styles.label}>Raison sociale *</label>
            <input
              id="raisonSociale"
              type="text"
              className={styles.input}
              value={structure.raisonSociale || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, raisonSociale: e.target.value }))}
              required
              placeholder="Raison sociale officielle"
            />
            {formErrors.raisonSociale && <p className={styles.error}>{formErrors.raisonSociale}</p>}
          </div>
          
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="siret" className={styles.label}>SIRET</label>
              <input
                id="siret"
                type="text"
                className={styles.input}
                value={structure.siret || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, siret: e.target.value }))}
                placeholder="14 chiffres"
              />
              {formErrors.siret && <p className={styles.error}>{formErrors.siret}</p>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="type" className={styles.label}>Type de structure</label>
              <select
                id="type"
                className={styles.select}
                value={structure.type || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Sélectionner un type</option>
                <option value="association">Association</option>
                <option value="sarl">SARL</option>
                <option value="sas">SAS</option>
                <option value="eurl">EURL</option>
                <option value="collectivite">Collectivité</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="tva" className={styles.label}>Numéro TVA</label>
            <input
              id="tva"
              type="text"
              className={styles.input}
              value={structure.tva || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, tva: e.target.value }))}
              placeholder="Numéro TVA intracommunautaire"
            />
          </div>
        </div>
        
        {/* Coordonnées */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Coordonnées</h3>
          
          <div className={styles.field}>
            <label htmlFor="adresse" className={styles.label}>Adresse</label>
            <input
              id="adresse"
              type="text"
              className={styles.input}
              value={structure.adresse || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, adresse: e.target.value }))}
              placeholder="Numéro et nom de rue"
            />
          </div>
          
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="codePostal" className={styles.label}>Code postal</label>
              <input
                id="codePostal"
                type="text"
                className={styles.input}
                value={structure.codePostal || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, codePostal: e.target.value }))}
                placeholder="Code postal"
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="ville" className={styles.label}>Ville</label>
              <input
                id="ville"
                type="text"
                className={styles.input}
                value={structure.ville || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, ville: e.target.value }))}
                placeholder="Ville"
              />
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="pays" className={styles.label}>Pays</label>
            <input
              id="pays"
              type="text"
              className={styles.input}
              value={structure.pays || 'France'}
              onChange={(e) => updateFormData(prev => ({ ...prev, pays: e.target.value }))}
              placeholder="Pays"
            />
          </div>
          
          {/* Affichage de l'adresse formatée */}
          {getFormattedAddress() && (
            <div className={styles.formattedAddress}>
              <strong>Adresse complète:</strong> {getFormattedAddress()}
            </div>
          )}
          
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={structure.email || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email principal"
              />
              {formErrors.email && <p className={styles.error}>{formErrors.email}</p>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="telephone" className={styles.label}>Téléphone</label>
              <input
                id="telephone"
                type="tel"
                className={styles.input}
                value={structure.telephone || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, telephone: e.target.value }))}
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="siteWeb" className={styles.label}>Site web</label>
            <input
              id="siteWeb"
              type="url"
              className={styles.input}
              value={structure.siteWeb || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, siteWeb: e.target.value }))}
              placeholder="https://www.exemple.com"
            />
          </div>
        </div>
        
        {/* Contact principal */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Contact principal</h3>
          
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="contactNom" className={styles.label}>Nom du contact</label>
              <input
                id="contactNom"
                type="text"
                className={styles.input}
                value={contact?.nom || ''}
                onChange={(e) => updateContactInfo('nom', e.target.value)}
                placeholder="Nom du contact principal"
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="contactFonction" className={styles.label}>Fonction</label>
              <input
                id="contactFonction"
                type="text"
                className={styles.input}
                value={contact?.fonction || ''}
                onChange={(e) => updateContactInfo('fonction', e.target.value)}
                placeholder="Fonction dans la structure"
              />
            </div>
          </div>
          
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="contactEmail" className={styles.label}>Email du contact</label>
              <input
                id="contactEmail"
                type="email"
                className={styles.input}
                value={contact?.email || ''}
                onChange={(e) => updateContactInfo('email', e.target.value)}
                placeholder="Email du contact"
              />
              {formErrors['contact.email'] && <p className={styles.error}>{formErrors['contact.email']}</p>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="contactTelephone" className={styles.label}>Téléphone du contact</label>
              <input
                id="contactTelephone"
                type="tel"
                className={styles.input}
                value={contact?.telephone || ''}
                onChange={(e) => updateContactInfo('telephone', e.target.value)}
                placeholder="Téléphone direct"
              />
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notes</h3>
          
          <div className={styles.field}>
            <label htmlFor="notes" className={styles.label}>Notes internes</label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={structure.notes || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes internes sur la structure"
              rows={5}
            />
          </div>
        </div>
        
        {/* Boutons d'actions */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={handleCancel}
          >
            Annuler
          </button>
          
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={resetForm}
            >
              Réinitialiser
            </button>
            
            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement...' : isNewStructure ? 'Créer la structure' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StructureFormExemple;