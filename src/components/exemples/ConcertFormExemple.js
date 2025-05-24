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
import styles from './ConcertFormExemple.module.css';

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
      <div className={styles.container}>
        <div className={styles.textCenterLoading}>
          <h3 className="tc-h3">Chargement du concert...</h3>
          <p className="tc-text-muted">Veuillez patienter pendant le chargement des données.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      {/* En-tête du formulaire */}
      <div className={styles.header}>
        <h1 className={`tc-h1 ${styles.title}`}>
          {isNewConcert ? 'Nouveau Concert' : `Concert: ${concert.titre || 'Sans titre'}`}
        </h1>
        <span className={`${styles.badge} ${isNewConcert ? styles.infoBadge : styles.successBadge}`}>
          {isNewConcert ? 'Création' : 'Édition'}
        </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Section Informations générales */}
        <div className={styles.section}>
          <h3 className="tc-section-title">
            Informations générales
          </h3>
          
          <div className={styles.field}>
            <label htmlFor="titre" className="tc-form-label">Titre du concert *</label>
            <input
              id="titre"
              type="text"
              className={styles.input}
              value={concert.titre || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, titre: e.target.value }))}
              placeholder="Nom du concert"
            />
            {formErrors.titre && <p className={styles.error}>{formErrors.titre}</p>}
          </div>
          
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="dateConcert" className="tc-form-label">Date du concert *</label>
              <input
                id="dateConcert"
                type="date"
                className={styles.input}
                value={dateConcertFormatted || ''}
                onChange={(e) => setDateConcert(e.target.value)}
              />
              {formErrors.date && <p className={styles.error}>{formErrors.date}</p>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="heureConcert" className="tc-form-label">Heure du concert *</label>
              <input
                id="heureConcert"
                type="time"
                className={styles.input}
                value={heureConcertFormatted || ''}
                onChange={(e) => setHeureConcert(e.target.value)}
              />
              {formErrors.heure && <p className={styles.error}>{formErrors.heure}</p>}
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="description" className="tc-form-label">Description</label>
            <textarea
              id="description"
              className={styles.textarea}
              value={concert.description || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du concert"
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="prixBillet" className="tc-form-label">Prix du billet (€)</label>
            <input
              id="prixBillet"
              type="number"
              min="0"
              step="0.01"
              className={styles.input}
              value={concert.prixBillet || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, prixBillet: Number(e.target.value) }))}
              placeholder="Prix en euros"
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="lienBilletterie" className="tc-form-label">Lien de billetterie</label>
            <input
              id="lienBilletterie"
              type="url"
              className={styles.input}
              value={concert.lienBilletterie || ''}
              onChange={(e) => updateFormData(prev => ({ ...prev, lienBilletterie: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
        
        {/* Section Artiste */}
        <div className={styles.section}>
          <h3 className="tc-section-title">
            Artiste principal
          </h3>
          
          {artiste ? (
            <div className={styles.field}>
              <p><strong>Nom:</strong> {artiste.nom}</p>
              <p><strong>Description:</strong> {artiste.description || 'Aucune description'}</p>
              
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton} ${styles.smallButton}`}
                onClick={() => updateArtiste(null)}
              >
                Changer d'artiste
              </button>
            </div>
          ) : (
            <div className={styles.field}>
              <p>Aucun artiste sélectionné pour ce concert.</p>
              
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton} ${styles.smallButton}`}
                onClick={() => {
                  // Dans une application réelle, ouvrirait un sélecteur d'artistes
                  alert("Cette fonctionnalité ouvrirait un sélecteur d'artistes dans l'application réelle");
                }}
              >
                Sélectionner un artiste
              </button>
            </div>
          )}
          {formErrors.artisteId && <p className={styles.error}>{formErrors.artisteId}</p>}
        </div>
        
        {/* Section Lieu */}
        <div className={styles.section}>
          <h3 className="tc-section-title">
            Lieu du concert
          </h3>
          
          {lieu ? (
            <div className={styles.field}>
              <p><strong>Nom:</strong> {lieu.nom}</p>
              <p><strong>Adresse:</strong> {lieu.adresse || 'Adresse non spécifiée'}</p>
              <p><strong>Capacité:</strong> {lieu.capacite || 'Non spécifiée'}</p>
              
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton} ${styles.smallButton}`}
                onClick={() => updateLieu(null)}
              >
                Changer de lieu
              </button>
            </div>
          ) : (
            <div className={styles.field}>
              <p>Aucun lieu sélectionné pour ce concert.</p>
              
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton} ${styles.smallButton}`}
                onClick={() => {
                  // Dans une application réelle, ouvrirait un sélecteur de lieux
                  alert("Cette fonctionnalité ouvrirait un sélecteur de lieux dans l'application réelle");
                }}
              >
                Sélectionner un lieu
              </button>
            </div>
          )}
          {formErrors.lieuId && <p className={styles.error}>{formErrors.lieuId}</p>}
        </div>
        
        {/* Section Styles musicaux */}
        <div className={styles.section}>
          <h3 className="tc-section-title">
            Styles musicaux
          </h3>
          
          <div className={styles.field}>
            <div className={styles.stylesBadgeContainer}>
              {stylesMusicaux.length === 0 ? (
                <p>Aucun style musical sélectionné</p>
              ) : (
                stylesMusicaux.map((style, index) => (
                  <div key={index} className={styles.styleBadge}>
                    {style}
                    <button
                      type="button"
                      onClick={() => removeStyleMusical(index)}
                      className={styles.styleBadgeRemove}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton} ${styles.smallButton}`}
              onClick={handleAddStyleMusical}
            >
              Ajouter un style
            </button>
          </div>
        </div>
        
        {/* Section Affiche */}
        <div className={styles.section}>
          <h3 className="tc-section-title">
            Affiche du concert
          </h3>
          
          {concert.imageAfficheUrl ? (
            <div className={styles.field}>
              <img
                src={concert.imageAfficheUrl}
                alt="Affiche du concert"
                className={styles.imagePreview}
              />
              
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton} ${styles.smallButton}`}
                onClick={() => updateImageAffiche(null)}
              >
                Supprimer l'affiche
              </button>
            </div>
          ) : (
            <div className={styles.field}>
              <p>Aucune affiche téléchargée.</p>
              
              <input
                id="imageAffiche"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.hiddenInput}
              />
              <label
                htmlFor="imageAffiche"
                className={`${styles.button} ${styles.primaryButton} ${styles.smallButton} ${styles.fileLabel}`}
              >
                Télécharger une affiche
              </label>
            </div>
          )}
        </div>
        
        {/* Section Partenaires */}
        <div className={styles.section}>
          <h3 className="tc-section-title">
            Partenaires
          </h3>
          
          <div className={styles.field}>
            <button
              type="button"
              className={`${styles.button} ${styles.primaryButton} ${styles.smallButton}`}
              onClick={handleAddPartenaire}
            >
              Ajouter un partenaire
            </button>
            
            {partenaires.length === 0 ? (
              <p>Aucun partenaire ajouté.</p>
            ) : (
              partenaires.map((partenaire, index) => (
                <div key={index} className={styles.partenaireBox}>
                  <div className={styles.field}>
                    <label htmlFor={`partenaire-${index}-nom`} className="tc-form-label">Nom *</label>
                    <input
                      id={`partenaire-${index}-nom`}
                      type="text"
                      className={styles.input}
                      value={partenaire.nom || ''}
                      onChange={(e) => updatePartenaire(index, 'nom', e.target.value)}
                      placeholder="Nom du partenaire"
                    />
                  </div>
                  
                  <div className={styles.field}>
                    <label htmlFor={`partenaire-${index}-type`} className="tc-form-label">Type de partenariat</label>
                    <select
                      id={`partenaire-${index}-type`}
                      className={styles.select}
                      value={partenaire.typePartenariat || 'financier'}
                      onChange={(e) => updatePartenaire(index, 'typePartenariat', e.target.value)}
                    >
                      <option value="financier">Financier</option>
                      <option value="technique">Technique</option>
                      <option value="media">Média</option>
                      <option value="logistique">Logistique</option>
                    </select>
                  </div>
                  
                  <div className={styles.field}>
                    <label htmlFor={`partenaire-${index}-site`} className="tc-form-label">Site web</label>
                    <input
                      id={`partenaire-${index}-site`}
                      type="url"
                      className={styles.input}
                      value={partenaire.site || ''}
                      onChange={(e) => updatePartenaire(index, 'site', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <button
                    type="button"
                    className={`${styles.button} ${styles.dangerButton}`}
                    onClick={() => removePartenaire(index)}
                  >
                    Supprimer ce partenaire
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Boutons d'actions */}
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
            {isSaving ? 'Enregistrement...' : isNewConcert ? 'Créer le concert' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcertFormExemple;