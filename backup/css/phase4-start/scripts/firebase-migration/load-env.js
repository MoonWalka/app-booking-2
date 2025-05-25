/**
 * Script utilitaire pour charger les variables d'environnement depuis .env.local
 */
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  try {
    // Chemin vers le fichier .env.local
    const envPath = path.resolve(process.cwd(), '../../.env.local');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(envPath)) {
      console.warn('Fichier .env.local non trouvé');
      return false;
    }
    
    // Lire le contenu du fichier
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parser les variables et les ajouter à process.env
    envContent.split('\n').forEach(line => {
      // Ignorer les lignes vides ou commentées
      if (!line || line.startsWith('#')) return;
      
      // Extraire la clé et la valeur
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Ne pas écraser les variables existantes
        if (!process.env[key]) {
          process.env[key] = value.replace(/^['"](.*)['"]$/, '$1'); // Enlever les guillemets si présents
        }
      }
    });
    
    console.log('Variables d\'environnement chargées depuis .env.local');
    return true;
  } catch (error) {
    console.error('Erreur lors du chargement des variables d\'environnement:', error);
    return false;
  }
}

module.exports = loadEnvLocal;