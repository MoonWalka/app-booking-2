import * as Yup from 'yup';

/**
 * Schéma complet pour un contact
 * Utilise maintenant structureId au lieu de structureCache (approche moderne)
 */
export const ContactSchema = Yup.object().shape({
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
  structureId: Yup.string().nullable(), // Référence vers une structure séparée
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

// Export par défaut avec nom de variable
const contactSchemas = {
  ContactSchema
};

export default contactSchemas;