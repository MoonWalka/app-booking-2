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
import styles from './ContratFormExemple.module.css';

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
    
    // Déterminer la classe CSS selon le statut
    let statusClass = styles.statusBrouillon; // par défaut
    
    switch(statut) {
      case 'signe':
        statusClass = styles.statusSigne;
        break;
      case 'en_attente_signature':
        statusClass = styles.statusEnAttenteSignature;
        break;
      case 'annule':
        statusClass = styles.statusAnnule;
        break;
      case 'brouillon':
      default:
        statusClass = styles.statusBrouillon;
    }
    
    return (
      <div className={`${styles.statusBox} ${statusClass}`}>
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
      <div className={styles.container}>
        <div className={styles.textCenterLoading}>
          <h3>Chargement du contrat...</h3>
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
          {isNewContrat ? 'Nouveau Contrat' : `Contrat: ${contrat.reference || 'Sans référence'}`}
        </h1>
        <span className={`${styles.badge} ${isNewContrat ? styles.infoBadge : styles.successBadge}`}>
          {isNewContrat ? 'Création' : 'Édition'}
        </span>
      </div>
      
      {/* Affichage du statut du contrat */}
      {!isNewContrat && renderStatut()}
      
      {/* Navigation par onglets */}
      <div className={styles.tabBar}>
        <div 
          onClick={() => handleTabChange('details')}
          className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
        >
          Détails généraux
        </div>
        <div 
          onClick={() => handleTabChange('parties')}
          className={`${styles.tab} ${activeTab === 'parties' ? styles.activeTab : ''}`}
        >
          Parties contractantes
        </div>
        <div 
          onClick={() => handleTabChange('clauses')}
          className={`${styles.tab} ${activeTab === 'clauses' ? styles.activeTab : ''}`}
        >
          Clauses spéciales
        </div>
        <div 
          onClick={() => handleTabChange('conditions')}
          className={`${styles.tab} ${activeTab === 'conditions' ? styles.activeTab : ''}`}
        >
          Conditions financières
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Onglet Détails généraux */}
        {activeTab === 'details' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Détails généraux du contrat</h3>
            
            <div className={styles.field}>
              <label htmlFor="reference" className={styles.label}>Référence du contrat *</label>
              <input
                id="reference"
                type="text"
                className={styles.input}
                value={contrat.reference || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Référence unique du contrat"
              />
              {formErrors.reference && <p className={styles.error}>{formErrors.reference}</p>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="type" className={styles.label}>Type de contrat *</label>
              <select
                id="type"
                className={styles.select}
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
              {formErrors.type && <p className={styles.error}>{formErrors.type}</p>}
            </div>
            
            <div className={styles.twoColumns}>
              <div className={styles.field}>
                <label htmlFor="dateSignature" className={styles.label}>Date de signature</label>
                <input
                  id="dateSignature"
                  type="date"
                  className={styles.input}
                  value={dateSignatureFormatted || ''}
                  onChange={(e) => setDateSignature(e.target.value)}
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="lieuxSignature" className={styles.label}>Lieu de signature</label>
                <input
                  id="lieuxSignature"
                  type="text"
                  className={styles.input}
                  value={contrat.lieuSignature || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, lieuSignature: e.target.value }))}
                  placeholder="Ville où le contrat est signé"
                />
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="objetContrat" className={styles.label}>Objet du contrat *</label>
              <textarea
                id="objetContrat"
                className={styles.textarea}
                value={contrat.objetContrat || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, objetContrat: e.target.value }))}
                placeholder="Description détaillée de l'objet du contrat"
              />
              {formErrors.objetContrat && <p className={styles.error}>{formErrors.objetContrat}</p>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="noteInterne" className={styles.label}>Notes internes</label>
              <textarea
                id="noteInterne"
                className={styles.textarea}
                value={contrat.noteInterne || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, noteInterne: e.target.value }))}
                placeholder="Notes visibles uniquement par l'équipe"
              />
            </div>
            
            {/* Information sur le concert lié */}
            {concert && (
              <div className={styles.infoBox}>
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
              <div className={styles.warningBox}>
                <p><strong>Attention:</strong> Ce contrat n'est lié à aucun concert.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Onglet Parties contractantes */}
        {activeTab === 'parties' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Parties contractantes</h3>
            
            {/* Section Structure */}
            <div className={styles.infoBox}>
              <h4 className={styles.subTitle}>Structure organisatrice</h4>
              
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
                    className={`${styles.button} ${styles.secondaryButton} ${styles.smallButton}`}
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
                    className={`${styles.button} ${styles.primaryButton} ${styles.smallButton}`}
                    onClick={() => {
                      // Ici, vous pourriez ouvrir une boîte de dialogue ou naviguer vers un sélecteur de structures
                      alert("Cette fonctionnalité ouvrirait un sélecteur de structures dans l'application réelle");
                    }}
                  >
                    Sélectionner une structure
                  </button>
                </div>
              )}
              {formErrors.structureId && <p className={styles.error}>{formErrors.structureId}</p>}
            </div>
            
            {/* Section Artiste */}
            <div className={styles.infoBox}>
              <h4 className={styles.subTitle}>Artiste</h4>
              
              {artiste ? (
                <div>
                  <p><strong>Nom:</strong> {artiste.nom}</p>
                  {artiste.representant && <p><strong>Représentant:</strong> {artiste.representant}</p>}
                  {artiste.statut && <p><strong>Statut juridique:</strong> {artiste.statut}</p>}
                  
                  <button
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton} ${styles.smallButton}`}
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
                    className={`${styles.button} ${styles.primaryButton} ${styles.smallButton}`}
                    onClick={() => {
                      // Ici, vous pourriez ouvrir une boîte de dialogue ou naviguer vers un sélecteur d'artistes
                      alert("Cette fonctionnalité ouvrirait un sélecteur d'artistes dans l'application réelle");
                    }}
                  >
                    Sélectionner un artiste
                  </button>
                </div>
              )}
              {formErrors.artisteId && <p className={styles.error}>{formErrors.artisteId}</p>}
            </div>
            
            {/* Section Signataires */}
            <div className={styles.infoBox}>
              <h4 className={styles.subTitle}>Signataires</h4>
              
              <div className={styles.field}>
                <label htmlFor="signataire1Nom" className={styles.label}>Nom du signataire (structure)</label>
                <input
                  id="signataire1Nom"
                  type="text"
                  className={styles.input}
                  value={contrat.signataire1Nom || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire1Nom: e.target.value }))}
                  placeholder="Nom et prénom du signataire pour la structure"
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="signataire1Fonction" className={styles.label}>Fonction du signataire (structure)</label>
                <input
                  id="signataire1Fonction"
                  type="text"
                  className={styles.input}
                  value={contrat.signataire1Fonction || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire1Fonction: e.target.value }))}
                  placeholder="Ex: Directeur, Président, etc."
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="signataire2Nom" className={styles.label}>Nom du signataire (artiste)</label>
                <input
                  id="signataire2Nom"
                  type="text"
                  className={styles.input}
                  value={contrat.signataire2Nom || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, signataire2Nom: e.target.value }))}
                  placeholder="Nom et prénom du signataire pour l'artiste"
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="signataire2Fonction" className={styles.label}>Fonction du signataire (artiste)</label>
                <input
                  id="signataire2Fonction"
                  type="text"
                  className={styles.input}
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
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Clauses spéciales</h3>
            
            <div className={styles.field}>
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton}`}
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
                  className={`${styles.field} ${styles.clauseBox}`}
                >
                  <div className={styles.field}>
                    <label htmlFor={`clause-${index}-titre`} className={styles.label}>Titre de la clause *</label>
                    <input
                      id={`clause-${index}-titre`}
                      type="text"
                      className={styles.input}
                      value={clause.titre || ''}
                      onChange={(e) => updateClauseSpeciale(index, 'titre', e.target.value)}
                      placeholder="Ex: Restauration, Hébergement, etc."
                    />
                  </div>
                  
                  <div className={styles.field}>
                    <label htmlFor={`clause-${index}-contenu`} className={styles.label}>Contenu *</label>
                    <textarea
                      id={`clause-${index}-contenu`}
                      className={styles.textarea}
                      value={clause.contenu || ''}
                      onChange={(e) => updateClauseSpeciale(index, 'contenu', e.target.value)}
                      placeholder="Texte détaillé de la clause spéciale"
                      rows={4}
                    />
                  </div>
                  
                  <div className={styles.field}>
                    <input
                      id={`clause-${index}-important`}
                      type="checkbox"
                      checked={clause.important || false}
                      onChange={(e) => updateClauseSpeciale(index, 'important', e.target.checked)}
                    />
                    <label htmlFor={`clause-${index}-important`} className={styles.label}>
                      Clause importante (mise en évidence dans le contrat)
                    </label>
                  </div>
                  
                  <button
                    type="button"
                    className={`${styles.button} ${styles.dangerButton}`}
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
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Conditions financières</h3>
            
            <div className={styles.twoColumns}>
              <div className={styles.field}>
                <label htmlFor="montantHT" className={styles.label}>Montant HT *</label>
                <div className={styles.inputContainer}>
                  <input
                    id="montantHT"
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.input}
                    value={contrat.montantHT || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, montantHT: Number(e.target.value) }))}
                    placeholder="Montant hors taxes"
                  />
                  <span className={styles.currency}>€</span>
                </div>
                {formErrors.montantHT && <p className={styles.error}>{formErrors.montantHT}</p>}
              </div>
              
              <div className={styles.field}>
                <label htmlFor="tauxTVA" className={styles.label}>Taux de TVA (%)</label>
                <div className={styles.inputContainer}>
                  <input
                    id="tauxTVA"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className={styles.input}
                    value={contrat.tauxTVA || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, tauxTVA: Number(e.target.value) }))}
                    placeholder="Ex: 5.5, 20, etc."
                  />
                  <span className={styles.percentage}>%</span>
                </div>
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="montantTTC" className={styles.label}>Montant TTC estimé</label>
              <div className={styles.inputContainer}>
                <input
                  id="montantTTC"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${styles.input} ${styles.disabledInput}`}
                  value={(() => {
                    const ht = Number(contrat.montantHT || 0);
                    const tva = Number(contrat.tauxTVA || 0);
                    return ht + (ht * tva / 100);
                  })()}
                  disabled
                />
                <span className={styles.currency}>€</span>
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="modePaiement" className={styles.label}>Mode de paiement</label>
              <select
                id="modePaiement"
                className={styles.select}
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
            
            <div className={styles.field}>
              <label htmlFor="echeancier" className={styles.label}>Échéancier de paiement</label>
              <textarea
                id="echeancier"
                className={styles.textarea}
                value={contrat.echeancier || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, echeancier: e.target.value }))}
                placeholder="Ex: 30% à la signature, 70% le jour du spectacle"
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="delaiPaiement" className={styles.label}>Délai de paiement (jours)</label>
              <input
                id="delaiPaiement"
                type="number"
                min="0"
                className={styles.input}
                value={contrat.delaiPaiement || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, delaiPaiement: Number(e.target.value) }))}
                placeholder="Nombre de jours après prestation/événement"
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="notesFinancieres" className={styles.label}>Notes financières</label>
              <textarea
                id="notesFinancieres"
                className={styles.textarea}
                value={contrat.notesFinancieres || ''}
                onChange={(e) => updateFormData(prev => ({ ...prev, notesFinancieres: e.target.value }))}
                placeholder="Autres informations financières pertinentes"
              />
            </div>
          </div>
        )}
        
        {/* Boutons d'actions */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={resetForm}
          >
            Réinitialiser
          </button>
          
          <div className={styles.actionsContainer}>
            {!isNewContrat && canGeneratePdf && (
              <button
                type="button"
                className={`${styles.button} ${styles.warningButton}`}
                onClick={generatePDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Génération en cours...' : 'Générer PDF'}
              </button>
            )}
            
            {!isNewContrat && canGeneratePdf && contrat.statut !== 'signe' && (
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={sendForSignature}
                disabled={isSendingForSignature}
              >
                {isSendingForSignature ? 'Envoi en cours...' : 'Envoyer pour signature'}
              </button>
            )}
            
            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement...' : isNewContrat ? 'Créer le contrat' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContratFormExemple;