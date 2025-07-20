/**
 * SERVICE DE DONNÉES CENTRALISÉ
 * =============================
 * 
 * Ce service garantit que les données sont toujours stockées et récupérées
 * de manière cohérente dans toute l'application.
 * 
 * PRINCIPE : Une seule façon de stocker, plusieurs façons de lire
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Normalise une date/événement depuis n'importe quelle source
 * @param {Object} data - Données brutes de n'importe où
 * @returns {Object} Date normalisée avec structure cohérente
 */
export function normalizeDate(data) {
  if (!data) return null;
  
  return {
    // IDs toujours avec suffixe 'Id'
    id: data.id || data.dateId || '',
    artisteId: data.artisteId || data.artiste || '',
    projetId: data.projetId || data.projet?.id || '',
    structureId: data.structureId || data.organisateurId || '',
    lieuId: data.lieuId || data.lieu || data.salleId || '',
    
    // Noms dénormalisés pour affichage
    artisteNom: data.artisteNom || data.artisteName || data.artiste?.nom || '',
    projetNom: data.projetNom || data.projet?.nom || data.projetIntitule || '',
    structureNom: data.structureNom || data.organisateurNom || data.structure?.nom || '',
    lieuNom: data.lieuNom || data.lieu?.nom || data.salleNom || '',
    
    // Données temporelles
    date: data.date || data.dateOption || data.dateEvent || '',
    heureDebut: data.heureDebut || data.heure || '',
    heureFin: data.heureFin || '',
    
    // Données financières (toujours en number)
    montant: parseFloat(data.montant || data.montantPropose || data.cachet || 0),
    
    // Infos générales
    libelle: data.libelle || data.titre || data.description || '',
    statut: data.statut || data.status || 'En cours',
    
    // Métadonnées
    entrepriseId: data.entrepriseId || '',
    creePar: data.creePar || data.createdBy || data.userId || '',
    dateCreation: data.dateCreation || data.createdAt || data.dateCreation || null,
    dateModification: data.dateModification || data.updatedAt || null
  };
}

/**
 * Normalise un contact/personne
 */
export function normalizeContact(data) {
  if (!data) return null;
  
  return {
    id: data.id || data.contactId || data.personneId || '',
    
    // Infos personnelles
    civilite: data.civilite || data.title || '',
    nom: data.nom || data.name || data.lastName || '',
    prenom: data.prenom || data.firstName || '',
    fonction: data.fonction || data.role || data.titre || data.poste || '',
    
    // Contact
    email: data.email || data.mail || '',
    telephone: data.telephone || data.tel || data.phone || '',
    telephonePortable: data.telephonePortable || data.mobile || data.portable || '',
    
    // Relation structure
    structureId: data.structureId || data.structure || data.organisationId || '',
    structureNom: data.structureNom || data.structure?.nom || data.organisation || '',
    
    // Adresse
    adresse: data.adresse || data.address || '',
    codePostal: data.codePostal || data.cp || data.postalCode || '',
    ville: data.ville || data.city || '',
    pays: data.pays || data.country || 'France',
    
    // Métadonnées
    entrepriseId: data.entrepriseId || '',
    tags: data.tags || [],
    categories: data.categories || []
  };
}

/**
 * Normalise une structure/organisation
 */
export function normalizeStructure(data) {
  if (!data) return null;
  
  return {
    id: data.id || data.structureId || data.organisationId || '',
    
    // Infos légales - mapper TOUTES les variations
    raisonSociale: data.raisonSociale || data.nom || data.name || 
                   data.structureRaisonSociale || data.nomStructure || 
                   data.nomOrga || data.organisationName || '',
    siret: data.siret || data.SIRET || data.numeroSiret || 
           data.siretOrga || data.structureSiret || '',
    
    // Contact
    email: data.email || data.mail || data.emailOrga || '',
    telephone: data.telephone || data.tel || data.phone || 
               data.telephoneOrga || data.telOrga || '',
    siteWeb: data.siteWeb || data.site || data.website || data.siteWebOrga || '',
    
    // Adresse - mapper les variations du formulaire public
    adresse: data.adresse || data.address || data.adresseOrga || '',
    codePostal: data.codePostal || data.cp || data.postalCode || 
                data.codePostalOrga || data.cpOrga || '',
    ville: data.ville || data.city || data.villeOrga || '',
    pays: data.pays || data.country || data.paysOrga || 'France',
    
    // Signataire - LE point critique avec toutes ses variations
    signataire: data.signataire || data.nomSignataire || 
                data.representant || data.contact || 
                data.contactSignataire || data.signataireNom || '',
    qualiteSignataire: data.qualiteSignataire || data.qualite || 
                       data.fonction || data.fonctionSignataire || '',
    
    // Type et classification
    type: data.type || 'Organisateur',
    tags: data.tags || [],
    categories: data.categories || [],
    
    // Relations
    contactsIds: data.contactsIds || data.contacts || [],
    
    // Métadonnées
    entrepriseId: data.entrepriseId || ''
  };
}

/**
 * Normalise un artiste
 */
export function normalizeArtiste(data) {
  if (!data) return null;
  
  return {
    id: data.id || data.artisteId || '',
    nom: data.nom || data.name || data.nomArtiste || data.artisteName || '',
    genre: data.genre || data.style || data.genreMusical || '',
    description: data.description || data.bio || '',
    
    // Relations
    contactId: data.contactId || data.contact || '',
    projetsIds: data.projetsIds || data.projets || [],
    
    // Métadonnées
    entrepriseId: data.entrepriseId || ''
  };
}

/**
 * Normalise un projet
 */
export function normalizeProjet(data) {
  if (!data) return null;
  
  return {
    id: data.id || data.projetId || data.projectId || '',
    nom: data.nom || data.name || data.intitule || data.titre || '',
    description: data.description || '',
    
    // Relations
    artistesIds: data.artistesIds || data.artistesSelectionnes || data.artistes || [],
    datesIds: data.datesIds || data.dates || [],
    
    // Statut
    statut: data.statut || data.status || 'Actif',
    
    // Métadonnées
    entrepriseId: data.entrepriseId || ''
  };
}

/**
 * Normalise un lieu/salle
 */
export function normalizeLieu(data) {
  if (!data) return null;
  
  return {
    id: data.id || data.lieuId || data.salleId || data.venueId || '',
    nom: data.nom || data.name || data.nomLieu || data.nomSalle || '',
    type: data.type || 'Salle',
    
    // Capacité
    capaciteDebout: parseInt(data.capaciteDebout || data.capacite || data.jauge || 0),
    capaciteAssis: parseInt(data.capaciteAssis || 0),
    
    // Adresse
    adresse: data.adresse || data.address || '',
    codePostal: data.codePostal || data.cp || '',
    ville: data.ville || data.city || '',
    pays: data.pays || 'France',
    
    // Contact
    email: data.email || '',
    telephone: data.telephone || data.tel || '',
    siteWeb: data.siteWeb || data.site || '',
    
    // Relations
    contactId: data.contactId || data.contact || '',
    structureId: data.structureId || data.structure || '',
    
    // Métadonnées
    entrepriseId: data.entrepriseId || ''
  };
}

/**
 * Service principal pour sauvegarder les données
 * Garantit que les données sont toujours sauvegardées de manière cohérente
 */
export const dataService = {
  /**
   * Prépare une date pour la sauvegarde
   */
  prepareDate: (formData, additionalData = {}) => {
    const normalized = normalizeDate({ ...formData, ...additionalData });
    
    // Retirer les champs null/undefined pour Firebase
    return Object.entries(normalized).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  },
  
  /**
   * Prépare un contact pour la sauvegarde
   */
  prepareContact: (formData, additionalData = {}) => {
    const normalized = normalizeContact({ ...formData, ...additionalData });
    return Object.entries(normalized).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  },
  
  /**
   * Prépare une structure pour la sauvegarde
   */
  prepareStructure: (formData, additionalData = {}) => {
    const normalized = normalizeStructure({ ...formData, ...additionalData });
    return Object.entries(normalized).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  },
  
  /**
   * Récupère des données normalisées depuis Firebase
   */
  getData: async (collection, id, normalizer) => {
    try {
      const doc = await getDoc(doc(db, collection, id));
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() };
        return normalizer ? normalizer(data) : data;
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${collection}/${id}:`, error);
      return null;
    }
  }
};

export default dataService;