// Ce hook n'est plus utilisé pour la gestion des textarea dans l'app contrats. À supprimer ou archiver si besoin.

// (Aucune logique textarea à conserver)

import { useState, useRef, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer la logique des menus déroulants de variables
 */
export const useVariablesDropdown = () => {
  // États pour les menus dropdown des variables
  const [headerVarsOpen, setHeaderVarsOpen] = useState(false);
  const [bodyVarsOpen, setBodyVarsOpen] = useState(false);
  const [footerVarsOpen, setFooterVarsOpen] = useState(false);
  const [signatureVarsOpen, setSignatureVarsOpen] = useState(false);
  
  // Référence pour fermer les dropdowns au clic à l'extérieur
  const headerVarsRef = useRef(null);
  const bodyVarsRef = useRef(null);
  const footerVarsRef = useRef(null);
  const signatureVarsRef = useRef(null);
  
  // Variables disponibles par section
  const bodyVariables = [
    "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret",
    "artiste_nom", "artiste_genre",
    "concert_titre", "concert_date", "concert_montant",
    "lieu_nom", "lieu_adresse", "lieu_code_postal", "lieu_ville", "lieu_capacite",
    "date_jour", "date_mois", "date_annee", "date_complete"
  ];

  const headerFooterVariables = [
    "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret", "artiste_nom"
  ];

  const signatureVariables = [
    "programmateur_nom", "programmateur_structure", "artiste_nom", "lieu_ville",
    "date_jour", "date_mois", "date_annee", "date_complete"
  ];

  // Gestion du clic à l'extérieur pour fermer les dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerVarsRef.current && !headerVarsRef.current.contains(event.target)) {
        setHeaderVarsOpen(false);
      }
      if (bodyVarsRef.current && !bodyVarsRef.current.contains(event.target)) {
        setBodyVarsOpen(false);
      }
      if (footerVarsRef.current && !footerVarsRef.current.contains(event.target)) {
        setFooterVarsOpen(false);
      }
      if (signatureVarsRef.current && !signatureVarsRef.current.contains(event.target)) {
        setSignatureVarsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Fonction pour basculer l'état d'un menu dropdown spécifique
  const toggleDropdown = (targetId) => {
    switch (targetId) {
      case 'headerContent':
        setHeaderVarsOpen(!headerVarsOpen);
        break;
      case 'bodyContent':
        setBodyVarsOpen(!bodyVarsOpen);
        break;
      case 'footerContent':
        setFooterVarsOpen(!footerVarsOpen);
        break;
      case 'signatureTemplate':
        setSignatureVarsOpen(!signatureVarsOpen);
        break;
      default:
        break;
    }
  };
  
  // Fonction pour insérer une variable dans un contenu (HTML ou texte)
  const insertVariable = (variable, targetId, setContent, content) => {
    if (targetId === 'bodyContent' || targetId === 'headerContent' || targetId === 'footerContent') {
      // Pour ReactQuill, nous devons insérer le HTML directement
      // Cette approche est simplifiée - pour une implémentation réelle, vous auriez besoin d'utiliser l'API Quill
      setContent(content + `{${variable}}`);
    } else {
      // Pour les textarea normaux, obtenir la position actuelle du curseur
      const textarea = document.getElementById(targetId);
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = content.substring(0, start) + `{${variable}}` + content.substring(end);
      setContent(newValue);
      
      // Remettre le focus et la position du curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 50);
    }
    
    // Fermer le dropdown après insertion
    switch (targetId) {
      case 'headerContent':
        setHeaderVarsOpen(false);
        break;
      case 'bodyContent':
        setBodyVarsOpen(false);
        break;
      case 'footerContent':
        setFooterVarsOpen(false);
        break;
      case 'signatureTemplate':
        setSignatureVarsOpen(false);
        break;
      default:
        break;
    }
  };
  
  return {
    headerVarsOpen,
    bodyVarsOpen,
    footerVarsOpen,
    signatureVarsOpen,
    headerVarsRef,
    bodyVarsRef,
    footerVarsRef,
    signatureVarsRef,
    bodyVariables,
    headerFooterVariables,
    signatureVariables,
    toggleDropdown,
    insertVariable
  };
};