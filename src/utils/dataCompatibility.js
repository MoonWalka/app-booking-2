/**
 * COMPATIBILITÉ DES DONNÉES
 * ========================
 * 
 * Assure la compatibilité entre l'ancien et le nouveau système
 * jusqu'à ce que toute l'app soit migrée
 */

/**
 * Lit une date depuis Firebase et ajoute les champs de compatibilité
 * pour que l'ancien code continue de fonctionner
 */
export function readDateWithCompatibility(dateData) {
  if (!dateData) return null;
  
  return {
    ...dateData,
    // Ajouter les anciens noms pour compatibilité
    organisateurId: dateData.structureId || dateData.organisateurId,
    organisateurNom: dateData.structureNom || dateData.organisateurNom,
    // Aussi pour l'artiste au cas où
    artiste: dateData.artisteId,
    // Et le montant
    montantPropose: dateData.montant,
    cachet: dateData.montant,
    // Et le statut
    status: dateData.statut
  };
}

/**
 * Lit une structure et ajoute les champs de compatibilité
 */
export function readStructureWithCompatibility(structureData) {
  if (!structureData) return null;
  
  return {
    ...structureData,
    // Les anciens noms
    nom: structureData.raisonSociale || structureData.nom,
    SIRET: structureData.siret,
    numeroSiret: structureData.siret,
    // Le signataire sous toutes ses formes
    nomSignataire: structureData.signataire,
    representant: structureData.signataire,
    contact: structureData.signataire,
    // La qualité aussi
    qualite: structureData.qualiteSignataire,
    fonction: structureData.qualiteSignataire
  };
}

/**
 * Prépare des données pour la sauvegarde en utilisant
 * uniquement les noms standards
 */
export function prepareForSave(type, data) {
  switch(type) {
    case 'date':
      return {
        date: data.date || data.dateOption || data.dateEvent,
        artisteId: data.artisteId || data.artiste,
        artisteNom: data.artisteNom || data.artisteName,
        projetId: data.projetId || data.projet?.id,
        projetNom: data.projetNom || data.projet?.nom,
        structureId: data.structureId || data.organisateurId,
        structureNom: data.structureNom || data.organisateurNom,
        lieuId: data.lieuId || data.lieu,
        lieuNom: data.lieuNom || data.lieu?.nom,
        montant: parseFloat(data.montant || data.montantPropose || data.cachet || 0),
        statut: data.statut || data.status || 'En cours',
        libelle: data.libelle || data.titre || ''
      };
      
    case 'structure':
      return {
        raisonSociale: data.raisonSociale || data.nom || data.nomOrga,
        siret: data.siret || data.SIRET || data.numeroSiret || data.siretOrga,
        email: data.email || data.emailOrga,
        telephone: data.telephone || data.tel || data.telephoneOrga,
        adresse: data.adresse || data.adresseOrga,
        codePostal: data.codePostal || data.cp || data.codePostalOrga,
        ville: data.ville || data.villeOrga,
        pays: data.pays || data.paysOrga || 'France',
        signataire: data.signataire || data.nomSignataire || data.representant || data.contact,
        qualiteSignataire: data.qualiteSignataire || data.qualite || data.fonction
      };
      
    default:
      return data;
  }
}