import { useState, useRef } from 'react';

/**
 * Hook personnalisé pour gérer les variables de modèle de contrat
 * et leur insertion dans les différents champs de l'éditeur
 */
const useTemplateVariables = () => {
  // Références pour les menus déroulants de variables
  const titleVarsRef = useRef(null);
  const headerVarsRef = useRef(null);
  const bodyVarsRef = useRef(null);
  const footerVarsRef = useRef(null);
  const signatureVarsRef = useRef(null);
  
  // État pour gérer l'ouverture des menus déroulants
  const [dropdownState, setDropdownState] = useState({
    title: false,
    header: false,
    body: false,
    footer: false,
    signature: false
  });

  // Listes des variables disponibles par catégories
  const titleVariables = [
    { label: 'Contact', value: 'programmateur_nom' }, // Variable rétrocompatible
    { label: 'Structure du contact', value: 'programmateur_structure_nom' }, // Variable rétrocompatible
    { label: 'Artiste', value: 'artiste_nom' },
    { label: 'Structure de l\'artiste', value: 'artiste_structure_nom' },
    { label: 'Type d\'événement', value: 'concert_type' }
  ];
  
  const headerFooterVariables = [
    { label: 'Nom de la structure', value: 'structure_nom' },
    { label: 'Adresse', value: 'structure_adresse' },
    { label: 'Email', value: 'structure_email' },
    { label: 'Téléphone', value: 'structure_telephone' },
    { label: 'Site Web', value: 'structure_site_web' },
    { label: 'SIRET', value: 'structure_siret' },
    { label: 'Licence', value: 'structure_licence' }
  ];
  
  const bodyVariables = [
    // Variables de base
    { label: 'Date du concert', value: 'concert_date' },
    { label: 'Heure du concert', value: 'concert_heure' },
    { label: 'Lieu du concert', value: 'lieu_nom' },
    { label: 'Adresse du lieu', value: 'lieu_adresse' },
    
    // Variables contact (rétrocompatibilité - utilisent les variables programmateur_*)
    { label: 'Contact - Nom', value: 'programmateur_nom' },
    { label: 'Contact - Email', value: 'programmateur_email' },
    { label: 'Contact - Téléphone', value: 'programmateur_telephone' },
    { label: 'Contact - Structure', value: 'programmateur_structure_nom' },
    
    // Variables Artiste
    { label: 'Artiste - Nom', value: 'artiste_nom' },
    { label: 'Artiste - Représentant', value: 'artiste_representant' },
    { label: 'Artiste - Structure', value: 'artiste_structure_nom' },
    { label: 'Artiste - SIRET', value: 'artiste_structure_siret' },
    
    // Variables Financières
    { label: 'Montant cache', value: 'montant_cache' },
    { label: 'Montant cache (en lettres)', value: 'montant_cache_lettres' },
    { label: 'Mode de paiement', value: 'mode_paiement' },
    { label: 'Délai de paiement', value: 'delai_paiement' }
  ];
  
  const signatureVariables = [
    { label: 'Lieu de signature', value: 'lieu_nom' },
    { label: 'Date de signature', value: 'date_signature' },
    { label: 'Contact - Nom', value: 'programmateur_nom' }, // Variable rétrocompatible
    { label: 'Contact - Fonction', value: 'programmateur_fonction' }, // Variable rétrocompatible
    { label: 'Contact - Structure', value: 'programmateur_structure_nom' }, // Variable rétrocompatible
    { label: 'Artiste - Nom', value: 'artiste_nom' },
    { label: 'Artiste - Représentant', value: 'artiste_representant' },
    { label: 'Artiste - Fonction du représentant', value: 'artiste_representant_fonction' },
    { label: 'Artiste - Structure', value: 'artiste_structure_nom' }
  ];

  // Méthode pour basculer l'état d'un menu déroulant
  const toggleDropdown = (menuName) => {
    setDropdownState(prevState => ({
      ...Object.keys(prevState).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [menuName]: !prevState[menuName]
    }));
  };
  
  // Méthode pour insérer une variable à la position du curseur
  const insertVariable = (variable, targetId, setterFunction, currentValue) => {
    // Format de la variable à insérer : {nom_variable}
    const variableText = `{${variable}}`;
    
    // Récupération de l'élément cible
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Récupération de la position du curseur
      const start = targetElement.selectionStart;
      const end = targetElement.selectionEnd;
      
      // Insertion de la variable à la position du curseur
      const newText = currentValue.substring(0, start) + 
                      variableText + 
                      currentValue.substring(end);
      
      // Mise à jour du contenu
      setterFunction(newText);
      
      // Fermeture du menu déroulant
      setDropdownState(prev => ({ ...prev, [targetId.split('Content')[0]]: false }));
      
      // Focus et positionnement du curseur après la variable insérée
      setTimeout(() => {
        targetElement.focus();
        targetElement.selectionStart = start + variableText.length;
        targetElement.selectionEnd = start + variableText.length;
      }, 0);
    }
  };

  return {
    // Références pour les menus déroulants
    titleVarsRef,
    headerVarsRef,
    bodyVarsRef,
    footerVarsRef,
    signatureVarsRef,
    
    // État des menus déroulants
    dropdownState,
    titleVarsOpen: dropdownState.title,
    headerVarsOpen: dropdownState.header,
    bodyVarsOpen: dropdownState.body,
    footerVarsOpen: dropdownState.footer,
    signatureVarsOpen: dropdownState.signature,
    
    // Méthodes
    toggleDropdown: (name) => toggleDropdown(name),
    insertVariable,
    
    // Listes des variables
    titleVariables,
    headerFooterVariables,
    bodyVariables,
    signatureVariables
  };
};

export default useTemplateVariables;