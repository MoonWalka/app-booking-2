/**
 * STRUCTURE CANONIQUE DES DONNÉES
 * ================================
 * 
 * Ce fichier définit LA structure de référence pour toutes les données de l'application.
 * Toutes les variations doivent être mappées vers cette structure.
 * 
 * RÈGLES :
 * 1. Toujours en français
 * 2. IDs avec suffixe "Id" 
 * 3. Pas d'objets imbriqués pour les références (seulement des IDs)
 * 4. Types stricts (number pour montants, string pour textes)
 * 5. Dates en format ISO string
 */

/**
 * Structure canonique d'une DATE (événement)
 */
export const DATE_STRUCTURE = {
  // Identifiants
  id: '',                    // ID Firebase de la date
  
  // Informations temporelles
  date: '',                  // Date de l'événement (ISO string)
  heureDebut: '',           // Heure de début
  heureFin: '',             // Heure de fin
  priseOption: '',          // Date de prise d'option (ISO string)
  
  // Références (IDs uniquement)
  artisteId: '',            // ID de l'artiste
  projetId: '',             // ID du projet
  structureId: '',          // ID de la structure organisatrice
  lieuId: '',               // ID du lieu/salle
  festivalId: '',           // ID du festival (optionnel)
  
  // Données dénormalisées (pour affichage rapide)
  artisteNom: '',           // Nom de l'artiste
  projetNom: '',            // Nom du projet
  structureNom: '',         // Nom de la structure
  lieuNom: '',              // Nom du lieu
  festivalNom: '',          // Nom du festival
  
  // Informations événement
  libelle: '',              // Description libre de l'événement
  genre: '',                // Genre musical
  
  // Données financières
  montant: 0,               // Montant HT (number)
  montantTTC: 0,            // Montant TTC (number)
  
  // Statut et workflow
  statut: '',               // 'En cours', 'Confirmé', 'Annulé', etc.
  contratId: '',            // ID du contrat associé
  factureId: '',            // ID de la facture associée
  
  // Métadonnées
  entrepriseId: '',         // ID de l'entreprise
  creePar: '',              // ID utilisateur créateur
  creeParNom: '',           // Nom utilisateur créateur
  dateCreation: '',         // Timestamp création
  dateModification: '',     // Timestamp dernière modification
};

/**
 * Structure canonique d'un CONTACT (personne)
 */
export const CONTACT_STRUCTURE = {
  // Identifiants
  id: '',                    // ID Firebase du contact
  
  // Informations personnelles
  civilite: '',             // M., Mme, etc.
  nom: '',                  // Nom de famille
  prenom: '',               // Prénom
  fonction: '',             // Fonction/poste
  
  // Coordonnées
  email: '',                // Email principal
  telephone: '',            // Téléphone principal
  telephonePortable: '',    // Téléphone portable
  
  // Référence structure
  structureId: '',          // ID de la structure
  structureNom: '',         // Nom de la structure (dénormalisé)
  
  // Adresse (si différente de la structure)
  adresse: '',              // Rue
  codePostal: '',           // Code postal
  ville: '',                // Ville
  pays: '',                 // Pays
  
  // Classification
  tags: [],                 // Array de tags
  categories: [],           // Array de catégories
  
  // Métadonnées
  entrepriseId: '',         // ID de l'entreprise
  creePar: '',              // ID utilisateur créateur
  dateCreation: '',         // Timestamp création
  dateModification: '',     // Timestamp dernière modification
};

/**
 * Structure canonique d'une STRUCTURE (organisation)
 */
export const STRUCTURE_STRUCTURE = {
  // Identifiants
  id: '',                    // ID Firebase de la structure
  
  // Informations légales
  raisonSociale: '',        // Raison sociale officielle
  formeJuridique: '',       // SARL, Association, etc.
  siret: '',                // Numéro SIRET
  numeroTVA: '',            // Numéro TVA intra
  licenceSpectacle: '',     // Numéro licence spectacle
  
  // Coordonnées
  email: '',                // Email principal
  telephone: '',            // Téléphone principal
  siteWeb: '',              // Site web
  
  // Adresse
  adresse: '',              // Rue
  codePostal: '',           // Code postal
  ville: '',                // Ville
  pays: '',                 // Pays
  
  // Relations
  contactsIds: [],          // Array d'IDs de contacts
  
  // Classification
  type: '',                 // 'Organisateur', 'Producteur', 'Salle', etc.
  tags: [],                 // Array de tags
  categories: [],           // Array de catégories
  
  // Métadonnées
  entrepriseId: '',         // ID de l'entreprise
  creePar: '',              // ID utilisateur créateur
  dateCreation: '',         // Timestamp création
  dateModification: '',     // Timestamp dernière modification
};

/**
 * Structure canonique d'un CONTRAT
 */
export const CONTRAT_STRUCTURE = {
  // Identifiants
  id: '',                    // ID Firebase du contrat
  numero: '',               // Numéro de contrat
  
  // Type et template
  type: '',                 // 'cession', 'production', etc.
  templateId: '',           // ID du template utilisé
  
  // Références principales
  dateId: '',               // ID de la date/événement
  
  // Parties prenantes (dénormalisées pour le PDF)
  organisateur: {
    structureId: '',
    raisonSociale: '',
    siret: '',
    adresse: '',
    codePostal: '',
    ville: '',
    signataire: '',        // Nom du signataire
    qualiteSignataire: '', // Qualité du signataire
  },
  
  producteur: {
    structureId: '',
    raisonSociale: '',
    siret: '',
    adresse: '',
    codePostal: '',
    ville: '',
    signataire: '',
    qualiteSignataire: '',
  },
  
  // Informations événement (dénormalisées)
  artiste: {
    id: '',
    nom: '',
    genre: '',
  },
  
  projet: {
    id: '',
    nom: '',
  },
  
  lieu: {
    id: '',
    nom: '',
    adresse: '',
    capacite: 0,
  },
  
  // Dates et horaires
  dateEvenement: '',        // Date de l'événement
  heureDebut: '',
  heureFin: '',
  
  // Données financières
  montantHT: 0,            // number
  tauxTVA: 5.5,            // number
  montantTTC: 0,           // number
  
  // Contenu
  contenuHTML: '',         // Contenu HTML du contrat
  
  // Statut
  statut: '',              // 'Brouillon', 'Envoyé', 'Signé', etc.
  dateSignature: '',       // Date de signature
  
  // Métadonnées
  entrepriseId: '',        // ID de l'entreprise
  creePar: '',             // ID utilisateur créateur
  dateCreation: '',        // Timestamp création
  dateModification: '',    // Timestamp dernière modification
};

/**
 * Structure canonique d'un ARTISTE
 */
export const ARTISTE_STRUCTURE = {
  // Identifiants
  id: '',                   // ID Firebase de l'artiste
  
  // Informations principales
  nom: '',                  // Nom de l'artiste/groupe
  genre: '',                // Genre musical
  description: '',          // Description/bio
  
  // Relations
  contactId: '',            // ID du contact principal
  projetsIds: [],           // Array d'IDs de projets
  
  // Technique
  ficheTechnique: '',       // URL ou texte
  rider: '',                // URL ou texte
  
  // Métadonnées
  entrepriseId: '',         // ID de l'entreprise
  creePar: '',              // ID utilisateur créateur
  dateCreation: '',         // Timestamp création
  dateModification: '',     // Timestamp dernière modification
};

/**
 * Structure canonique d'un PROJET
 */
export const PROJET_STRUCTURE = {
  // Identifiants
  id: '',                   // ID Firebase du projet
  
  // Informations principales
  nom: '',                  // Nom du projet
  description: '',          // Description
  dateDebut: '',            // Date de début du projet
  dateFin: '',              // Date de fin du projet
  
  // Relations
  artistesIds: [],          // Array d'IDs d'artistes
  datesIds: [],             // Array d'IDs de dates
  
  // Statut
  statut: '',               // 'Actif', 'Terminé', etc.
  
  // Métadonnées
  entrepriseId: '',         // ID de l'entreprise
  creePar: '',              // ID utilisateur créateur
  dateCreation: '',         // Timestamp création
  dateModification: '',     // Timestamp dernière modification
};

/**
 * Structure canonique d'un LIEU/SALLE
 */
export const LIEU_STRUCTURE = {
  // Identifiants
  id: '',                   // ID Firebase du lieu
  
  // Informations principales
  nom: '',                  // Nom du lieu
  type: '',                 // 'Salle', 'Festival', 'Bar', etc.
  
  // Capacité
  capaciteDebout: 0,        // number
  capaciteAssis: 0,         // number
  
  // Adresse
  adresse: '',              // Rue
  codePostal: '',           // Code postal
  ville: '',                // Ville
  pays: '',                 // Pays
  
  // Coordonnées
  email: '',                // Email
  telephone: '',            // Téléphone
  siteWeb: '',              // Site web
  
  // Relations
  contactId: '',            // ID du contact principal
  structureId: '',          // ID de la structure gestionnaire
  
  // Technique
  ficheTechnique: '',       // URL ou texte
  plan: '',                 // URL du plan
  
  // Métadonnées
  entrepriseId: '',         // ID de l'entreprise
  creePar: '',              // ID utilisateur créateur
  dateCreation: '',         // Timestamp création
  dateModification: '',     // Timestamp dernière modification
};