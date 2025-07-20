// Configuration centralisée pour les devis
// Évite les valeurs codées en dur dans les composants

export const devisConfig = {
  // Taux de TVA par défaut si aucun paramètre n'est défini
  tauxTvaDefaut: [
    { id: 1, libelle: 'Billetterie', taux: 2.1 },
    { id: 2, libelle: 'Réduit', taux: 5.5 },
    { id: 3, libelle: 'Normal', taux: 20 }
  ],
  
  // Unités par défaut si aucun paramètre n'est défini
  unitesDefaut: [
    { id: 1, nom: 'affiche', pluriel: 'affiches', categorie: 'quantite' },
    { id: 2, nom: 'atelier', pluriel: 'ateliers', categorie: 'service' },
    { id: 3, nom: 'heure', pluriel: 'heures', categorie: 'temps' },
    { id: 4, nom: 'jour', pluriel: 'jours', categorie: 'temps' },
    { id: 5, nom: 'km', pluriel: 'km', categorie: 'distance' },
    { id: 6, nom: 'nuit', pluriel: 'nuits', categorie: 'temps' },
    { id: 7, nom: 'personne', pluriel: 'personnes', categorie: 'quantite' },
    { id: 8, nom: 'repas', pluriel: 'repas', categorie: 'service' },
    { id: 9, nom: 'représentation', pluriel: 'représentations', categorie: 'service' },
    { id: 10, nom: 'forfait', pluriel: 'forfaits', categorie: 'service' }
  ],
  
  // Devises disponibles
  devises: [
    { code: 'EUR', libelle: 'EUR, euro' },
    { code: 'USD', libelle: 'USD, dollar' },
    { code: 'GBP', libelle: 'GBP, livre sterling' },
    { code: 'CHF', libelle: 'CHF, franc suisse' },
    { code: 'CAD', libelle: 'CAD, dollar canadien' }
  ],
  
  // Statuts de devis
  statuts: [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'envoye', label: 'Envoyé' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'termine', label: 'Terminé' },
    { value: 'refuse', label: 'Refusé' },
    { value: 'annule', label: 'Annulé' }
  ],
  
  // Natures de règlement
  naturesReglement: [
    { value: 'solde', label: 'Solde' },
    { value: 'acompte', label: 'Acompte' },
    { value: 'remboursement', label: 'Remboursement' }
  ],
  
  // Modes de paiement
  modesPaiement: [
    { value: 'virement', label: 'Virement' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'autre', label: 'Autre' }
  ],
  
  // Placeholders par défaut
  placeholders: {
    structureNonSelectionnee: 'Aucune structure sélectionnée',
    projetNonDefini: '[Nom du projet]',
    dateNonDefinie: '[Date à définir]'
  },
  
  // Valeurs par défaut pour nouvelle ligne
  nouvelleLigneDefaut: {
    unite: 'forfait',
    quantite: 1,
    prixUnitaire: 0,
    tauxTVA: 20 // Sera remplacé par le premier taux disponible
  },
  
  // Configuration des règlements
  reglement: {
    natureDefaut: 'acompte',
    modePaiementDefaut: 'virement'
  }
};

export default devisConfig;