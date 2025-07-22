/**
 * MAPPER SIMPLE POUR LA COHÉRENCE DES VARIABLES
 * =============================================
 * 
 * Solution pragmatique : on garde les noms actuels mais on crée
 * des fonctions qui mappent automatiquement toutes les variations
 */

/**
 * Normalise les données d'une date peu importe leur source
 */
export function normaliserDate(data) {
  if (!data) return null;
  
  return {
    // On garde toujours les mêmes noms
    date: data.date || data.dateOption || data.dateEvent || '',
    artisteId: data.artisteId || data.artiste || '',
    artisteNom: data.artisteNom || data.artisteName || data.artiste?.nom || '',
    projetId: data.projetId || data.projet?.id || '',
    projetNom: data.projetNom || data.projet?.nom || data.projetIntitule || '',
    structureId: data.structureId || data.organisateurId || '',
    structureNom: data.structureNom || data.organisateurNom || '',
    montant: parseFloat(data.montant || data.montantPropose || data.cachet || 0),
    statut: data.statut || data.status || 'En cours',
    libelle: data.libelle || data.titre || ''
  };
}

/**
 * Normalise les données d'un contact/structure pour le contrat
 */
export function normaliserOrganisateur(data) {
  if (!data) return null;
  
  return {
    // Mapping des variations courantes - on cherche dans toutes les variantes possibles
    nom: data.nom || data.raisonSociale || data.structureNom || data.structureRaisonSociale || '',
    raisonSociale: data.raisonSociale || data.structureRaisonSociale || data.nom || data.structureNom || '',
    siret: data.siret || data.SIRET || data.numeroSiret || '',
    adresse: data.adresse || data.adresseComplete || '',
    codePostal: data.codePostal || data.cp || '',
    ville: data.ville || '',
    // Le fameux signataire avec toutes ses variations
    signataire: data.signataire || data.nomSignataire || data.contact || data.representant || '',
    qualiteSignataire: data.qualiteSignataire || data.qualite || data.fonction || ''
  };
}

/**
 * Prépare les données pour un contrat en unifiant toutes les sources
 */
export function preparerDonneesContrat(dateData, preContratData, structures = {}) {
  // Normaliser la date
  const dateNormalisee = normaliserDate(dateData);
  
  // Normaliser l'organisateur depuis plusieurs sources possibles
  const organisateur = normaliserOrganisateur({
    ...structures.organisateur,
    ...preContratData,
    // Priorité aux données du pré-contrat
    signataire: preContratData.signataire || preContratData.nomSignataire,
    qualiteSignataire: preContratData.qualiteSignataire || preContratData.fonction
  });
  
  return {
    date: dateNormalisee,
    organisateur: organisateur,
    // Ajouter d'autres mappings si nécessaire
  };
}

/**
 * Mapping pour les variables de template
 * Convertit nos variables internes vers les variables de template
 */
export function mapperPourTemplate(data) {
  const variables = {};
  
  // Organisateur
  if (data.organisateur) {
    const org = data.organisateur;
    variables['organisateur_nom'] = org.nom || org.raisonSociale || '';
    variables['organisateur_raison_sociale'] = org.raisonSociale || org.nom || '';
    variables['organisateur_siret'] = org.siret || '';
    variables['organisateur_adresse'] = org.adresse || '';
    variables['organisateur_suite_adresse'] = org.suiteAdresse || '';
    variables['organisateur_code_postal'] = org.codePostal || '';
    variables['organisateur_cp'] = org.codePostal || '';
    variables['organisateur_ville'] = org.ville || '';
    variables['organisateur_pays'] = org.pays || 'France';
    variables['organisateur_telephone'] = org.telephone || '';
    variables['organisateur_email'] = org.email || '';
    variables['organisateur_site'] = org.site || org.siteWeb || '';
    variables['organisateur_signataire'] = org.signataire || '';
    variables['organisateur_qualite'] = org.qualiteSignataire || org.qualite || '';
    variables['organisateur_numero_tva'] = org.numeroTva || org.tva || '';
    variables['organisateur_code_ape'] = org.codeApe || '';
    variables['organisateur_numero_licence'] = org.numeroLicence || '';
    
    // Compatibilité avec l'ancien format
    variables['contact_nom'] = org.nom || org.raisonSociale || '';
    variables['contact_siret'] = org.siret || '';
    variables['contact_signataire'] = org.signataire || '';
    variables['contact_representant'] = org.signataire || '';
    variables['contact_qualite_representant'] = org.qualiteSignataire || org.qualite || '';
    variables['structure_nom'] = org.raisonSociale || org.nom || '';
    variables['structure_siret'] = org.siret || '';
    variables['structure_adresse'] = org.adresse || '';
    variables['siret_entreprise'] = org.siret || '';
  }
  
  // Producteur
  if (data.producteur) {
    const prod = data.producteur;
    variables['producteur_raison_sociale'] = prod.raisonSociale || '';
    variables['producteur_adresse'] = prod.adresse || '';
    variables['producteur_code_postal'] = prod.codePostal || '';
    variables['producteur_ville'] = prod.ville || '';
    variables['producteur_siret'] = prod.siret || '';
    variables['producteur_numero_tva'] = prod.numeroTva || '';
    variables['producteur_code_ape'] = prod.codeApe || '';
    variables['producteur_numero_licence'] = prod.numeroLicence || '';
    variables['producteur_telephone'] = prod.telephone || '';
    variables['producteur_email'] = prod.email || '';
    variables['producteur_site'] = prod.site || '';
    variables['producteur_signataire'] = prod.signataire || '';
    variables['producteur_qualite'] = prod.qualite || '';
  }
  
  // Date/Événement
  if (data.date) {
    const dateObj = data.date;
    // Formater la date si nécessaire
    let dateFormatee = dateObj.date || '';
    if (dateFormatee && dateFormatee.includes('-')) {
      // Convertir YYYY-MM-DD en DD/MM/YYYY
      const [year, month, day] = dateFormatee.split('-');
      dateFormatee = `${day}/${month}/${year}`;
    }
    
    variables['date_date'] = dateFormatee;
    variables['date_concert'] = dateFormatee;
    variables['concert_date'] = dateFormatee;
    variables['date_titre'] = dateObj.titre || dateObj.libelle || '';
    variables['date_heure'] = dateObj.heure || '';
  }
  
  // Artiste
  if (data.artiste) {
    variables['artiste_nom'] = data.artiste.artisteNom || data.date?.artisteNom || '';
    variables['artiste_genre'] = data.artiste.genre || '';
  } else if (data.date?.artisteNom) {
    variables['artiste_nom'] = data.date.artisteNom || '';
  }
  
  // Lieu
  if (data.lieu) {
    variables['lieu_nom'] = data.lieu.nom || '';
    variables['lieu_adresse'] = data.lieu.adresse || '';
    variables['lieu_code_postal'] = data.lieu.codePostal || '';
    variables['lieu_ville'] = data.lieu.ville || '';
  } else if (data.date?.lieuNom) {
    variables['lieu_nom'] = data.date.lieuNom || data.date.libelle || '';
  }
  
  // Montants et prix
  if (data.date?.montant) {
    const montant = parseFloat(data.date.montant) || 0;
    variables['date_montant'] = montant.toFixed(2).replace('.', ',') + ' €';
    variables['date_montant_lettres'] = montantEnLettres(montant);
  }
  
  // Règlement
  if (data.reglement) {
    const montantHT = parseFloat(data.reglement.montantHT) || 0;
    const tauxTVA = parseFloat(data.reglement.tauxTVA) || 0;
    const montantTVA = montantHT * (tauxTVA / 100);
    const totalTTC = montantHT + montantTVA;
    
    variables['montant_ht'] = montantHT.toFixed(2).replace('.', ',') + ' €';
    variables['taux_tva'] = tauxTVA + '%';
    variables['montant_tva'] = montantTVA.toFixed(2).replace('.', ',') + ' €';
    variables['total_ttc'] = totalTTC.toFixed(2).replace('.', ',') + ' €';
    variables['total_ttc_lettres'] = montantEnLettres(totalTTC);
    variables['montant_ttc'] = totalTTC.toFixed(2).replace('.', ',') + ' €';
  }
  
  return variables;
}

/**
 * Convertit un montant en lettres
 */
function montantEnLettres(montant) {
  // Fonction simplifiée - peut être améliorée
  const entier = Math.floor(montant);
  const decimales = Math.round((montant - entier) * 100);
  
  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const centaine = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];
  const millier = ['', 'mille', 'deux mille', 'trois mille', 'quatre mille', 'cinq mille', 'six mille', 'sept mille', 'huit mille', 'neuf mille'];
  
  // Simplification pour les montants courants
  if (entier === 0) return 'zéro euro';
  if (entier < 10) return unite[entier] + ' euro' + (entier > 1 ? 's' : '');
  if (entier < 100) {
    const d = Math.floor(entier / 10);
    const u = entier % 10;
    return dizaine[d] + (u > 0 ? '-' + unite[u] : '') + ' euros';
  }
  if (entier < 1000) {
    const c = Math.floor(entier / 100);
    const reste = entier % 100;
    return centaine[c] + (reste > 0 ? ' ' + montantEnLettres(reste).replace(' euros', '') : '') + ' euros';
  }
  if (entier < 10000) {
    const m = Math.floor(entier / 1000);
    const reste = entier % 1000;
    return millier[m] + (reste > 0 ? ' ' + montantEnLettres(reste).replace(' euros', '') : '') + ' euros';
  }
  
  // Pour les montants plus élevés, utiliser le format numérique
  return entier.toString() + ' euros';
}

/**
 * Remplace les variables dans un template
 * Supporte les deux formats : [variable] et {variable}
 */
export function remplacerVariables(template, data) {
  const variables = mapperPourTemplate(data);
  let result = template;
  
  // Remplacer chaque variable
  Object.entries(variables).forEach(([key, value]) => {
    // Format [variable]
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value || '');
    // Format {variable}
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  });
  
  return result;
}