// src/hooks/common/useLocationIQ.js
// Hook utilitaire pour accéder à l'API LocationIQ de façon sécurisée
// Utilise uniquement la variable d'environnement REACT_APP_LOCATIONIQ_API_KEY

const API_KEY = process.env.REACT_APP_LOCATIONIQ_API_KEY;
if (!API_KEY) {
  throw new Error('La clé API LocationIQ (REACT_APP_LOCATIONIQ_API_KEY) est manquante dans votre environnement.');
}

const BASE_URL = 'https://eu1.locationiq.com/v1';

/**
 * Effectue une requête d'autocomplétion d'adresse via LocationIQ
 * @param {string} query - La chaîne à autocompléter
 * @returns {Promise<Array>} Résultats d'autocomplétion
 */
export async function autocompleteAddress(query) {
  if (!query) return [];
  const url = `${BASE_URL}/autocomplete.php?key=${API_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur LocationIQ');
  return await response.json();
}

/**
 * Effectue un géocodage direct (adresse → coordonnées)
 * @param {string} address
 * @returns {Promise<Object>} Résultat du géocodage
 */
export async function geocodeAddress(address) {
  if (!address) return null;
  const url = `${BASE_URL}/search.php?key=${API_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur LocationIQ');
  const data = await response.json();
  return data[0] || null;
}

/**
 * Effectue un géocodage inverse (coordonnées → adresse)
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Résultat du géocodage inverse
 */
export async function reverseGeocode(lat, lon) {
  if (!lat || !lon) return null;
  const url = `${BASE_URL}/reverse.php?key=${API_KEY}&lat=${lat}&lon=${lon}&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur LocationIQ');
  return await response.json();
}

// Hook principal (pour compatibilité)
export function useLocationIQ() {
  return {
    autocompleteAddress,
    geocodeAddress,
    reverseGeocode,
    // Alias pour compatibilité avec le code existant
    searchAddress: autocompleteAddress,
    error: null // Placeholder pour compatibilité
  };
} 