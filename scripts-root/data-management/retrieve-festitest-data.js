/**
 * Script pour récupérer toutes les données existantes liées à "festitest" et "meltin recordz"
 * Utilise les services Firebase pour rechercher dans toutes les collections
 * 
 * Usage: node retrieve-festitest-data.js
 * Ou à exécuter dans la console du navigateur sur l'application TourCraft
 */

// Configuration pour utilisation dans Node.js ou navigateur
const isNodeJs = typeof window === 'undefined';

// Données à rechercher
const SEARCH_TERMS = {
  festitest: ['festitest', 'Festitest', 'FESTITEST'],
  meltin: ['meltin recordz', 'Meltin Recordz', 'MELTIN RECORDZ', 'meltin', 'Meltin']
};

// Collections à rechercher
const COLLECTIONS = [
  'concerts',
  'contacts', 
  'structures',
  'contrats',
  'factures',
  'lieux',
  'artistes',
  'forms',
  'formulaires'
];

// Fonction principale de recherche
async function retrieveFestitestData() {
  console.log('🔍 === RÉCUPÉRATION DES DONNÉES FESTITEST ET MELTIN RECORDZ ===');
  console.log('📅 Heure:', new Date().toLocaleString());
  
  const results = {
    festitest: {
      concerts: [],
      contacts: [],
      structures: [],
      contrats: [],
      factures: [],
      lieux: [],
      artistes: [],
      forms: []
    },
    meltin: {
      concerts: [],
      contacts: [],
      structures: [],
      contrats: [],
      factures: [],
      lieux: [],
      artistes: [],
      forms: []
    },
    summary: {
      totalFound: 0,
      searchMethods: [],
      collections: {}
    }
  };

  try {
    // Importer les services Firebase
    let db, collection, query, where, getDocs, getCurrentOrganization;
    
    if (isNodeJs) {
      // Configuration Node.js (si nécessaire)
      console.log('❌ Mode Node.js pas encore supporté - utilisez dans le navigateur');
      return results;
    } else {
      // Configuration navigateur - importer depuis l'application
      const firebaseService = await import('./src/services/firebase-service.js');
      db = firebaseService.db;
      collection = firebaseService.collection;
      query = firebaseService.query;
      where = firebaseService.where;
      getDocs = firebaseService.getDocs;
      getCurrentOrganization = firebaseService.getCurrentOrganization;
    }

    // Obtenir l'organisation courante
    const currentOrgId = getCurrentOrganization();
    console.log('🏢 Organisation courante:', currentOrgId);
    
    // Ajouter les collections organisationnelles si disponibles
    const searchCollections = [...COLLECTIONS];
    if (currentOrgId) {
      searchCollections.push(
        `concerts_org_${currentOrgId}`,
        `contacts_org_${currentOrgId}`,
        `structures_org_${currentOrgId}`,
        `contrats_org_${currentOrgId}`,
        `factures_org_${currentOrgId}`
      );
    }

    // Rechercher dans chaque collection
    for (const collectionName of searchCollections) {
      console.log(`\n📋 === RECHERCHE DANS ${collectionName.toUpperCase()} ===`);
      results.summary.collections[collectionName] = { found: 0, items: [] };
      
      try {
        // Méthodes de recherche pour "festitest"
        const festitestSearches = [
          // Recherches sur le nom/titre
          { field: 'nom', values: SEARCH_TERMS.festitest, exact: true },
          { field: 'prenom', values: SEARCH_TERMS.festitest, exact: true },
          { field: 'titre', values: SEARCH_TERMS.festitest, exact: true },
          { field: 'nomStructure', values: SEARCH_TERMS.festitest, exact: true },
          { field: 'structureNom', values: SEARCH_TERMS.festitest, exact: true },
          
          // Recherches sur l'email
          { field: 'email', values: SEARCH_TERMS.festitest, partial: true },
          
          // Recherches spécifiques aux concerts
          { field: 'lieuNom', values: SEARCH_TERMS.festitest, exact: true },
          { field: 'artisteNom', values: SEARCH_TERMS.festitest, exact: true },
          { field: 'contactNom', values: SEARCH_TERMS.festitest, exact: true },
          
          // Recherches de champs lowercase
          { field: 'nomLowercase', values: SEARCH_TERMS.festitest.map(t => t.toLowerCase()), exact: true }
        ];

        // Méthodes de recherche pour "meltin recordz"
        const meltinSearches = [
          { field: 'nom', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'prenom', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'titre', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'nomStructure', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'structureNom', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'email', values: SEARCH_TERMS.meltin, partial: true },
          { field: 'lieuNom', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'artisteNom', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'contactNom', values: SEARCH_TERMS.meltin, exact: true },
          { field: 'nomLowercase', values: SEARCH_TERMS.meltin.map(t => t.toLowerCase()), exact: true }
        ];

        // Exécuter les recherches
        await executeSearches(db, collectionName, festitestSearches, results.festitest, 'festitest');
        await executeSearches(db, collectionName, meltinSearches, results.meltin, 'meltin');
        
      } catch (collectionError) {
        console.log(`⚠️ Collection ${collectionName} non accessible:`, collectionError.message);
      }
    }

    // Calculer le résumé
    let totalFound = 0;
    Object.keys(results.festitest).forEach(key => {
      if (Array.isArray(results.festitest[key])) {
        totalFound += results.festitest[key].length;
      }
    });
    Object.keys(results.meltin).forEach(key => {
      if (Array.isArray(results.meltin[key])) {
        totalFound += results.meltin[key].length;
      }
    });
    
    results.summary.totalFound = totalFound;

    // Afficher le résumé
    console.log('\n🎉 === RÉSUMÉ DE LA RECHERCHE ===');
    console.log(`📊 Total d'éléments trouvés: ${totalFound}`);
    
    if (totalFound > 0) {
      console.log('\n📋 FESTITEST:');
      Object.keys(results.festitest).forEach(key => {
        const items = results.festitest[key];
        if (items.length > 0) {
          console.log(`  ${key}: ${items.length} élément(s)`);
        }
      });
      
      console.log('\n📋 MELTIN RECORDZ:');
      Object.keys(results.meltin).forEach(key => {
        const items = results.meltin[key];
        if (items.length > 0) {
          console.log(`  ${key}: ${items.length} élément(s)`);
        }
      });

      // Afficher les détails des concerts trouvés
      if (results.festitest.concerts.length > 0) {
        console.log('\n🎵 === DÉTAILS CONCERT FESTITEST ===');
        results.festitest.concerts.forEach((concert, index) => {
          console.log(`\n📄 Concert #${index + 1}:`);
          console.log('  ID:', concert.id);
          console.log('  Collection:', concert._collection);
          console.log('  Titre:', concert.titre || 'N/A');
          console.log('  Date:', concert.date || 'N/A');
          console.log('  Lieu:', concert.lieuNom || 'N/A');
          console.log('  Ville:', concert.lieuVille || 'N/A');
          console.log('  Artiste:', concert.artisteNom || 'N/A');
          console.log('  Structure:', concert.structureNom || concert.structureId || 'N/A');
          console.log('  Contacts:', concert.contactIds || concert.contactId || 'N/A');
          console.log('  Statut:', concert.statut || 'N/A');
          console.log('  Montant:', concert.montant || 'N/A');
          console.log('  Métadonnées complètes:', JSON.stringify(concert, null, 2));
        });
      }

      // Afficher les détails des structures trouvées
      if (results.meltin.structures.length > 0) {
        console.log('\n🏢 === DÉTAILS STRUCTURE MELTIN RECORDZ ===');
        results.meltin.structures.forEach((structure, index) => {
          console.log(`\n📄 Structure #${index + 1}:`);
          console.log('  ID:', structure.id);
          console.log('  Collection:', structure._collection);
          console.log('  Nom:', structure.nom || 'N/A');
          console.log('  Type:', structure.type || 'N/A');
          console.log('  Email:', structure.email || 'N/A');
          console.log('  Téléphone:', structure.telephone || 'N/A');
          console.log('  Adresse:', structure.adresse || 'N/A');
          console.log('  Ville:', structure.ville || 'N/A');
          console.log('  Site web:', structure.siteWeb || 'N/A');
          console.log('  Métadonnées complètes:', JSON.stringify(structure, null, 2));
        });
      }

      // Afficher les détails des contacts trouvés
      if (results.festitest.contacts.length > 0 || results.meltin.contacts.length > 0) {
        console.log('\n👤 === DÉTAILS CONTACTS ===');
        
        [...results.festitest.contacts, ...results.meltin.contacts].forEach((contact, index) => {
          console.log(`\n📄 Contact #${index + 1}:`);
          console.log('  ID:', contact.id);
          console.log('  Collection:', contact._collection);
          console.log('  Nom:', contact.nom || 'N/A');
          console.log('  Prénom:', contact.prenom || 'N/A');
          console.log('  Email:', contact.email || 'N/A');
          console.log('  Téléphone:', contact.telephone || 'N/A');
          console.log('  Structure ID:', contact.structureId || 'N/A');
          console.log('  Structure Nom:', contact.structureNom || 'N/A');
          console.log('  Métadonnées complètes:', JSON.stringify(contact, null, 2));
        });
      }

      // Sauvegarder les résultats dans window pour utilisation ultérieure
      if (!isNodeJs) {
        window.festitestData = results;
        console.log('\n💾 Données sauvegardées dans window.festitestData');
      }
    } else {
      console.log('\n❌ Aucun élément trouvé pour "festitest" ou "meltin recordz"');
      console.log('💡 Suggestions:');
      console.log('  - Vérifiez l\'orthographe des termes de recherche');
      console.log('  - Les données peuvent être dans une collection non recherchée');
      console.log('  - Créez des données de test si nécessaire');
    }

    return results;

  } catch (error) {
    console.error('💥 Erreur lors de la récupération des données:', error);
    console.log('🔧 Vérifiez que vous êtes bien sur la page de l\'application TourCraft');
    throw error;
  }
}

// Fonction utilitaire pour exécuter les recherches
async function executeSearches(db, collectionName, searches, resultTarget, searchType) {
  const collectionKey = collectionName.replace(/_org_.*/, '').replace(/s$/, '');
  
  for (const search of searches) {
    for (const value of search.values) {
      try {
        let q;
        if (search.partial) {
          // Recherche partielle (commence par)
          q = query(
            collection(db, collectionName),
            where(search.field, '>=', value),
            where(search.field, '<=', value + '\uf8ff')
          );
        } else {
          // Recherche exacte
          q = query(
            collection(db, collectionName),
            where(search.field, '==', value)
          );
        }

        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          console.log(`✅ ${snapshot.size} élément(s) trouvé(s) pour ${search.field}="${value}" dans ${collectionName}`);
          
          snapshot.forEach(doc => {
            const data = { id: doc.id, _collection: collectionName, ...doc.data() };
            
            // Ajouter aux résultats selon le type de collection
            if (collectionName.includes('concert')) {
              resultTarget.concerts.push(data);
            } else if (collectionName.includes('contact')) {
              resultTarget.contacts.push(data);
            } else if (collectionName.includes('structure')) {
              resultTarget.structures.push(data);
            } else if (collectionName.includes('contrat')) {
              resultTarget.contrats.push(data);
            } else if (collectionName.includes('facture')) {
              resultTarget.factures.push(data);
            } else if (collectionName.includes('lieu')) {
              resultTarget.lieux.push(data);
            } else if (collectionName.includes('artiste')) {
              resultTarget.artistes.push(data);
            } else if (collectionName.includes('form')) {
              resultTarget.forms.push(data);
            } else {
              // Collection générique - ajouter selon le type de recherche
              if (searchType === 'festitest') {
                if (!resultTarget[collectionKey]) resultTarget[collectionKey] = [];
                resultTarget[collectionKey].push(data);
              }
            }
          });
        }
      } catch (searchError) {
        // Ignorer les erreurs de champs non existants
        if (!searchError.message.includes('No matching field')) {
          console.log(`⚠️ Erreur recherche ${search.field}="${value}":`, searchError.message);
        }
      }
    }
  }
}

// Export pour utilisation dans d'autres modules
if (isNodeJs) {
  module.exports = { retrieveFestitestData };
} else {
  // Disponible dans la console du navigateur
  window.retrieveFestitestData = retrieveFestitestData;
  
  // Exécution automatique
  console.log('🚀 Lancement de la récupération des données...');
  retrieveFestitestData().then(results => {
    console.log('✅ Récupération terminée!');
  }).catch(error => {
    console.error('❌ Échec de la récupération:', error);
  });
}