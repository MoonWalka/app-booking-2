import * as Yup from 'yup';

/**
 * Schéma de validation pour la section structureCache d'un programmateur
 * Utilisé pour valider les informations de la structure associée
 */
export const StructureCacheSchema = Yup.object().shape({
  raisonSociale: Yup.string()
    .max(100, 'La raison sociale ne peut pas dépasser 100 caractères')
    .required('La raison sociale est requise'),
  type: Yup.string()
    .oneOf(['association', 'sarl', 'eurl', 'sas', 'collectivite', 'autre'], 'Type de structure non valide')
    .required('Le type de structure est requis'),
  adresse: Yup.string()
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  codePostal: Yup.string()
    .matches(/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres')
    .nullable(),
  ville: Yup.string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères'),
  pays: Yup.string()
    .default('France')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères'),
  siret: Yup.string()
    .matches(/^[0-9]{14}$/, 'Le numéro SIRET doit contenir 14 chiffres')
    .nullable(),
  tva: Yup.string()
    .max(20, 'Le numéro de TVA ne peut pas dépasser 20 caractères')
    .nullable(),
});

/**
 * Schéma complet pour un programmateur
 * Inclut les informations personnelles et les informations de structure
 */
export const ProgrammateurSchema = Yup.object().shape({
  nom: Yup.string()
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .required('Le nom est requis'),
  prenom: Yup.string()
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .required('Le prénom est requis'),
  email: Yup.string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  telephone: Yup.string()
    .matches(/^(\+33|0)[1-9](\d{2}){4}$/, 'Format de téléphone invalide')
    .nullable(),
  fonction: Yup.string()
    .max(100, 'La fonction ne peut pas dépasser 100 caractères')
    .nullable(),
  structureId: Yup.string().nullable(),
  structureCache: StructureCacheSchema.nullable(),
  adresse: Yup.string()
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .nullable(),
  codePostal: Yup.string()
    .matches(/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres')
    .nullable(),
  ville: Yup.string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .nullable(),
  pays: Yup.string()
    .default('France')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .nullable(),
  notes: Yup.string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .nullable(),
  tags: Yup.array()
    .of(Yup.string())
    .nullable(),
});

/**
 * Schéma spécifique pour la section légale d'un programmateur
 * Utilisé pour valider uniquement les informations légales (structure)
 */
export const ProgrammateurLegalSectionSchema = Yup.object().shape({
  structureCache: StructureCacheSchema
});

// Export par défaut avec nom de variable
const programmateurSchemas = {
  ProgrammateurSchema,
  StructureCacheSchema,
  ProgrammateurLegalSectionSchema
};

export default programmateurSchemas;