/**
 * Utilitaires de détection de migration des contacts
 * Version corrigée pour éviter les faux positifs
 */

/**
 * Détecte le statut de migration d'un contact avec une logique robuste
 * @param {Object} contactData - Données du contact
 * @returns {string} - 'fully-migrated' | 'partially-migrated' | 'legacy-migrated' | 'not-migrated'
 */
export const detectMigrationStatus = (contactData) => {
  // Vérifier la présence du marqueur de migration explicite
  if (contactData.migrationVersion === 'unified-v1') {
    return 'fully-migrated';
  }
  
  // Compter les sections présentes pour déterminer le niveau de migration
  const sectionChecks = {
    structure: !!(contactData.structureRaisonSociale || contactData.structureAdresse || contactData.structureEmail),
    personne1: !!(contactData.prenom && contactData.nom),
    personne2: !!(contactData.prenom2 || contactData.nom2 || contactData.civilite2),
    personne3: !!(contactData.prenom3 || contactData.nom3 || contactData.civilite3),
    diffusion: !!(contactData.nomFestival || contactData.periodeFestivalMois || contactData.bouclage),
    salle: !!(contactData.salleNom || contactData.salleAdresse || contactData.salleJauge1),
    qualifications: !!(contactData.tags || contactData.source || contactData.client !== undefined),
    metadata: !!(contactData.createdAt || contactData.updatedAt)
  };
  
  const presentSections = Object.values(sectionChecks).filter(Boolean).length;
  
  // Si moins de 3 sections présentes, probablement pas migré
  if (presentSections < 3) {
    return 'not-migrated';
  }
  
  // Si 3-5 sections présentes, partiellement migré
  if (presentSections < 6) {
    return 'partially-migrated';
  }
  
  // Si 6+ sections mais pas de marqueur, migration incomplète
  return 'legacy-migrated';
};

/**
 * Vérifie si un contact est complètement migré
 * @param {Object} contactData - Données du contact
 * @returns {boolean}
 */
export const isFullyMigrated = (contactData) => {
  return detectMigrationStatus(contactData) === 'fully-migrated';
};

/**
 * Vérifie si un contact nécessite une migration
 * @param {Object} contactData - Données du contact
 * @returns {boolean}
 */
export const needsMigration = (contactData) => {
  const status = detectMigrationStatus(contactData);
  return status !== 'fully-migrated';
};

/**
 * Analyse détaillée d'un contact pour diagnostic
 * @param {Object} contactData - Données du contact
 * @returns {Object} - Analyse complète
 */
export const analyzeContact = (contactData) => {
  const status = detectMigrationStatus(contactData);
  
  const sections = {
    structure: {
      present: !!(contactData.structureRaisonSociale || contactData.structureAdresse || contactData.structureEmail),
      fields: {
        structureRaisonSociale: !!contactData.structureRaisonSociale,
        structureAdresse: !!contactData.structureAdresse,
        structureEmail: !!contactData.structureEmail,
        structureType: !!contactData.structureType,
        structureSiret: !!contactData.structureSiret
      }
    },
    personne1: {
      present: !!(contactData.prenom && contactData.nom),
      fields: {
        prenom: !!contactData.prenom,
        nom: !!contactData.nom,
        email: !!contactData.email || !!contactData.mailDirect,
        telephone: !!contactData.telephone || !!contactData.telDirect
      }
    },
    personne2: {
      present: !!(contactData.prenom2 || contactData.nom2 || contactData.civilite2),
      fields: {
        prenom2: !!contactData.prenom2,
        nom2: !!contactData.nom2,
        civilite2: !!contactData.civilite2
      }
    },
    personne3: {
      present: !!(contactData.prenom3 || contactData.nom3 || contactData.civilite3),
      fields: {
        prenom3: !!contactData.prenom3,
        nom3: !!contactData.nom3,
        civilite3: !!contactData.civilite3
      }
    },
    diffusion: {
      present: !!(contactData.nomFestival || contactData.periodeFestivalMois || contactData.bouclage),
      fields: {
        nomFestival: !!contactData.nomFestival,
        periodeFestivalMois: !!contactData.periodeFestivalMois,
        bouclage: !!contactData.bouclage
      }
    },
    salle: {
      present: !!(contactData.salleNom || contactData.salleAdresse || contactData.salleJauge1),
      fields: {
        salleNom: !!contactData.salleNom,
        salleAdresse: !!contactData.salleAdresse,
        salleJauge1: !!contactData.salleJauge1
      }
    },
    qualifications: {
      present: !!(contactData.tags || contactData.source || contactData.client !== undefined),
      fields: {
        tags: !!contactData.tags,
        source: !!contactData.source,
        client: contactData.client !== undefined
      }
    },
    metadata: {
      present: !!(contactData.createdAt || contactData.updatedAt),
      fields: {
        createdAt: !!contactData.createdAt,
        updatedAt: !!contactData.updatedAt,
        migrationVersion: !!contactData.migrationVersion,
        migrationDate: !!contactData.migrationDate
      }
    }
  };
  
  const presentSections = Object.values(sections).filter(section => section.present).length;
  
  return {
    migrationStatus: status,
    sectionsPresent: presentSections,
    sectionsTotal: Object.keys(sections).length,
    sections,
    recommendations: generateRecommendations(status, sections),
    migrationRequired: needsMigration(contactData)
  };
};

/**
 * Génère des recommandations basées sur l'analyse
 * @param {string} status - Statut de migration
 * @param {Object} sections - Analyse des sections
 * @returns {Array} - Liste de recommandations
 */
const generateRecommendations = (status, sections) => {
  const recommendations = [];
  
  switch (status) {
    case 'not-migrated':
      recommendations.push('Contact non migré - Migration complète recommandée');
      break;
    case 'partially-migrated':
      recommendations.push('Contact partiellement migré - Compléter la migration');
      break;
    case 'legacy-migrated':
      recommendations.push('Contact migré sans marqueur - Ajouter le marqueur de version');
      break;
    case 'fully-migrated':
      recommendations.push('Contact complètement migré - Aucune action requise');
      break;
  }
  
  // Recommandations spécifiques par section
  if (!sections.personne1.present) {
    recommendations.push('Ajouter les informations de base (prénom/nom)');
  }
  
  if (!sections.metadata.fields.migrationVersion) {
    recommendations.push('Ajouter le marqueur de migration unified-v1');
  }
  
  if (sections.structure.present && !sections.structure.fields.structureType) {
    recommendations.push('Compléter les informations de structure (type)');
  }
  
  return recommendations;
};

/**
 * Cas de test pour valider la logique
 */
export const testCases = {
  contactNonMigre: {
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean@example.com'
  },
  contactPartiellementMigre: {
    prenom: 'Marie',
    nom: 'Martin',
    structureRaisonSociale: 'Ma Société',
    email: 'marie@example.com'
  },
  contactLegacyMigre: {
    prenom: 'Paul',
    nom: 'Durand',
    structureRaisonSociale: 'Structure Inc',
    salleNom: 'Salle Principale',
    nomFestival: 'Festival Test',
    tags: ['Festival'],
    createdAt: new Date()
  },
  contactComplètementMigre: {
    migrationVersion: 'unified-v1',
    migrationDate: new Date(),
    prenom: 'Sophie',
    nom: 'Bernard',
    structureRaisonSociale: 'Structure Complète',
    salleNom: 'Salle Complète',
    nomFestival: 'Festival Complet',
    tags: ['Festival'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Tests automatiques
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🧪 Tests de détection de migration');
  Object.entries(testCases).forEach(([name, contact]) => {
    const analysis = analyzeContact(contact);
    console.log(`${name}:`, analysis.migrationStatus, analysis.recommendations);
  });
}