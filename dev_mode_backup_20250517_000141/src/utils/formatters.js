/**
 * Utilitaires de formatage pour l'application TourCraft
 * Contient des fonctionnalités de formatage communes pour les dates, montants, etc.
 */

// Formater la date pour l'affichage
export const formatDate = (dateValue) => {
  if (!dateValue) return 'Date non spécifiée';
  
  // Si c'est un timestamp Firestore
  if (dateValue.seconds) {
    return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
  }
  
  // Si c'est une chaîne de date
  try {
    return new Date(dateValue).toLocaleDateString('fr-FR');
  } catch (e) {
    return dateValue;
  }
};

// Formater le montant
export const formatMontant = (montant) => {
  if (!montant) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
};

// Vérifier si la date est passée
export const isDatePassed = (dateValue) => {
  if (!dateValue) return false;
  
  const today = new Date();
  const concertDate = dateValue.seconds ? 
    new Date(dateValue.seconds * 1000) : 
    new Date(dateValue);
  
  return concertDate < today;
};

// Fonction pour copier le lien dans le presse-papiers
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Lien copié dans le presse-papiers !');
    })
    .catch(err => {
      console.error('Erreur lors de la copie dans le presse-papiers:', err);
    });
};

// Fonction utilitaire pour créer un ID unique pour les requêtes (cache-busting)
export const getCacheKey = (id) => `concert_${id}_${Date.now()}`;