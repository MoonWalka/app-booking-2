// Ajouter à la fin du fichier mockStorage.js
// Initialiser automatiquement les données de démonstration en mode local
if (process.env.REACT_APP_MODE === 'local' || process.env.NODE_ENV === 'development') {
  console.log('Mode développement détecté - Initialisation des données de démonstration');
  // Vérifier si des données existent déjà
  const hasData = Object.values(localData).some(collection => Object.keys(collection).length > 0);
  if (!hasData) {
    seedLocalData(true);
  }
}
