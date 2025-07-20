import React from 'react';
import PropTypes from 'prop-types';
import AddressInput from './AddressInput'; // LocationIQ
import AddressInputGoogle from './AddressInputGoogle'; // Google Places

/**
 * Composant unifié pour l'autocomplétion d'adresses
 * Utilise Google Places par défaut, avec fallback sur LocationIQ
 * 
 * Configuration via variables d'environnement :
 * - REACT_APP_ADDRESS_PROVIDER : 'google' (défaut) ou 'locationiq'
 * - REACT_APP_GOOGLE_PLACES_API_KEY ou REACT_APP_FIREBASE_API_KEY : pour Google
 * - REACT_APP_LOCATIONIQ_API_KEY : pour LocationIQ
 */
const AddressInputUnified = (props) => {
  // Déterminer quel provider utiliser
  const getProvider = () => {
    // 1. Vérifier la variable d'environnement explicite
    const envProvider = process.env.REACT_APP_ADDRESS_PROVIDER;
    if (envProvider === 'locationiq') return 'locationiq';
    if (envProvider === 'google') return 'google';
    
    // 2. Auto-détection basée sur les clés API disponibles
    const hasGoogleKey = !!(process.env.REACT_APP_GOOGLE_PLACES_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY);
    const hasLocationIQKey = !!process.env.REACT_APP_LOCATIONIQ_API_KEY;
    
    // Préférer Google si disponible
    if (hasGoogleKey) return 'google';
    if (hasLocationIQKey) return 'locationiq';
    
    // Par défaut, essayer Google (au cas où la clé est fournie différemment)
    return 'google';
  };

  const provider = getProvider();
  
  // Afficher un avertissement en développement si aucune clé n'est configurée
  if (process.env.NODE_ENV === 'development') {
    const hasGoogleKey = !!(process.env.REACT_APP_GOOGLE_PLACES_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY);
    const hasLocationIQKey = !!process.env.REACT_APP_LOCATIONIQ_API_KEY;
    
    if (!hasGoogleKey && !hasLocationIQKey) {
      console.warn(
        'AddressInputUnified: Aucune clé API configurée pour l\'autocomplétion d\'adresses.\n' +
        'Configurez REACT_APP_GOOGLE_PLACES_API_KEY ou REACT_APP_LOCATIONIQ_API_KEY dans votre .env'
      );
    }
  }

  // Utiliser le bon composant selon le provider
  if (provider === 'locationiq') {
    return <AddressInput {...props} />;
  }
  
  return <AddressInputGoogle {...props} />;
};

AddressInputUnified.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onAddressSelected: PropTypes.func,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  dropdownClassName: PropTypes.string
};

export default AddressInputUnified;