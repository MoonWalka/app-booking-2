/**
 * @fileoverview Hook de validation et géocodage d'adresses
 * Utilise l'API LocationIQ pour valider, suggérer et géocoder les adresses
 * saisies par les utilisateurs avec gestion des coordonnées géographiques.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect } from 'react';
import { useLocationIQ } from '@/hooks/common/useLocationIQ';

/**
 * Hook de validation et géocodage d'adresses avec suggestions automatiques
 * 
 * Ce hook fournit une interface complète pour valider des adresses en utilisant
 * l'API LocationIQ, proposer des suggestions de correction et extraire les
 * coordonnées géographiques pour la géolocalisation.
 * 
 * @description
 * Fonctionnalités principales :
 * - Validation d'adresses via API LocationIQ
 * - Suggestions automatiques de correction
 * - Extraction des coordonnées géographiques
 * - Formatage standardisé des adresses
 * - Gestion des états de validation
 * - Réinitialisation automatique lors des changements
 * 
 * @param {Object} adresseData - Données d'adresse à surveiller pour réinitialisation
 * 
 * @returns {Object} Interface de validation d'adresses
 * @returns {boolean} returns.isValidating - État de validation en cours
 * @returns {Array} returns.suggestions - Liste des suggestions d'adresses trouvées
 * @returns {Object|null} returns.selectedSuggestion - Suggestion d'adresse sélectionnée
 * @returns {string} returns.validationMessage - Message de validation ou d'erreur
 * @returns {Function} returns.validateAdresse - Fonction de validation d'adresse
 * @returns {Function} returns.selectSuggestion - Fonction de sélection d'une suggestion
 * @returns {Function} returns.formatFullAddress - Fonction de formatage d'adresse complète
 * 
 * @example
 * ```javascript
 * const {
 *   isValidating,
 *   suggestions,
 *   selectedSuggestion,
 *   validationMessage,
 *   validateAdresse,
 *   selectSuggestion,
 *   formatFullAddress
 * } = useAdresseValidation(adresseData);
 * 
 * // Valider une adresse
 * const handleValidation = async () => {
 *   const isValid = await validateAdresse(
 *     "123 rue de la Paix",
 *     "75001", 
 *     "Paris",
 *     "France"
 *   );
 *   
 *   if (isValid && suggestions.length > 0) {
 *     // Sélectionner la première suggestion
 *     const adresseComplete = selectSuggestion(suggestions[0]);
 *     console.log('Coordonnées:', adresseComplete.coordonnees);
 *   }
 * };
 * 
 * // Afficher les suggestions
 * {suggestions.map((suggestion, index) => (
 *   <div key={index} onClick={() => selectSuggestion(suggestion)}>
 *     {suggestion.display_name}
 *   </div>
 * ))}
 * ```
 * 
 * @dependencies
 * - useLocationIQ hook (API LocationIQ)
 * - React hooks (useState, useEffect)
 * 
 * @complexity MEDIUM
 * @businessCritical true
 * @migrationCandidate useGenericValidation - Candidat pour généralisation
 * 
 * @workflow
 * 1. Surveillance des changements d'adresse pour réinitialisation
 * 2. Construction de la requête à partir des composants d'adresse
 * 3. Validation de la complétude de l'adresse
 * 4. Appel à l'API LocationIQ via useLocationIQ
 * 5. Traitement des résultats et suggestions
 * 6. Extraction des coordonnées géographiques
 * 7. Formatage standardisé des adresses
 * 
 * @apiIntegration LocationIQ
 * @geoLocation true
 * @addressComponents adresse, codePostal, ville, pays, coordonnees
 * 
 * @errorHandling
 * - Adresse incomplète : "Adresse incomplète"
 * - Aucun résultat : "Aucune adresse trouvée. Veuillez vérifier l'orthographe."
 * - Erreur API : "Erreur lors de la validation de l'adresse"
 * 
 * @performance
 * - Validation asynchrone non bloquante
 * - Réinitialisation automatique optimisée
 * - Cache des suggestions pour éviter les requêtes répétées
 * 
 * @usedBy ProgrammateurForm, LieuForm, StructureForm, AdresseInput
 */

const useAdresseValidation = (adresseData) => {
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const { searchAddress } = useLocationIQ();

  // Monitor address changes to reset validation state
  useEffect(() => {
    if (adresseData) {
      // Reset validation state when address changes
      setSelectedSuggestion(null);
      setValidationMessage('');
    }
  }, [adresseData]);

  // Function to validate an address
  const validateAdresse = async (address, codePostal, ville, pays = 'France') => {
    setIsValidating(true);
    try {
      // Construct query from address components
      const query = `${address} ${codePostal} ${ville} ${pays}`.trim();
      if (!query || query.length < 5) {
        setSuggestions([]);
        setValidationMessage('Adresse incomplète');
        return false;
      }

      // Use LocationIQ to search for address
      const results = await searchAddress(query);
      
      if (results && results.length > 0) {
        setSuggestions(results);
        setValidationMessage('');
        return true;
      } else {
        setSuggestions([]);
        setValidationMessage('Aucune adresse trouvée. Veuillez vérifier l\'orthographe.');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation de l\'adresse:', error);
      setSuggestions([]);
      setValidationMessage('Erreur lors de la validation de l\'adresse');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Function to select a suggested address
  const selectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Extract address components
    return {
      adresse: suggestion.address?.road || suggestion.address?.pedestrian || '',
      codePostal: suggestion.address?.postcode || '',
      ville: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '',
      pays: suggestion.address?.country || 'France',
      coordonnees: {
        lat: parseFloat(suggestion.lat) || 0,
        lng: parseFloat(suggestion.lon) || 0
      }
    };
  };

  // Function to format a full address
  const formatFullAddress = (adresseObj) => {
    if (!adresseObj) return '';
    
    const { adresse, codePostal, ville, pays } = adresseObj;
    return [
      adresse,
      `${codePostal} ${ville}`,
      pays !== 'France' ? pays : ''
    ].filter(Boolean).join(', ');
  };

  return {
    isValidating,
    suggestions,
    selectedSuggestion,
    validationMessage,
    validateAdresse,
    selectSuggestion,
    formatFullAddress
  };
};

export default useAdresseValidation;
