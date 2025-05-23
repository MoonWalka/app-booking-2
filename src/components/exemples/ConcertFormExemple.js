/**
 * Composant exemple démontrant l'utilisation de useConcertForm
 * 
 * Ce composant sert d'exemple pour illustrer comment utiliser le hook optimisé
 * pour les formulaires de concerts, conformément au plan de dépréciation
 * qui prévoit la suppression des hooks spécifiques d'ici novembre 2025.
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConcertForm } from '@/hooks/concerts';
import { format } from 'date-fns';
import '@styles/index.css';; // Importer les styles typographiques standards

// Styles communs pour le formulaire
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
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
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
  }
};

/**
 * Composant exemple démontrant l'utilisation de useConcertForm
 */
const ConcertFormExemple = () => {
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
    resetForm,
    
    // Fonctions de sauvegarde
    saveForm,
    validateAndSave,
    
    // Propriétés spécifiques au concert
    isNewConcert,
    concert,
    
    // Fonctions spécifiques au concert
    setDateConcert,
    setHeureConcert,
    dateConcertFormatted,
    heureConcertFormatted,
    updateImageAffiche,
    
    // Gestion de l'artiste
    artiste,
    updateArtiste,
    
    // Gestion du lieu
    lieu,
    updateLieu,
    
    // Gestion des styles musicaux
    stylesMusicaux,
    addStyleMusical,
    removeStyleMusical,
    
    // Gestion des partenaires
    partenaires,
    addPartenaire,
    removePartenaire,
    updatePartenaire
  } = useConcertForm(id);
  
  // Fonction pour gérer les soumissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    await validateAndSave();
  };
  
  // Fonction pour gérer l'upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dans une application réelle, cette fonction traiterait l'upload
      // et récupérerait l'URL de l'image téléchargée
      const mockUploadedUrl = URL.createObjectURL(file);
      updateImageAffiche(mockUploadedUrl);
      
      // Note: Dans une application réelle, vous utiliseriez plutôt:
      // updateImageAffiche(file);
      // Et le hook gérerait l'upload via Firebase Storage
    }
  };
  
  // Fonction pour ajouter un partenaire
  const handleAddPartenaire = () => {
    addPartenaire({ nom: '', typePartenariat: 'financier', logoUrl: '', site: '' });
  };
  
  // Fonction pour ajouter un style musical
  const handleAddStyleMusical = () => {
    const newStyle = prompt('Ajouter un style musical');
    if (newStyle && newStyle.trim()) {
      addStyleMusical(newStyle.trim());
    }
  };
  
  if (isLoading) {
    return (
      <div style={formStyles.container}>
        <div className="tc-text-center" style={{ padding: '40px 0' }}>
          <h3 className="tc-h3">Chargement du concert...</h3>
          <p>Veuillez patienter pendant le chargement des données.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={formStyles.container}>
      {/* En-tête du formulaire */}
      <div style={formStyles.header}>
        <h1 className="tc-h1" style={{ margin: 0 }}>
          {isNewConcert ? 'Nouveau Concert' : `Concert: ${concert.titre || 'Sans titre'}`}
        </h1>
        <span style={{
          ...formStyles.badge,
          ...isNewConcert ? formStyles.infoBadge : formStyles.successBadge
        }}>
          {isNewConcert ? 'Création' : 'Édition'}
        </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Section Informations générales */}
        <div style={formStyles.section}>
          <h3 className="tc-section-title">
            Informations générales
          </h3>
          
          <div style={formStyles.field}>
            <label htmlFor="titre" className="tc-form-label">Titre du concert *</label>
            <input
              id="titre"
              type="text"
              style={formStyles.input}
              value={concert.titre || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, titre: e.target.value }))}
              placeholder="Titre du concert"
            />
            {formErrors.titre && <p className="tc-error-text">{formErrors.titre}</p>}
          </div>
          
          <div style={formStyles.twoColumns}>
            <div style={formStyles.field}>
              <label htmlFor="dateConcert" className="tc-form-label">Date du concert *</label>
              <input
                id="dateConcert"
                type="date"
                style={formStyles.input}
                value={dateConcertFormatted || ''}
                onChange={(e) => setDateConcert(e.target.value)}
              />
              {formErrors.date && <p className="tc-error-text">{formErrors.date}</p>}
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="heureConcert" className="tc-form-label">Heure du concert *</label>
              <input
                id="heureConcert"
                type="time"
                style={formStyles.input}
                value={heureConcertFormatted || ''}
                onChange={(e) => setHeureConcert(e.target.value)}
              />
              {formErrors.heure && <p className="tc-error-text">{formErrors.heure}</p>}
            </div>
          </div>
          
          <div style={formStyles.field}>
            <label htmlFor="description" className="tc-form-label">Description</label>
            <textarea
              id="description"
              style={formStyles.textarea}
              value={concert.description || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du concert"
              rows={4}
            />
          </div>
          
          <div style={formStyles.field}>
            <label htmlFor="prixBillet" className="tc-form-label">Prix du billet (€)</label>
            <input
              id="prixBillet"
              type="number"
              min="0"
              step="0.01"
              style={formStyles.input}
              value={concert.prixBillet || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, prixBillet: Number(e.target.value) }))}
              placeholder="Prix du billet"
            />
          </div>
          
          <div style={formStyles.field}>
            <label htmlFor="lienBilletterie" className="tc-form-label">Lien de billetterie</label>
            <input
              id="lienBilletterie"
              type="url"
              style={formStyles.input}
              value={concert.lienBilletterie || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, lienBilletterie: e.target.value }))}
              placeholder="https://billetterie.example.com"
            />
          </div>
        </div>
        
        {/* Section Artiste */}
        <div style={formStyles.section}>
          <h3 className="tc-section-title">
            Artiste principal
          </h3>
          
          {artiste ? (
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Nom:</strong> {artiste.nom}</p>
              <p><strong>Description:</strong> {artiste.description || 'Aucune description'}</p>
              
              <button
                type="button"
                style={{
                  ...formStyles.button,
                  ...formStyles.secondaryButton,
                  padding: '5px 10px',
                  marginTop: '10px'
                }}
                onClick={() => updateArtiste(null)}
              >
                Changer d'artiste
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '15px' }}>
              <p>Aucun artiste sélectionné pour ce concert.</p>
              
              <button
                type="button"
                style={{
                  ...formStyles.button,
                  ...formStyles.primaryButton,
                  padding: '5px 10px',
                  marginTop: '10px'
                }}
                onClick={() => {
                  // Dans une application réelle, ouvrirait un sélecteur d'artistes
                  alert("Cette fonctionnalité ouvrirait un sélecteur d'artistes dans l'application réelle");
                }}
              >
                Sélectionner un artiste
              </button>
            </div>
          )}
          {formErrors.artisteId && <p className="tc-error-text">{formErrors.artisteId}</p>}
        </div>
        
        {/* Section Lieu */}
        <div style={formStyles.section}>
          <h3 className="tc-section-title">
            Lieu du concert
          </h3>
          
          {lieu ? (
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Nom:</strong> {lieu.nom}</p>
              <p><strong>Adresse:</strong> {lieu.adresse || 'Adresse non spécifiée'}</p>
              {lieu.capacite && <p><strong>Capacité:</strong> {lieu.capacite} personnes</p>}
              
              <button
                type="button"
                style={{
                  ...formStyles.button,
                  ...formStyles.secondaryButton,
                  padding: '5px 10px',
                  marginTop: '10px'
                }}
                onClick={() => updateLieu(null)}
              >
                Changer de lieu
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '15px' }}>
              <p>Aucun lieu sélectionné pour ce concert.</p>
              
              <button
                type="button"
                style={{
                  ...formStyles.button,
                  ...formStyles.primaryButton,
                  padding: '5px 10px',
                  marginTop: '10px'
                }}
                onClick={() => {
                  // Dans une application réelle, ouvrirait un sélecteur de lieux
                  alert("Cette fonctionnalité ouvrirait un sélecteur de lieux dans l'application réelle");
                }}
              >
                Sélectionner un lieu
              </button>
            </div>
          )}
          {formErrors.lieuId && <p className="tc-error-text">{formErrors.lieuId}</p>}
        </div>
        
        {/* Section Styles musicaux */}
        <div style={formStyles.section}>
          <h3 className="tc-section-title">
            Styles musicaux
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {stylesMusicaux.length === 0 ? (
                <p>Aucun style musical sélectionné</p>
              ) : (
                stylesMusicaux.map((style, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {style}
                    <button
                      type="button"
                      onClick={() => removeStyleMusical(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        padding: '0 0 0 5px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button
              type="button"
              style={{
                ...formStyles.button,
                ...formStyles.secondaryButton,
                padding: '5px 10px'
              }}
              onClick={handleAddStyleMusical}
            >
              Ajouter un style musical
            </button>
          </div>
        </div>
        
        {/* Section Affiche */}
        <div style={formStyles.section}>
          <h3 className="tc-section-title">
            Affiche du concert
          </h3>
          
          {concert.imageAfficheUrl ? (
            <div style={{ marginBottom: '15px' }}>
              <img
                src={concert.imageAfficheUrl}
                alt="Affiche du concert"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  display: 'block',
                  marginBottom: '10px'
                }}
              />
              
              <button
                type="button"
                style={{
                  ...formStyles.button,
                  ...formStyles.secondaryButton,
                  padding: '5px 10px',
                  marginTop: '10px'
                }}
                onClick={() => updateImageAffiche(null)}
              >
                Supprimer l'affiche
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '15px' }}>
              <p>Aucune affiche téléchargée.</p>
              
              <input
                type="file"
                id="imageAffiche"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="imageAffiche"
                style={{
                  ...formStyles.button,
                  ...formStyles.primaryButton,
                  padding: '5px 10px',
                  marginTop: '10px',
                  display: 'inline-block',
                  cursor: 'pointer'
                }}
              >
                Télécharger une affiche
              </label>
            </div>
          )}
        </div>
        
        {/* Section Partenaires */}
        <div style={formStyles.section}>
          <h3 className="tc-section-title">
            Partenaires
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              style={{
                ...formStyles.button,
                ...formStyles.primaryButton,
                padding: '5px 10px',
                marginBottom: '15px'
              }}
              onClick={handleAddPartenaire}
            >
              Ajouter un partenaire
            </button>
            
            {partenaires.length === 0 ? (
              <p>Aucun partenaire ajouté</p>
            ) : (
              partenaires.map((partenaire, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    border: '1px solid #ddd'
                  }}
                >
                  <div style={formStyles.field}>
                    <label htmlFor={`partenaire-${index}-nom`} className="tc-form-label">Nom *</label>
                    <input
                      id={`partenaire-${index}-nom`}
                      type="text"
                      style={formStyles.input}
                      value={partenaire.nom || ''}
                      onChange={(e) => updatePartenaire(index, 'nom', e.target.value)}
                      placeholder="Nom du partenaire"
                    />
                  </div>
                  
                  <div style={formStyles.field}>
                    <label htmlFor={`partenaire-${index}-type`} className="tc-form-label">Type de partenariat</label>
                    <select
                      id={`partenaire-${index}-type`}
                      style={formStyles.select}
                      value={partenaire.typePartenariat || 'financier'}
                      onChange={(e) => updatePartenaire(index, 'typePartenariat', e.target.value)}
                    >
                      <option value="financier">Financier</option>
                      <option value="materiel">Matériel</option>
                      <option value="communication">Communication</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  
                  <div style={formStyles.field}>
                    <label htmlFor={`partenaire-${index}-site`} className="tc-form-label">Site web</label>
                    <input
                      id={`partenaire-${index}-site`}
                      type="url"
                      style={formStyles.input}
                      value={partenaire.site || ''}
                      onChange={(e) => updatePartenaire(index, 'site', e.target.value)}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  
                  <button
                    type="button"
                    style={{
                      ...formStyles.button,
                      backgroundColor: '#e74c3c',
                      color: 'white'
                    }}
                    onClick={() => removePartenaire(index)}
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Boutons d'actions */}
        <div style={formStyles.buttonGroup}>
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
            {isSaving ? 'Enregistrement...' : isNewConcert ? 'Créer le concert' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcertFormExemple;