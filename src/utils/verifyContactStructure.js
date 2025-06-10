/**
 * Utilitaire pour vérifier que les contacts ont la bonne structure
 * et corriger automatiquement si nécessaire
 */

export const verifyContactStructure = (data, entityType) => {
  console.log('🔍 VÉRIFICATION STRUCTURE', entityType, ':', data);
  
  // Vérifier si c'est un contact
  if (entityType !== 'contacts') {
    return data;
  }
  
  // DÉTECTION DE STRUCTURE IMBRIQUÉE
  if (data.contact || data.structure) {
    console.error('❌❌❌ STRUCTURE IMBRIQUÉE DÉTECTÉE !');
    console.error('Contact imbriqué:', data.contact);
    console.error('Structure imbriquée:', data.structure);
    
    // CORRECTION AUTOMATIQUE
    const correctedData = {
      // Identité (TOUT au niveau racine)
      nom: data.nom || data.contact?.nom || '',
      prenom: data.prenom || data.contact?.prenom || '',
      email: data.email || data.contact?.email || '',
      telephone: data.telephone || data.contact?.telephone || '',
      fonction: data.fonction || data.contact?.fonction || '',
      
      // Structure (avec préfixe, PAS dans un objet)
      structureId: data.structureId || '',
      structureNom: data.structureNom || data.structure?.nom || '',
      structureRaisonSociale: data.structureRaisonSociale || data.structure?.raisonSociale || '',
      structureSiret: data.structureSiret || data.structure?.siret || '',
      structureAdresse: data.structureAdresse || data.structure?.adresse || '',
      structureCodePostal: data.structureCodePostal || data.structure?.codePostal || '',
      structureVille: data.structureVille || data.structure?.ville || '',
      structurePays: data.structurePays || data.structure?.pays || 'France',
      
      // Bidirectionnalité
      concertsIds: data.concertsIds || [],
      lieuxIds: data.lieuxIds || [],
      artistesIds: data.artistesIds || [],
      
      // Multi-org
      organizationId: data.organizationId,
      
      // Métadonnées
      createdAt: data.createdAt,
      updatedAt: data.updatedAt || new Date(),
      
      // Autres champs
      notes: data.notes || '',
      tags: data.tags || [],
      statut: data.statut || 'actif'
    };
    
    console.log('✅ STRUCTURE CORRIGÉE:', correctedData);
    return correctedData;
  }
  
  // Structure déjà plate
  console.log('✅ Structure déjà plate - OK');
  return data;
};

/**
 * Vérifier si un contact a la structure correcte
 */
export const isContactStructureValid = (contact) => {
  // Un contact valide NE DOIT PAS avoir de champs imbriqués
  if (contact.contact || contact.structure) {
    console.error('❌ Contact invalide - structure imbriquée détectée');
    return false;
  }
  
  // Un contact valide DOIT avoir un organizationId
  if (!contact.organizationId) {
    console.error('❌ Contact invalide - organizationId manquant');
    return false;
  }
  
  // Un contact valide DOIT avoir au moins un nom
  if (!contact.nom) {
    console.error('❌ Contact invalide - nom manquant');
    return false;
  }
  
  console.log('✅ Contact valide');
  return true;
};