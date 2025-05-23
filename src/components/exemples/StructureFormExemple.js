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

// Styles communs pour le formulaire (réutilisés des autres exemples)
const formStyles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  section: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  field: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    minHeight: '80px'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: '#fff'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px'
  },
  button: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: 'white'
  },
  secondaryButton: {
    backgroundColor: '#e9e9e9',
    color: '#333'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#34495e',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px'
  },
  error: {
    color: '#e74c3c',
    fontSize: '0.85rem',
    marginTop: '5px'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  successBadge: {
    backgroundColor: '#2ecc71',
    color: 'white'
  },
  infoBadge: {
    backgroundColor: '#3498db',
    color: 'white'
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  }
};

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
      <div style={formStyles.container}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h3>Chargement de la structure...</h3>
          <p>Veuillez patienter pendant le chargement des données.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={formStyles.container}>
      {/* En-tête du formulaire */}
      <div style={formStyles.header}>
        <h1 style={formStyles.title}>
          {isNewStructure ? 'Nouvelle Structure' : `Modifier la Structure: ${structure.nom || ''}`}
        </h1>
        <span style={{
          ...formStyles.badge,
          ...isNewStructure ? formStyles.infoBadge : formStyles.successBadge
        }}>
          {isNewStructure ? 'Création' : 'Édition'}
        </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Informations principales */}
        <div style={formStyles.section}>
          <h3 style={formStyles.sectionTitle}>Informations principales</h3>
          
          <div style={formStyles.field}>
            <label htmlFor="nom" style={formStyles.label}>Nom de la structure *</label>
            <input
              id="nom"
              type="text"
              style={formStyles.input}
              value={structure.nom || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, nom: e.target.value }))}
              required
              placeholder="Nom d'usage de la structure"
            />
            {formErrors.nom && <p style={formStyles.error}>{formErrors.nom}</p>}
          </div>
          
          <div style={formStyles.field}>
            <label htmlFor="raisonSociale" style={formStyles.label}>Raison sociale *</label>
            <input
              id="raisonSociale"
              type="text"
              style={formStyles.input}
              value={structure.raisonSociale || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, raisonSociale: e.target.value }))}
              required
              placeholder="Raison sociale officielle"
            />
            {formErrors.raisonSociale && <p style={formStyles.error}>{formErrors.raisonSociale}</p>}
          </div>
          
          <div style={formStyles.twoColumns}>
            <div style={formStyles.field}>
              <label htmlFor="siret" style={formStyles.label}>SIRET</label>
              <input
                id="siret"
                type="text"
                style={formStyles.input}
                value={structure.siret || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, siret: e.target.value }))}
                placeholder="14 chiffres"
              />
              {formErrors.siret && <p style={formStyles.error}>{formErrors.siret}</p>}
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="type" style={formStyles.label}>Type de structure</label>
              <select
                id="type"
                style={formStyles.select}
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
          
          <div style={formStyles.field}>
            <label htmlFor="tva" style={formStyles.label}>Numéro TVA</label>
            <input
              id="tva"
              type="text"
              style={formStyles.input}
              value={structure.tva || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, tva: e.target.value }))}
              placeholder="Numéro TVA intracommunautaire"
            />
          </div>
        </div>
        
        {/* Coordonnées */}
        <div style={formStyles.section}>
          <h3 style={formStyles.sectionTitle}>Coordonnées</h3>
          
          <div style={formStyles.field}>
            <label htmlFor="adresse" style={formStyles.label}>Adresse</label>
            <input
              id="adresse"
              type="text"
              style={formStyles.input}
              value={structure.adresse || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, adresse: e.target.value }))}
              placeholder="Numéro et nom de rue"
            />
          </div>
          
          <div style={formStyles.twoColumns}>
            <div style={formStyles.field}>
              <label htmlFor="codePostal" style={formStyles.label}>Code postal</label>
              <input
                id="codePostal"
                type="text"
                style={formStyles.input}
                value={structure.codePostal || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, codePostal: e.target.value }))}
                placeholder="Code postal"
              />
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="ville" style={formStyles.label}>Ville</label>
              <input
                id="ville"
                type="text"
                style={formStyles.input}
                value={structure.ville || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, ville: e.target.value }))}
                placeholder="Ville"
              />
            </div>
          </div>
          
          <div style={formStyles.field}>
            <label htmlFor="pays" style={formStyles.label}>Pays</label>
            <input
              id="pays"
              type="text"
              style={formStyles.input}
              value={structure.pays || 'France'}
              onChange={(e) => updateFormData(prev => ({ ...prev, pays: e.target.value }))}
              placeholder="Pays"
            />
          </div>
          
          {/* Affichage de l'adresse formatée */}
          {getFormattedAddress() && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f0f7fb', 
              borderRadius: '4px',
              marginTop: '10px',
              marginBottom: '10px'
            }}>
              <strong>Adresse complète:</strong> {getFormattedAddress()}
            </div>
          )}
          
          <div style={formStyles.twoColumns}>
            <div style={formStyles.field}>
              <label htmlFor="email" style={formStyles.label}>Email</label>
              <input
                id="email"
                type="email"
                style={formStyles.input}
                value={structure.email || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email principal"
              />
              {formErrors.email && <p style={formStyles.error}>{formErrors.email}</p>}
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="telephone" style={formStyles.label}>Téléphone</label>
              <input
                id="telephone"
                type="tel"
                style={formStyles.input}
                value={structure.telephone || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, telephone: e.target.value }))}
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>
          
          <div style={formStyles.field}>
            <label htmlFor="siteWeb" style={formStyles.label}>Site web</label>
            <input
              id="siteWeb"
              type="url"
              style={formStyles.input}
              value={structure.siteWeb || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, siteWeb: e.target.value }))}
              placeholder="https://www.exemple.com"
            />
          </div>
        </div>
        
        {/* Contact principal */}
        <div style={formStyles.section}>
          <h3 style={formStyles.sectionTitle}>Contact principal</h3>
          
          <div style={formStyles.twoColumns}>
            <div style={formStyles.field}>
              <label htmlFor="contactNom" style={formStyles.label}>Nom du contact</label>
              <input
                id="contactNom"
                type="text"
                style={formStyles.input}
                value={contact?.nom || ''}
                onChange={(e) => updateContactInfo('nom', e.target.value)}
                placeholder="Nom du contact principal"
              />
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="contactFonction" style={formStyles.label}>Fonction</label>
              <input
                id="contactFonction"
                type="text"
                style={formStyles.input}
                value={contact?.fonction || ''}
                onChange={(e) => updateContactInfo('fonction', e.target.value)}
                placeholder="Fonction dans la structure"
              />
            </div>
          </div>
          
          <div style={formStyles.twoColumns}>
            <div style={formStyles.field}>
              <label htmlFor="contactEmail" style={formStyles.label}>Email du contact</label>
              <input
                id="contactEmail"
                type="email"
                style={formStyles.input}
                value={contact?.email || ''}
                onChange={(e) => updateContactInfo('email', e.target.value)}
                placeholder="Email du contact"
              />
              {formErrors['contact.email'] && <p style={formStyles.error}>{formErrors['contact.email']}</p>}
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="contactTelephone" style={formStyles.label}>Téléphone du contact</label>
              <input
                id="contactTelephone"
                type="tel"
                style={formStyles.input}
                value={contact?.telephone || ''}
                onChange={(e) => updateContactInfo('telephone', e.target.value)}
                placeholder="Téléphone direct"
              />
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div style={formStyles.section}>
          <h3 style={formStyles.sectionTitle}>Notes</h3>
          
          <div style={formStyles.field}>
            <label htmlFor="notes" style={formStyles.label}>Notes internes</label>
            <textarea
              id="notes"
              style={formStyles.textarea}
              value={structure.notes || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes internes sur la structure"
              rows={5}
            />
          </div>
        </div>
        
        {/* Boutons d'actions */}
        <div style={formStyles.buttonGroup}>
          <button
            type="button"
            style={{ ...formStyles.button, ...formStyles.secondaryButton }}
            onClick={handleCancel}
          >
            Annuler
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              style={{ ...formStyles.button, ...formStyles.secondaryButton }}
              onClick={resetForm}
            >
              Réinitialiser
            </button>
            
            <button
              type="submit"
              style={{ ...formStyles.button, ...formStyles.primaryButton }}
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