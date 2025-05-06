/**
 * Script d'analyse simplifié de la structure des données Firebase
 * Version minimale qui ne nécessite pas d'authentification complète
 */

// Utiliser directement firebase-admin qui peut fonctionner avec des clés de service ou des paramètres par défaut
const admin = require('firebase-admin');

// Initialisation sans paramètres explicites
// En environnement de développement, cela utilisera les credentials par défaut
// ou les variables d'environnement GOOGLE_APPLICATION_CREDENTIALS
try {
  admin.initializeApp({
    // Si vous avez besoin de spécifier un projet explicitement:
    // projectId: 'votre-projet-id'
  });
} catch (e) {
  // Si l'app est déjà initialisée
  console.log('Firebase déjà initialisé ou erreur:', e.message);
}

// Référence à Firestore
const db = admin.firestore();

// Collections à analyser
const COLLECTIONS_TO_ANALYZE = [
  'programmateurs',
  'structures',
  'concerts',
  'artistes',
  'contrats',
  'lieux'
];

// Nombre de documents à analyser par collection
const SAMPLE_SIZE = 5;

/**
 * Analyse la structure d'une collection
 */
async function analyzeCollection(collectionName) {
  console.log(`\n======== Analyse de la collection "${collectionName}" ========`);

  try {
    // Récupérer un échantillon de documents
    const snapshot = await db.collection(collectionName).limit(SAMPLE_SIZE).get();
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return;
    }

    console.log(`Analysant ${snapshot.size} documents sur la collection "${collectionName}"...`);

    // Analyse des propriétés
    const propertyStats = {};
    const relationFields = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nDocument ID: ${doc.id}`);
      
      // Analyser chaque propriété
      Object.entries(data).forEach(([key, value]) => {
        // Initialiser les stats pour cette propriété si nécessaire
        if (!propertyStats[key]) {
          propertyStats[key] = {
            count: 0,
            types: new Set(),
            hasNested: false,
            examples: [],
            potentialRelation: false,
            inconsistentNaming: false
          };
        }
        
        // Incrémenter le compteur
        propertyStats[key].count++;
        
        // Déterminer le type
        const valueType = typeof value;
        propertyStats[key].types.add(valueType);
        
        // Vérifier les objets imbriqués
        if (valueType === 'object' && value !== null) {
          propertyStats[key].hasNested = true;
        }
        
        // Conserver quelques exemples de valeurs
        if (propertyStats[key].examples.length < 2) {
          propertyStats[key].examples.push(
            valueType === 'object' && value !== null
              ? JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '')
              : String(value).substring(0, 100)
          );
        }
        
        // Détecter les potentielles relations
        if (
          (key.endsWith('Id') || key.endsWith('IDs') || key.endsWith('Ids')) && 
          (valueType === 'string' || (valueType === 'object' && Array.isArray(value)))
        ) {
          propertyStats[key].potentialRelation = true;
          relationFields.push(key);
        }
        
        // Détecter les incohérences de nommage
        if (
          (key.includes('_') || 
          (key[0] !== key[0].toLowerCase()) || 
          (key.includes('-')))
        ) {
          propertyStats[key].inconsistentNaming = true;
        }
      });
    });
    
    // Afficher les statistiques
    console.log(`\nStructure détectée pour la collection "${collectionName}":`);
    
    Object.entries(propertyStats).forEach(([key, stats]) => {
      console.log(`\nPropriété: ${key}`);
      console.log(`  - Présente dans ${stats.count}/${snapshot.size} documents`);
      console.log(`  - Types trouvés: [${Array.from(stats.types).join(', ')}]`);
      console.log(`  - Contient des objets imbriqués: ${stats.hasNested ? 'Oui' : 'Non'}`);
      
      if (stats.potentialRelation) {
        console.log(`  - ⚠️ Potentiellement une relation vers une autre collection`);
      }
      
      if (stats.inconsistentNaming) {
        console.log(`  - ⚠️ Nommage potentiellement incohérent avec les conventions`);
      }
      
      if (stats.examples.length > 0) {
        console.log(`  - Exemples: ${stats.examples.join(' | ')}`);
      }
    });
    
    // Résumé des relations potentielles
    if (relationFields.length > 0) {
      console.log(`\nRelations potentielles détectées dans "${collectionName}":`);
      relationFields.forEach(field => {
        console.log(`  - ${field}`);
      });
    }
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse de la collection "${collectionName}":`, error);
  }
}

/**
 * Exécute l'analyse sur toutes les collections
 */
async function main() {
  console.log('Démarrage de l\'analyse des structures de données Firebase avec firebase-admin...');
  console.log('Date: ' + new Date().toISOString());
  
  for (const collectionName of COLLECTIONS_TO_ANALYZE) {
    await analyzeCollection(collectionName);
  }
  
  console.log('\nAnalyse terminée.');
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script d\'analyse:', error);
  process.exit(1);
});