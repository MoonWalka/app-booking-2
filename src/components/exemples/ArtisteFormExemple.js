/**
 * Composant exemple démontrant l'utilisation de useArtisteForm
 * 
 * Ce composant montre comment utiliser le hook optimisé useArtisteForm
 * qui représente l'approche recommandée utilisant directement les hooks génériques
 * conformément au plan de dépréciation officiel.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArtisteForm } from '@/hooks/artistes';
import Card from '@/components/ui/Card';
import '@styles/index.css';
import Button from '@ui/Button';

/**
 * Composant pour le formulaire d'artiste optimisé
 * Utilise directement useArtisteForm
 */
const ArtisteFormExemple = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Utilisation du hook optimisé
  const {
    // États du formulaire
    formData,
    formErrors,
    isSubmitting,
    isLoading,
    
    // Opérations CRUD
    updateFormData,
    saveForm,
    resetForm,
    
    // Fonctionnalités spécifiques aux artistes
    isNewArtiste,
    membres,
    ajouterMembre,
    supprimerMembre,
    updateContact,
    
    // Navigation par étapes
    etapeActuelle,
    etapes,
    goToNextStep,
    goToPreviousStep,
    setEtapeActuelle,
    
    // Raccourcis DX
    artiste,
    contacts
  } = useArtisteForm(id);
  
  // État local pour gérer l'ajout de nouveaux membres
  const [nouveauMembre, setNouveauMembre] = useState('');
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    saveForm();
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    navigate('/artistes');
  };
  
  // Gérer l'ajout d'un membre
  const handleAjouterMembre = () => {
    if (nouveauMembre.trim()) {
      ajouterMembre(nouveauMembre);
      setNouveauMembre('');
    }
  };
  
  // Afficher le loader pendant le chargement des données
  if (isLoading) {
    return <div className="loader-container">Chargement des données de l'artiste...</div>;
  }
  
  // Rendu conditionnél basé sur l'étape actuelle
  const renderEtapeForm = () => {
    switch (etapeActuelle) {
      case 0: // Informations de base
        return (
          <div className="form-section">
            <h3>Informations de base</h3>
            
            <div className="form-group">
              <label htmlFor="nom">Nom de l'artiste *</label>
              <input
                type="text"
                id="nom"
                className={formErrors?.nom ? 'form-control is-invalid' : 'form-control'}
                value={artiste.nom || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
              {formErrors?.nom && <div className="invalid-feedback">{formErrors.nom}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="genre">Genre musical</label>
              <input
                type="text"
                id="genre"
                className="form-control"
                value={artiste.genre || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, genre: e.target.value }))}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-control"
                rows="4"
                value={artiste.description || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        );
      
      case 1: // Contacts
        return (
          <div className="form-section">
            <h3>Coordonnées</h3>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className={formErrors?.['contacts.email'] ? 'form-control is-invalid' : 'form-control'}
                value={contacts.email || ''}
                onChange={(e) => updateContact('email', e.target.value)}
              />
              {formErrors?.['contacts.email'] && <div className="invalid-feedback">{formErrors['contacts.email']}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                className="form-control"
                value={contacts.telephone || ''}
                onChange={(e) => updateContact('telephone', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="siteWeb">Site web</label>
              <input
                type="url"
                id="siteWeb"
                className={formErrors?.['contacts.siteWeb'] ? 'form-control is-invalid' : 'form-control'}
                value={contacts.siteWeb || ''}
                onChange={(e) => updateContact('siteWeb', e.target.value)}
                placeholder="https://"
              />
              {formErrors?.['contacts.siteWeb'] && <div className="invalid-feedback">{formErrors['contacts.siteWeb']}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="instagram">Instagram</label>
                <input
                  type="text"
                  id="instagram"
                  className="form-control"
                  value={contacts.instagram || ''}
                  onChange={(e) => updateContact('instagram', e.target.value)}
                />
              </div>
              
              <div className="form-group col-md-6">
                <label htmlFor="facebook">Facebook</label>
                <input
                  type="text"
                  id="facebook"
                  className="form-control"
                  value={contacts.facebook || ''}
                  onChange={(e) => updateContact('facebook', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      case 2: // Membres
        return (
          <div className="form-section">
            <h3>Membres du groupe</h3>
            
            <div className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom du membre"
                  value={nouveauMembre}
                  onChange={(e) => setNouveauMembre(e.target.value)}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="tc-btn tc-btn-outline-primary"
                    onClick={handleAjouterMembre}
                  >
                    <i className="bi bi-plus-lg"></i> Ajouter
                  </button>
                </div>
              </div>
            </div>
            
            {membres.length > 0 ? (
              <ul className="list-group mt-3">
                {membres.map((membre, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {membre}
                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      onClick={() => supprimerMembre(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="alert alert-light">Aucun membre ajouté</div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Définition des actions d'en-tête pour le formulaire principal
  const headerActions = (
    <div>
      <button
        type="button"
        className="tc-btn tc-btn-outline-secondary mr-2"
        onClick={handleCancel}
      >
        Annuler
      </button>
      <button
        type="button"
        className="tc-btn tc-btn-primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
  
  return (
    <div className="container artiste-form-exemple">
      <Card
        title={isNewArtiste ? 'Nouvel artiste' : 'Modifier l\'artiste'}
        headerActions={headerActions}
      >
        <form onSubmit={handleSubmit}>
          {/* Indicateur d'étapes */}
          <div className="steps-indicator mb-4">
            <div className="step-bullets">
              {etapes.map((etape, index) => (
                <div
                  key={index}
                  className={`step-bullet ${etapeActuelle >= index ? 'active' : ''}`}
                  onClick={() => setEtapeActuelle(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="step-names">
              <span className={etapeActuelle === 0 ? 'active' : ''}>Informations</span>
              <span className={etapeActuelle === 1 ? 'active' : ''}>Contacts</span>
              <span className={etapeActuelle === 2 ? 'active' : ''}>Membres</span>
            </div>
          </div>
          
          {/* Formulaire de l'étape actuelle */}
          {renderEtapeForm()}
          
          {/* Navigation entre étapes */}
          <div className="form-navigation mt-4">
            {etapeActuelle > 0 && (
              <button
                type="button"
                className="tc-btn tc-btn-outline-primary"
                onClick={goToPreviousStep}
              >
                Précédent
              </button>
            )}
            
            {etapeActuelle < etapes.length - 1 ? (
              <button
                type="button"
                className="tc-btn tc-btn-primary ml-auto"
                onClick={goToNextStep}
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                className="tc-btn tc-btn-success ml-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Terminer'}
              </button>
            )}
          </div>
        </form>
      </Card>
      
      {/* Aide et documentation */}
      <Card
        title="Utilisation du hook useArtisteForm"
        className="mt-4"
        icon={<i className="bi bi-info-circle"></i>}
      >
        <p>
          Ce composant démontre l'utilisation du hook <code>useArtisteForm</code> qui est basé directement
          sur <code>useGenericEntityForm</code>, conformément au plan de dépréciation officiel.
        </p>
        <p>
          <strong>Avantages :</strong>
        </p>
        <ul>
          <li>Formulaire par étapes avec validation spécifique à chaque champ</li>
          <li>Gestion optimisée des membres du groupe</li>
          <li>Connexion directe au hook générique pour une meilleure maintenabilité</li>
          <li>Gestion simplifiée des contacts via la méthode <code>updateContact</code></li>
        </ul>
      </Card>
    </div>
  );
};

export default ArtisteFormExemple;