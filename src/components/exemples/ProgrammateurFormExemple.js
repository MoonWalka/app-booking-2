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
import Alert from '@/components/ui/Alert';
import Button from '@ui/Button';
import FormField from '@/components/ui/FormField';
import FlexContainer from '@/components/ui/FlexContainer';
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
                <FlexContainer gap="1rem" wrap>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <FormField
                      label="Nom *"
                      type="text"
                      id="contactNom"
                      value={contact.nom || ''}
                      onChange={(e) => updateContact('nom', e.target.value)}
                      error={formErrors?.['contact.nom']}
                      required
                    />
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <FormField
                      label="Prénom"
                      type="text"
                      id="contactPrenom"
                      value={contact.prenom || ''}
                      onChange={(e) => updateContact('prenom', e.target.value)}
                    />
                  </div>
                </FlexContainer>
                
                <FormField
                  label="Fonction"
                  type="text"
                  id="contactFonction"
                  value={contact.fonction || ''}
                  onChange={(e) => updateContact('fonction', e.target.value)}
                  placeholder="Ex: Directeur de programmation"
                />
                
                <FlexContainer gap="1rem" wrap>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <FormField
                      label="Email *"
                      type="email"
                      id="contactEmail"
                      value={contact.email || ''}
                      onChange={(e) => updateContact('email', e.target.value)}
                      error={formErrors?.['contact.email']}
                      required
                    />
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <FormField
                      label="Téléphone"
                      type="tel"
                      id="contactTelephone"
                      value={contact.telephone || ''}
                      onChange={(e) => updateContact('telephone', e.target.value)}
                    />
                  </div>
                </FlexContainer>
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
                <FormField
                  label="Rechercher une structure existante"
                  as={EntitySearchField}
                  entityType="structure"
                  placeholder="Rechercher une structure par nom, ville ou SIRET"
                  onSelect={handleSelectStructure}
                  selectedEntity={selectedStructure}
                />
                
                {selectedStructure ? (
                  <Alert variant="info" className="selected-structure-info">
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
                  </Alert>
                ) : (
                  <div className="new-structure-form">
                    <hr/>
                    <h5>Ou créer une nouvelle structure</h5>
                    <FlexContainer gap="1rem" wrap>
                      <div style={{ flex: '1', minWidth: '250px' }}>
                        <FormField
                          label="Raison sociale"
                          type="text"
                          id="structureRaisonSociale"
                          value={programmateur.structure?.raisonSociale || ''}
                          onChange={(e) => updateStructure('raisonSociale', e.target.value)}
                          error={formErrors?.['structure.raisonSociale']}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '250px' }}>
                        <FormField
                          label="Type de structure"
                          type="select"
                          id="structureType"
                          value={programmateur.structure?.type || ''}
                          onChange={(e) => updateStructure('type', e.target.value)}
                          options={[
                            { value: '', label: 'Sélectionner...' },
                            { value: 'association', label: 'Association' },
                            { value: 'sarl', label: 'SARL' },
                            { value: 'sas', label: 'SAS' },
                            { value: 'eurl', label: 'EURL' },
                            { value: 'collectivite', label: 'Collectivité' },
                            { value: 'autre', label: 'Autre' }
                          ]}
                        />
                      </div>
                    </FlexContainer>
                    <FormField
                      label="Adresse"
                      type="text"
                      id="structureAdresse"
                      value={programmateur.structure?.adresse || ''}
                      onChange={(e) => updateStructure('adresse', e.target.value)}
                    />
                    <FlexContainer gap="1rem" wrap>
                      <div style={{ flex: '1', minWidth: '150px', maxWidth: '200px' }}>
                        <FormField
                          label="Code postal"
                          type="text"
                          id="structureCodePostal"
                          value={programmateur.structure?.codePostal || ''}
                          onChange={(e) => updateStructure('codePostal', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: '2', minWidth: '250px' }}>
                        <FormField
                          label="Ville"
                          type="text"
                          id="structureVille"
                          value={programmateur.structure?.ville || ''}
                          onChange={(e) => updateStructure('ville', e.target.value)}
                        />
                      </div>
                    </FlexContainer>
                    <FlexContainer gap="1rem" wrap>
                      <div style={{ flex: '1', minWidth: '250px' }}>
                        <FormField
                          label="SIRET"
                          type="text"
                          id="structureSiret"
                          value={programmateur.structure?.siret || ''}
                          onChange={(e) => updateStructure('siret', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '250px' }}>
                        <FormField
                          label="N° TVA"
                          type="text"
                          id="structureTva"
                          value={programmateur.structure?.tva || ''}
                          onChange={(e) => updateStructure('tva', e.target.value)}
                        />
                      </div>
                    </FlexContainer>
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
                  <Alert variant="light">Aucun concert associé à ce programmateur</Alert>
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