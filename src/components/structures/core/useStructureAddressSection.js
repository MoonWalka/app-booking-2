// src/components/structures/core/useStructureAddressSection.js
import { useMemo } from 'react';

/**
 * Hook contenant la logique partagée pour l'affichage des adresses d'une structure
 * Peut être utilisé à la fois par les versions desktop et mobile
 * 
 * @param {Object} props - Données nécessaires
 * @param {Object} props.structure - Données de la structure
 * @param {Function} props.formatValue - Fonction pour formater les valeurs
 * @returns {Object} - Données et fonctions pour afficher l'adresse
 */
export const useStructureAddressSection = ({ structure, formatValue }) => {
  
  // Préparer les données de contact avec des liens - en respectant la règle des hooks
  const contactLinks = useMemo(() => {
    if (!structure) return null;
    
    return {
      telephone: structure.telephone ? {
        value: structure.telephone,
        href: `tel:${structure.telephone}`,
        icon: 'telephone'
      } : null,
      email: structure.email ? {
        value: structure.email,
        href: `mailto:${structure.email}`,
        icon: 'envelope'
      } : null,
      siteWeb: structure.siteWeb ? {
        value: structure.siteWeb,
        href: structure.siteWeb,
        icon: 'globe',
        external: true
      } : null
    };
  }, [structure]);

  // Extraire les données d'adresse formatées - en respectant la règle des hooks
  const addressData = useMemo(() => {
    if (!structure) return null;
    
    // Fonction locale pour éviter les problèmes de dépendances
    const localFormatValue = (value) => {
      if (formatValue && typeof formatValue === 'function') {
        return formatValue('default', value);
      }
      return value !== undefined && value !== null && value !== '' ? value : 'Non spécifié';
    };
    
    // Gérer le cas où structure.adresse est un objet
    let adresse, codePostal, ville, pays;
    
    if (structure.adresse && typeof structure.adresse === 'object') {
      // Si adresse est un objet avec les propriétés adresse, codePostal, ville, pays
      adresse = structure.adresse.adresse;
      codePostal = structure.adresse.codePostal;
      ville = structure.adresse.ville;
      pays = structure.adresse.pays;
    } else if (structure.adresseLieu && typeof structure.adresseLieu === 'object') {
      // Si on a un objet adresseLieu
      adresse = structure.adresseLieu.adresse;
      codePostal = structure.adresseLieu.codePostal;
      ville = structure.adresseLieu.ville;
      pays = structure.adresseLieu.pays;
    } else {
      // Sinon utiliser les propriétés directes
      adresse = structure.adresse;
      codePostal = structure.codePostal;
      ville = structure.ville;
      pays = structure.pays;
    }
    
    return {
      adresse: localFormatValue(adresse),
      codePostal: localFormatValue(codePostal),
      ville: localFormatValue(ville),
      pays: localFormatValue(pays)
    };
  }, [structure, formatValue]);

  // Vérifier si la structure existe après avoir défini tous les hooks
  const hasData = !!structure;

  // Retourner les données et fonctions nécessaires pour l'affichage
  return {
    hasData,
    addressData,
    contactLinks
  };
};

export default useStructureAddressSection;