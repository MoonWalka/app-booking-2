/**
 * Utilitaires pour afficher des notifications toast
 */

/**
 * Affiche une notification de succès
 * @param {string} message - Le message à afficher
 */
export const showSuccessToast = (message) => {
  console.log('Success:', message);
  // Note: Dans une vraie implémentation, ceci utiliserait une bibliothèque de toast comme react-toastify
  // Exemple: toast.success(message);
  alert(`✅ ${message}`);
};

/**
 * Affiche une notification d'erreur
 * @param {string} message - Le message d'erreur à afficher
 */
export const showErrorToast = (message) => {
  console.error('Error:', message);
  // Note: Dans une vraie implémentation, ceci utiliserait une bibliothèque de toast comme react-toastify
  // Exemple: toast.error(message);
  alert(`❌ ${message}`);
};