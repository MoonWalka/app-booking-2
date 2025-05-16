/**
 * Gets the CSS class for the badge based on structure type
 * 
 * @param {string} type - Structure type
 * @returns {string} CSS class name for the badge
 */
export const getBadgeClass = (type) => {
  switch (type) {
    case 'association':
      return 'badgeSuccess';
    case 'entreprise':
      return 'badgePrimary';
    case 'administration':
      return 'badgeInfo';
    case 'collectivite':
      return 'badgeWarning';
    default:
      return 'badgeSecondary';
  }
};

/**
 * Gets the display label for the structure type
 * 
 * @param {string} type - Structure type
 * @returns {string} Human-readable label for the structure type
 */
export const getTypeLabel = (type) => {
  switch (type) {
    case 'association':
      return 'Association';
    case 'entreprise':
      return 'Entreprise';
    case 'administration':
      return 'Administration';
    case 'collectivite':
      return 'Collectivité';
    default:
      return 'Autre';
  }
};