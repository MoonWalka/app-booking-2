/**
 * Composant exemple démontrant l'utilisation de useProgrammateurForm
 * 
 * Ce composant montre comment utiliser le hook optimisé useProgrammateurForm
 * qui représente l'approche recommandée utilisant directement les hooks génériques
 * conformément au plan de dépréciation officiel.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgrammateurForm } from '@/hooks/programmateurs';
import EntitySearchField from '@/components/ui/EntitySearchField';
import Card from '@/components/ui/Card';
import Button from '@ui/Button';
import '@styles/index.css';

/**
 * Composant pour le formulaire de programmateur optimisé
 * Utilise directement useProgrammateurForm
 */
const ProgrammateurFormExemple = () => {
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
    
    // Fonctionnalités spécifiques aux programmateurs
    isNewProgrammateur,
    handleSelectStructure,
    sectionsVisibility,
    toggleSection,
    updateContact,
    updateStructure,
    
    // Raccourcis DX
    programmateur,
    contact,
    selectedStructure
  } = useProgrammateurForm(id);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    saveForm();
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    navigate('/programmateurs');
  };
  
  // Afficher le loader pendant le chargement des données
  if (isLoading) {
    return <div className="loader-container">Chargement des données du programmateur...</div>;
  }
  
  // Définition des actions d'en-tête pour le formulaire principal
  const headerActions = (
    <div>
      <Button
        variant="outline-secondary"
        className="mr-2"
        onClick={handleCancel}
      >
        Annuler
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </div>
  );
  
  return (
    <div className="container programmateur-form-exemple">
      <Card
        title={isNewProgrammateur ? 'Nouveau programmateur' : 'Modifier le programmateur'}
        headerActions={headerActions}
      >
        <form onSubmit={handleSubmit}>
          {/* Section contact */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('contactVisible')}>
              <h3>
                <i className={`bi bi-chevron-${sectionsVisibility.contactVisible ? 'down' : 'right'}`}></i>
                Informations du contact
              </h3>
            </div>
            
            {sectionsVisibility.contactVisible && (
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="contactNom">Nom *</label>
                    <input
                      type="text"
                      id="contactNom"
                      className={formErrors?.['contact.nom'] ? 'form-control is-invalid' : 'form-control'}
                      value={contact.nom || ''}
                      onChange={(e) => updateContact('nom', e.target.value)}
                      required
                    />
                    {formErrors?.['contact.nom'] && (
                      <div className="invalid-feedback">{formErrors['contact.nom']}</div>
                    )}
                  </div>
                  
                  <div className="form-group col-md-6">
                    <label htmlFor="contactPrenom">Prénom</label>
                    <input
                      type="text"
                      id="contactPrenom"
                      className="form-control"
                      value={contact.prenom || ''}
                      onChange={(e) => updateContact('prenom', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="contactFonction">Fonction</label>
                  <input
                    type="text"
                    id="contactFonction"
                    className="form-control"
                    value={contact.fonction || ''}
                    onChange={(e) => updateContact('fonction', e.target.value)}
                    placeholder="Ex: Directeur de programmation"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="contactEmail">Email *</label>
                    <input
                      type="email"
                      id="contactEmail"
                      className={formErrors?.['contact.email'] ? 'form-control is-invalid' : 'form-control'}
                      value={contact.email || ''}
                      onChange={(e) => updateContact('email', e.target.value)}
                      required
                    />
                    {formErrors?.['contact.email'] && (
                      <div className="invalid-feedback">{formErrors['contact.email']}</div>
                    )}
                  </div>
                  
                  <div className="form-group col-md-6">
                    <label htmlFor="contactTelephone">Téléphone</label>
                    <input
                      type="tel"
                      id="contactTelephone"
                      className="form-control"
                      value={contact.telephone || ''}
                      onChange={(e) => updateContact('telephone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Section structure */}
          <div className="form-section mt-4">
            <div className="section-header" onClick={() => toggleSection('structureVisible')}>
              <h3>
                <i className={`bi bi-chevron-${sectionsVisibility.structureVisible ? 'down' : 'right'}`}></i>
                Structure associée
              </h3>
            </div>
            
            {sectionsVisibility.structureVisible && (
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="structureSearch">Rechercher une structure existante</label>
                  <EntitySearchField
                    entityType="structure"
                    placeholder="Rechercher une structure par nom, ville ou SIRET"
                    onSelect={handleSelectStructure}
                    selectedEntity={selectedStructure}
                  />
                </div>
                
                {selectedStructure ? (
                  <div className="selected-structure-info alert alert-info">
                    <h5>{selectedStructure.raisonSociale || selectedStructure.nom}</h5>
                    {selectedStructure.siret && <p>SIRET: {selectedStructure.siret}</p>}
                    {selectedStructure.adresse && (
                      <p>
                        {selectedStructure.adresse}, {selectedStructure.codePostal} {selectedStructure.ville}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="mt-2"
                      onClick={() => handleSelectStructure(null)}
                    >
                      Dissocier cette structure
                    </Button>
                  </div>
                ) : (
                  <div className="new-structure-form">
                    <hr/>
                    <h5>Ou créer une nouvelle structure</h5>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="structureRaisonSociale">Raison sociale</label>
                        <input
                          type="text"
                          id="structureRaisonSociale"
                          className={formErrors?.['structure.raisonSociale'] ? 'form-control is-invalid' : 'form-control'}
                          value={programmateur.structure?.raisonSociale || ''}
                          onChange={(e) => updateStructure('raisonSociale', e.target.value)}
                        />
                        {formErrors?.['structure.raisonSociale'] && (
                          <div className="invalid-feedback">{formErrors['structure.raisonSociale']}</div>
                        )}
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="structureType">Type de structure</label>
                        <select
                          id="structureType"
                          className="form-control"
                          value={programmateur.structure?.type || ''}
                          onChange={(e) => updateStructure('type', e.target.value)}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="association">Association</option>
                          <option value="sarl">SARL</option>
                          <option value="sas">SAS</option>
                          <option value="eurl">EURL</option>
                          <option value="collectivite">Collectivité</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="structureAdresse">Adresse</label>
                      <input
                        type="text"
                        id="structureAdresse"
                        className="form-control"
                        value={programmateur.structure?.adresse || ''}
                        onChange={(e) => updateStructure('adresse', e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label htmlFor="structureCodePostal">Code postal</label>
                        <input
                          type="text"
                          id="structureCodePostal"
                          className="form-control"
                          value={programmateur.structure?.codePostal || ''}
                          onChange={(e) => updateStructure('codePostal', e.target.value)}
                        />
                      </div>
                      <div className="form-group col-md-8">
                        <label htmlFor="structureVille">Ville</label>
                        <input
                          type="text"
                          id="structureVille"
                          className="form-control"
                          value={programmateur.structure?.ville || ''}
                          onChange={(e) => updateStructure('ville', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="structureSiret">SIRET</label>
                        <input
                          type="text"
                          id="structureSiret"
                          className="form-control"
                          value={programmateur.structure?.siret || ''}
                          onChange={(e) => updateStructure('siret', e.target.value)}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="structureTva">N° TVA</label>
                        <input
                          type="text"
                          id="structureTva"
                          className="form-control"
                          value={programmateur.structure?.tva || ''}
                          onChange={(e) => updateStructure('tva', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Section pour les concerts associés (affichage uniquement) */}
          <div className="form-section mt-4">
            <div className="section-header" onClick={() => toggleSection('concertsVisible')}>
              <h3>
                <i className={`bi bi-chevron-${sectionsVisibility.concertsVisible ? 'down' : 'right'}`}></i>
                Concerts associés
              </h3>
            </div>
            
            {sectionsVisibility.concertsVisible && (
              <div className="section-content">
                {programmateur.concertsAssocies && programmateur.concertsAssocies.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Artiste</th>
                          <th>Lieu</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programmateur.concertsAssocies.map((concert, index) => (
                          <tr key={index}>
                            <td>{concert.date}</td>
                            <td>{concert.artisteNom}</td>
                            <td>{concert.lieuNom}</td>
                            <td>
                              <span className={`badge badge-${concert.statut === 'confirmé' ? 'success' : 'warning'}`}>
                                {concert.statut}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-light">Aucun concert associé à ce programmateur</div>
                )}
              </div>
            )}
          </div>
          
          {/* Boutons de soumission du formulaire */}
          <div className="form-actions mt-4">
            <Button
              variant="outline-secondary"
              className="mr-2"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Aide et documentation */}
      <Card
        title="Utilisation du hook useProgrammateurForm"
        className="mt-4"
      >
        <p>
          Ce composant démontre l'utilisation du hook <code>useProgrammateurForm</code> qui est basé directement
          sur <code>useGenericEntityForm</code>, conformément au plan de dépréciation officiel.
        </p>
        <p>
          <strong>Avantages :</strong>
        </p>
        <ul>
          <li>Gestion optimisée des formulaires de programmateurs avec validation intégrée</li>
          <li>Fonctionnalités de plier/déplier les sections pour une meilleure UX</li>
          <li>Gestion des structures associées (recherche ou création)</li>
          <li>Gestion simplifiée des champs imbriqués via <code>updateContact</code> et <code>updateStructure</code></li>
          <li>Affichage des entités liées (concerts associés)</li>
        </ul>
      </Card>
    </div>
  );
};

export default ProgrammateurFormExemple;