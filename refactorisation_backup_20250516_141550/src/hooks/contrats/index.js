// src/hooks/contrats/index.js

// Export du hook original (maintenant un wrapper)
export { default as useContratDetails } from './useContratDetails';

// Export de la version migrée avec son nom original
export { default as useContratDetailsMigrated } from './useContratDetailsMigrated';

/**
 * @recommended La version migrée du hook useContratDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useContratDetailsV2 } from './useContratDetailsMigrated';

// Exports des hooks liés aux modèles de contrats
export { default as useContratTemplateEditor } from './useContratTemplateEditor';
export { default as useContratTemplatePreview } from './useContratTemplatePreview';

// Exports des hooks liés à la génération de contrats
export { default as useContratGenerator } from './useContratGenerator';
export { default as usePdfPreview } from './usePdfPreview';

// Exports des hooks d'actions et utilitaires
export { default as useContratActions } from './useContratActions';
export { default as useContractTemplates } from './useContractTemplates';

// Export des variables de contrat
export { 
  bodyVariables,
  headerFooterVariables,
  signatureVariables,
  templateTypes,
  replaceVariablesWithMockData 
} from './contractVariables';

export { default as useContratFormOptimized } from './useContratFormOptimized';
