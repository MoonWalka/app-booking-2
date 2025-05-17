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
    
    return {
      adresse: formatValue(structure.adresse),
      codePostal: formatValue(structure.codePostal),
      ville: formatValue(structure.ville),
      pays: formatValue(structure.pays)
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