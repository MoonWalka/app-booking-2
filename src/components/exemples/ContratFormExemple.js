/**
 * Composant exemple démontrant l'utilisation de useContratForm
 * 
 * Ce composant sert d'exemple pour illustrer comment utiliser le hook optimisé
 * pour les formulaires de contrats, conformément au plan de dépréciation
 * qui prévoit la suppression des hooks spécifiques d'ici novembre 2025.
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContratForm } from '@/hooks/contrats';
import { format } from 'date-fns';

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
  warningButton: {
    backgroundColor: '#f39c12',
    color: 'white'
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
    color: 'white'
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
  warningBadge: {
    backgroundColor: '#f39c12',
    color: 'white'
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  threeColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '15px'
  },
  tabBar: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd'
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer'
  },
  activeTab: {
    borderBottom: '2px solid #3498db',
    fontWeight: 'bold'
  },
  statusBox: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  actionsContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  }
};

/**
 * Composant exemple démontrant l'utilisation de useContratForm
 */
const ContratFormExemple = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  
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
    
    // Propriétés spécifiques au contrat
    isNewContrat,
    contrat,
    concert,
    structure,
    artiste,
    
    // Gestion des relations
    updateConcert,
    updateStructure,
    updateArtiste,
    
    // Gestion des dates
    setDateSignature,
    dateSignatureFormatted,
    
    // Gestion des clauses spéciales
    clausesSpeciales,
    addClauseSpeciale,
    removeClauseSpeciale,
    updateClauseSpeciale,
    
    // Fonctions avancées spécifiques aux contrats
    generatePDF,
    isGeneratingPDF,
    sendForSignature,
    isSendingForSignature,
    
    // Vérifications et états supplémentaires
    hasRequiredFields,
    canGeneratePdf,
    statutContrat
  } = useContratForm(id);
  
  // Fonctions de gestion des onglets
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Fonction pour gérer les soumissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    await validateAndSave();
  };
  
  // Rendu du statut du contrat avec couleur appropriée
  const renderStatut = () => {
    const statut = contrat.statut || 'brouillon';
    
    let bgColor = '#e9e9e9';
    let textColor = '#333';
    
    switch(statut) {
      case 'signe':
        bgColor = '#2ecc71';
        textColor = '#fff';
        break;
      case 'en_attente_signature':
        bgColor = '#f39c12';
        textColor = '#fff';
        break;
      case 'annule':
        bgColor = '#e74c3c';
        textColor = '#fff';
        break;
      case 'brouillon':
      default:
        bgColor = '#3498db';
        textColor = '#fff';
    }
    
    return (
      <div style={{ ...formStyles.statusBox, backgroundColor: bgColor, color: textColor }}>
        <strong>Statut: </strong>
        {statut === 'brouillon' && 'Brouillon'}
        {statut === 'en_attente_signature' && 'En attente de signature'}
        {statut === 'signe' && 'Signé'}
        {statut === 'annule' && 'Annulé'}
      </div>
    );
  };
  
  // Gestion de l'ajout d'une clause spéciale
  const handleAddClause = () => {
    addClauseSpeciale({ titre: 'Nouvelle clause', contenu: '', important: false });
  };
  
  if (isLoading) {
    return (
      <div style={formStyles.container}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h3>Chargement du contrat...</h3>
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
          {isNewContrat ? 'Nouveau Contrat' : `Contrat: ${contrat.reference || 'Sans référence'}`}
        </h1>
        <span style={{
          ...formStyles.badge,
          ...isNewContrat ? formStyles.infoBadge : formStyles.successBadge
        }}>
          {isNewContrat ? 'Création' : 'Édition'}
        </span>
      </div>
      
      {/* Affichage du statut du contrat */}
      {!isNewContrat && renderStatut()}
      
      {/* Navigation par onglets */}
      <div style={formStyles.tabBar}>
        <div 
          onClick={() => handleTabChange('details')}
          style={{
            ...formStyles.tab,
            ...(activeTab === 'details' ? formStyles.activeTab : {})
          }}
        >
          Détails généraux
        </div>
        <div 
          onClick={() => handleTabChange('parties')}
          style={{
            ...formStyles.tab,
            ...(activeTab === 'parties' ? formStyles.activeTab : {})
          }}
        >
          Parties contractantes
        </div>
        <div 
          onClick={() => handleTabChange('clauses')}
          style={{
            ...formStyles.tab,
            ...(activeTab === 'clauses' ? formStyles.activeTab : {})
          }}
        >
          Clauses spéciales
        </div>
        <div 
          onClick={() => handleTabChange('conditions')}
          style={{
            ...formStyles.tab,
            ...(activeTab === 'conditions' ? formStyles.activeTab : {})
          }}
        >
          Conditions financières
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Onglet Détails généraux */}
        {activeTab === 'details' && (
          <div style={formStyles.section}>
            <h3 style={formStyles.sectionTitle}>Détails généraux du contrat</h3>
            
            <div style={formStyles.field}>
              <label htmlFor="reference" style={formStyles.label}>Référence du contrat *</label>
              <input
                id="reference"
                type="text"
                style={formStyles.input}
                value={contrat.reference || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Référence unique du contrat"
              />
              {formErrors.reference && <p style={formStyles.error}>{formErrors.reference}</p>}
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="type" style={formStyles.label}>Type de contrat *</label>
              <select
                id="type"
                style={formStyles.select}
                value={contrat.type || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Sélectionner un type de contrat</option>
                <option value="cession">Contrat de cession</option>
                <option value="coproduction">Contrat de coproduction</option>
                <option value="residence">Contrat de résidence</option>
                <option value="prestation">Contrat de prestation</option>
                <option value="autre">Autre type de contrat</option>
              </select>
              {formErrors.type && <p style={formStyles.error}>{formErrors.type}</p>}
            </div>
            
            <div style={formStyles.twoColumns}>
              <div style={formStyles.field}>
                <label htmlFor="dateSignature" style={formStyles.label}>Date de signature</label>
                <input
                  id="dateSignature"
                  type="date"
                  style={formStyles.input}
                  value={dateSignatureFormatted || ''}
                  onChange={(e) => setDateSignature(e.target.value)}
                />
              </div>
              
              <div style={formStyles.field}>
                <label htmlFor="lieuxSignature" style={formStyles.label}>Lieu de signature</label>
                <input
                  id="lieuxSignature"
                  type="text"
                  style={formStyles.input}
                  value={contrat.lieuSignature || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, lieuSignature: e.target.value }))}
                  placeholder="Ville où le contrat est signé"
                />
              </div>
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="objetContrat" style={formStyles.label}>Objet du contrat *</label>
              <textarea
                id="objetContrat"
                style={formStyles.textarea}
                value={contrat.objetContrat || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, objetContrat: e.target.value }))}
                placeholder="Description détaillée de l'objet du contrat"
              />
              {formErrors.objetContrat && <p style={formStyles.error}>{formErrors.objetContrat}</p>}
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="noteInterne" style={formStyles.label}>Notes internes</label>
              <textarea
                id="noteInterne"
                style={formStyles.textarea}
                value={contrat.noteInterne || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, noteInterne: e.target.value }))}
                placeholder="Notes visibles uniquement par l'équipe"
              />
            </div>
            
            {/* Information sur le concert lié */}
            {concert && (
              <div style={{
                padding: '10px',
                backgroundColor: '#f0f7fb',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <p><strong>Lié au concert:</strong> {concert.titre}</p>
                {concert.date && (
                  <p><strong>Date du concert:</strong> {format(new Date(concert.date), 'dd/MM/yyyy HH:mm')}</p>
                )}
                {concert.lieu && (
                  <p><strong>Lieu:</strong> {concert.lieu.nom}</p>
                )}
              </div>
            )}
            
            {(!concert && !isNewContrat) && (
              <div style={{
                padding: '10px',
                backgroundColor: '#ffe9e0',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <p><strong>Attention:</strong> Ce contrat n'est lié à aucun concert.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Onglet Parties contractantes */}
        {activeTab === 'parties' && (
          <div style={formStyles.section}>
            <h3 style={formStyles.sectionTitle}>Parties contractantes</h3>
            
            {/* Section Structure */}
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Structure organisatrice</h4>
              
              {structure ? (
                <div>
                  <p><strong>Nom:</strong> {structure.nom}</p>
                  <p><strong>Raison sociale:</strong> {structure.raisonSociale}</p>
                  {structure.siret && <p><strong>SIRET:</strong> {structure.siret}</p>}
                  {structure.adresse && <p><strong>Adresse:</strong> {structure.adresse}</p>}
                  {structure.codePostal && structure.ville && (
                    <p><strong>Code postal / Ville:</strong> {structure.codePostal} {structure.ville}</p>
                  )}
                  
                  <button
                    type="button"
                    style={{
                      ...formStyles.button,
                      ...formStyles.secondaryButton,
                      padding: '5px 10px',
                      marginTop: '10px'
                    }}
                    onClick={() => updateStructure(null)}
                  >
                    Changer de structure
                  </button>
                </div>
              ) : (
                <div>
                  <p>Aucune structure sélectionnée</p>
                  <button
                    type="button"
                    style={{
                      ...formStyles.button,
                      ...formStyles.primaryButton,
                      padding: '5px 10px',
                      marginTop: '10px'
                    }}
                    onClick={() => {
                      // Ici, vous pourriez ouvrir une boîte de dialogue ou naviguer vers un sélecteur de structures
                      alert("Cette fonctionnalité ouvrirait un sélecteur de structures dans l'application réelle");
                    }}
                  >
                    Sélectionner une structure
                  </button>
                </div>
              )}
              {formErrors.structureId && <p style={formStyles.error}>{formErrors.structureId}</p>}
            </div>
            
            {/* Section Artiste */}
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Artiste</h4>
              
              {artiste ? (
                <div>
                  <p><strong>Nom:</strong> {artiste.nom}</p>
                  {artiste.representant && <p><strong>Représentant:</strong> {artiste.representant}</p>}
                  {artiste.statut && <p><strong>Statut juridique:</strong> {artiste.statut}</p>}
                  
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
                <div>
                  <p>Aucun artiste sélectionné</p>
                  <button
                    type="button"
                    style={{
                      ...formStyles.button,
                      ...formStyles.primaryButton,
                      padding: '5px 10px',
                      marginTop: '10px'
                    }}
                    onClick={() => {
                      // Ici, vous pourriez ouvrir une boîte de dialogue ou naviguer vers un sélecteur d'artistes
                      alert("Cette fonctionnalité ouvrirait un sélecteur d'artistes dans l'application réelle");
                    }}
                  >
                    Sélectionner un artiste
                  </button>
                </div>
              )}
              {formErrors.artisteId && <p style={formStyles.error}>{formErrors.artisteId}</p>}
            </div>
            
            {/* Section Signataires */}
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Signataires</h4>
              
              <div style={formStyles.field}>
                <label htmlFor="signataire1Nom" style={formStyles.label}>Nom du signataire (structure)</label>
                <input
                  id="signataire1Nom"
                  type="text"
                  style={formStyles.input}
                  value={contrat.signataire1Nom || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire1Nom: e.target.value }))}
                  placeholder="Nom et prénom du signataire pour la structure"
                />
              </div>
              
              <div style={formStyles.field}>
                <label htmlFor="signataire1Fonction" style={formStyles.label}>Fonction du signataire (structure)</label>
                <input
                  id="signataire1Fonction"
                  type="text"
                  style={formStyles.input}
                  value={contrat.signataire1Fonction || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire1Fonction: e.target.value }))}
                  placeholder="Ex: Directeur, Président, etc."
                />
              </div>
              
              <div style={formStyles.field}>
                <label htmlFor="signataire2Nom" style={formStyles.label}>Nom du signataire (artiste)</label>
                <input
                  id="signataire2Nom"
                  type="text"
                  style={formStyles.input}
                  value={contrat.signataire2Nom || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire2Nom: e.target.value }))}
                  placeholder="Nom et prénom du signataire pour l'artiste"
                />
              </div>
              
              <div style={formStyles.field}>
                <label htmlFor="signataire2Fonction" style={formStyles.label}>Fonction du signataire (artiste)</label>
                <input
                  id="signataire2Fonction"
                  type="text"
                  style={formStyles.input}
                  value={contrat.signataire2Fonction || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire2Fonction: e.target.value }))}
                  placeholder="Ex: Artiste, Manager, Agent, etc."
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Onglet Clauses spéciales */}
        {activeTab === 'clauses' && (
          <div style={formStyles.section}>
            <h3 style={formStyles.sectionTitle}>Clauses spéciales</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <button
                type="button"
                style={{ ...formStyles.button, ...formStyles.primaryButton }}
                onClick={handleAddClause}
              >
                Ajouter une clause
              </button>
            </div>
            
            {clausesSpeciales.length === 0 ? (
              <p>Aucune clause spéciale ajoutée. Ce contrat utilisera uniquement les clauses standard.</p>
            ) : (
              clausesSpeciales.map((clause, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    backgroundColor: clause.important ? '#fff3e0' : '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    border: clause.important ? '1px solid #ffcc80' : '1px solid #e9e9e9'
                  }}
                >
                  <div style={formStyles.field}>
                    <label htmlFor={`clause-${index}-titre`} style={formStyles.label}>Titre de la clause *</label>
                    <input
                      id={`clause-${index}-titre`}
                      type="text"
                      style={formStyles.input}
                      value={clause.titre || ''}
                      onChange={(e) => updateClauseSpeciale(index, 'titre', e.target.value)}
                      placeholder="Ex: Restauration, Hébergement, etc."
                    />
                  </div>
                  
                  <div style={formStyles.field}>
                    <label htmlFor={`clause-${index}-contenu`} style={formStyles.label}>Contenu *</label>
                    <textarea
                      id={`clause-${index}-contenu`}
                      style={formStyles.textarea}
                      value={clause.contenu || ''}
                      onChange={(e) => updateClauseSpeciale(index, 'contenu', e.target.value)}
                      placeholder="Texte détaillé de la clause spéciale"
                      rows={4}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      id={`clause-${index}-important`}
                      type="checkbox"
                      checked={clause.important || false}
                      onChange={(e) => updateClauseSpeciale(index, 'important', e.target.checked)}
                      style={{ marginRight: '5px' }}
                    />
                    <label htmlFor={`clause-${index}-important`} style={{ fontSize: '0.9rem' }}>
                      Clause importante (mise en évidence dans le contrat)
                    </label>
                  </div>
                  
                  <button
                    type="button"
                    style={{ ...formStyles.button, ...formStyles.dangerButton }}
                    onClick={() => removeClauseSpeciale(index)}
                  >
                    Supprimer cette clause
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Onglet Conditions financières */}
        {activeTab === 'conditions' && (
          <div style={formStyles.section}>
            <h3 style={formStyles.sectionTitle}>Conditions financières</h3>
            
            <div style={formStyles.twoColumns}>
              <div style={formStyles.field}>
                <label htmlFor="montantHT" style={formStyles.label}>Montant HT *</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="montantHT"
                    type="number"
                    min="0"
                    step="0.01"
                    style={formStyles.input}
                    value={contrat.montantHT || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, montantHT: Number(e.target.value) }))}
                    placeholder="Montant hors taxes"
                  />
                  <span style={{ marginLeft: '8px' }}>€</span>
                </div>
                {formErrors.montantHT && <p style={formStyles.error}>{formErrors.montantHT}</p>}
              </div>
              
              <div style={formStyles.field}>
                <label htmlFor="tauxTVA" style={formStyles.label}>Taux de TVA (%)</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="tauxTVA"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    style={formStyles.input}
                    value={contrat.tauxTVA || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, tauxTVA: Number(e.target.value) }))}
                    placeholder="Ex: 5.5, 20, etc."
                  />
                  <span style={{ marginLeft: '8px' }}>%</span>
                </div>
              </div>
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="montantTTC" style={formStyles.label}>Montant TTC estimé</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="montantTTC"
                  type="number"
                  min="0"
                  step="0.01"
                  style={{
                    ...formStyles.input,
                    backgroundColor: '#f8f9fa'
                  }}
                  value={(() => {
                    const ht = Number(contrat.montantHT || 0);
                    const tva = Number(contrat.tauxTVA || 0);
                    return ht + (ht * tva / 100);
                  })()}
                  disabled
                />
                <span style={{ marginLeft: '8px' }}>€</span>
              </div>
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="modePaiement" style={formStyles.label}>Mode de paiement</label>
              <select
                id="modePaiement"
                style={formStyles.select}
                value={contrat.modePaiement || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
              >
                <option value="">Sélectionner un mode de paiement</option>
                <option value="virement">Virement bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="especes">Espèces</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="echeancier" style={formStyles.label}>Échéancier de paiement</label>
              <textarea
                id="echeancier"
                style={formStyles.textarea}
                value={contrat.echeancier || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, echeancier: e.target.value }))}
                placeholder="Ex: 30% à la signature, 70% le jour du spectacle"
              />
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="delaiPaiement" style={formStyles.label}>Délai de paiement (jours)</label>
              <input
                id="delaiPaiement"
                type="number"
                min="0"
                style={formStyles.input}
                value={contrat.delaiPaiement || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, delaiPaiement: Number(e.target.value) }))}
                placeholder="Nombre de jours après prestation/événement"
              />
            </div>
            
            <div style={formStyles.field}>
              <label htmlFor="notesFinancieres" style={formStyles.label}>Notes financières</label>
              <textarea
                id="notesFinancieres"
                style={formStyles.textarea}
                value={contrat.notesFinancieres || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, notesFinancieres: e.target.value }))}
                placeholder="Autres informations financières pertinentes"
              />
            </div>
          </div>
        )}
        
        {/* Boutons d'actions */}
        <div>
          <div style={formStyles.buttonGroup}>
            <button
              type="button"
              style={{ ...formStyles.button, ...formStyles.secondaryButton }}
              onClick={resetForm}
            >
              Réinitialiser
            </button>
            
            <div style={formStyles.actionsContainer}>
              {!isNewContrat && canGeneratePdf && (
                <button
                  type="button"
                  style={{ ...formStyles.button, ...formStyles.warningButton }}
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? 'Génération en cours...' : 'Générer PDF'}
                </button>
              )}
              
              {!isNewContrat && canGeneratePdf && contrat.statut !== 'signe' && (
                <button
                  type="button"
                  style={{ ...formStyles.button, ...formStyles.primaryButton }}
                  onClick={sendForSignature}
                  disabled={isSendingForSignature}
                >
                  {isSendingForSignature ? 'Envoi en cours...' : 'Envoyer pour signature'}
                </button>
              )}
              
              <button
                type="submit"
                style={{ ...formStyles.button, ...formStyles.primaryButton }}
                disabled={isSaving}
              >
                {isSaving ? 'Enregistrement...' : isNewContrat ? 'Créer le contrat' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContratFormExemple;