/**
 * CONVENTIONS DE NOMMAGE DES DONNÉES
 * ==================================
 * 
 * Ce fichier définit LES SEULS noms de variables à utiliser
 * pour éviter la confusion dans toute l'application.
 * 
 * RÈGLE D'OR : Toujours utiliser ces noms, jamais d'autres !
 */

export const DATA_FIELDS = {
  // Pour une DATE (événement)
  DATE: {
    // IDs (toujours avec suffixe Id)
    ID: 'id',
    ARTISTE_ID: 'artisteId',        // PAS artiste, PAS artisteRef
    PROJET_ID: 'projetId',          // PAS projet, PAS projectId
    STRUCTURE_ID: 'structureId',    // PAS organisateurId, PAS structureRef
    LIEU_ID: 'lieuId',              // PAS lieu, PAS salleId
    
    // Noms pour affichage
    ARTISTE_NOM: 'artisteNom',      // PAS artisteName, PAS artiste.nom
    PROJET_NOM: 'projetNom',        // PAS projetIntitule
    STRUCTURE_NOM: 'structureNom',  // PAS organisateurNom
    LIEU_NOM: 'lieuNom',            // PAS nomLieu, PAS salleName
    
    // Données
    DATE: 'date',                   // PAS dateOption, PAS dateEvent
    MONTANT: 'montant',             // PAS montantPropose, PAS cachet
    STATUT: 'statut',               // PAS status, PAS etat
    LIBELLE: 'libelle'              // PAS titre, PAS description
  },
  
  // Pour un CONTACT (personne)
  CONTACT: {
    ID: 'id',                       // PAS contactId, PAS personneId
    NOM: 'nom',                     // PAS name, PAS lastName
    PRENOM: 'prenom',               // PAS firstName
    EMAIL: 'email',                 // PAS mail
    TELEPHONE: 'telephone',         // PAS tel, PAS phone
    FONCTION: 'fonction',           // PAS role, PAS titre
    STRUCTURE_ID: 'structureId'     // PAS structure, PAS organisationId
  },
  
  // Pour une STRUCTURE
  STRUCTURE: {
    ID: 'id',                       // PAS structureId
    RAISON_SOCIALE: 'raisonSociale', // PAS nom pour une structure !
    SIRET: 'siret',                 // PAS SIRET, PAS numeroSiret
    EMAIL: 'email',
    TELEPHONE: 'telephone',
    ADRESSE: 'adresse',
    CODE_POSTAL: 'codePostal',      // PAS cp, PAS codePostalOrga
    VILLE: 'ville',
    
    // LE FAMEUX SIGNATAIRE - UNE SEULE FAÇON !
    SIGNATAIRE: 'signataire',       // PAS nomSignataire, PAS representant
    QUALITE_SIGNATAIRE: 'qualiteSignataire' // PAS qualite, PAS fonction
  }
};

/**
 * Fonction helper pour migrer les anciennes données
 * vers les nouvelles conventions
 */
export function migrateToConventions(type, oldData) {
  if (!oldData) return null;
  
  switch(type) {
    case 'DATE':
      return {
        [DATA_FIELDS.DATE.ID]: oldData.id,
        [DATA_FIELDS.DATE.ARTISTE_ID]: oldData.artisteId || oldData.artiste,
        [DATA_FIELDS.DATE.PROJET_ID]: oldData.projetId || oldData.projet?.id,
        [DATA_FIELDS.DATE.STRUCTURE_ID]: oldData.structureId || oldData.organisateurId,
        [DATA_FIELDS.DATE.STRUCTURE_NOM]: oldData.structureNom || oldData.organisateurNom,
        [DATA_FIELDS.DATE.MONTANT]: parseFloat(oldData.montant || oldData.montantPropose || 0),
        [DATA_FIELDS.DATE.STATUT]: oldData.statut || oldData.status || 'En cours'
      };
      
    case 'STRUCTURE':
      return {
        [DATA_FIELDS.STRUCTURE.ID]: oldData.id,
        [DATA_FIELDS.STRUCTURE.RAISON_SOCIALE]: oldData.raisonSociale || oldData.nom,
        [DATA_FIELDS.STRUCTURE.SIRET]: oldData.siret || oldData.SIRET || oldData.numeroSiret,
        [DATA_FIELDS.STRUCTURE.SIGNATAIRE]: oldData.signataire || oldData.nomSignataire || oldData.representant,
        [DATA_FIELDS.STRUCTURE.QUALITE_SIGNATAIRE]: oldData.qualiteSignataire || oldData.qualite || oldData.fonction
      };
      
    default:
      return oldData;
  }
}