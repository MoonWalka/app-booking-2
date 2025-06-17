/**
 * Script maître pour récupérer TOUTES les données liées à "festitest" et "meltin recordz"
 * Exécute tous les scripts de recherche et compile un rapport consolidé
 * 
 * À exécuter dans la console du navigateur sur l'application TourCraft
 */

(async function masterFestitestDataRetrieval() {
  console.log('🚀 === RÉCUPÉRATION COMPLÈTE DES DONNÉES FESTITEST & MELTIN RECORDZ ===');
  console.log('📅 Début:', new Date().toLocaleString());
  
  const masterResults = {
    summary: {
      startTime: new Date(),
      endTime: null,
      totalItemsFound: 0,
      searchesCompleted: 0,
      errors: []
    },
    festitest: {
      concerts: [],
      contacts: [],
      structures: [],
      contrats: [],
      factures: [],
      lieux: [],
      artistes: [],
      forms: [],
      venues: []
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
    relatedData: {
      contracts: [],
      invoices: [],
      venues: [],
      contacts: [],
      structures: []
    }
  };

  try {
    // 1. Exécuter la recherche générale
    console.log('\n🔍 === ÉTAPE 1: RECHERCHE GÉNÉRALE ===');
    try {
      const generalResults = await window.retrieveFestitestData();
      
      // Fusionner les résultats généraux
      Object.keys(generalResults.festitest).forEach(key => {
        if (Array.isArray(generalResults.festitest[key])) {
          masterResults.festitest[key].push(...generalResults.festitest[key]);
        }
      });
      
      Object.keys(generalResults.meltin).forEach(key => {
        if (Array.isArray(generalResults.meltin[key])) {
          masterResults.meltin[key].push(...generalResults.meltin[key]);
        }
      });
      
      masterResults.summary.searchesCompleted++;
      console.log('✅ Recherche générale terminée');
      
    } catch (error) {
      console.error('❌ Erreur recherche générale:', error.message);
      masterResults.summary.errors.push('Recherche générale: ' + error.message);
    }

    // 2. Exécuter la recherche de venues
    console.log('\n🏢 === ÉTAPE 2: RECHERCHE DES LIEUX ===');
    try {
      // Charger et exécuter le script de recherche de venues
      const venueScript = await fetch('./search-festitest-venue.js').then(r => r.text());
      const venueResults = await eval(`(${venueScript})`);
      
      // Fusionner les résultats de venues
      masterResults.festitest.venues.push(...venueResults.lieux);
      masterResults.festitest.concerts.push(...venueResults.concerts);
      masterResults.festitest.structures.push(...venueResults.structures);
      masterResults.relatedData.venues.push(...venueResults.lieux);
      
      masterResults.summary.searchesCompleted++;
      console.log('✅ Recherche des lieux terminée');
      
    } catch (error) {
      console.error('❌ Erreur recherche venues:', error.message);
      masterResults.summary.errors.push('Recherche venues: ' + error.message);
    }

    // 3. Exécuter la recherche de contrats et factures
    console.log('\n📄 === ÉTAPE 3: RECHERCHE CONTRATS & FACTURES ===');
    try {
      // Charger et exécuter le script de recherche de contrats/factures
      const contractsScript = await fetch('./search-festitest-contracts-invoices.js').then(r => r.text());
      const contractsResults = await eval(`(${contractsScript})`);
      
      // Fusionner les résultats de contrats/factures
      masterResults.festitest.contrats.push(...contractsResults.contrats);
      masterResults.festitest.factures.push(...contractsResults.factures);
      masterResults.relatedData.contracts.push(...contractsResults.contrats);
      masterResults.relatedData.invoices.push(...contractsResults.factures);
      masterResults.relatedData.contacts.push(...contractsResults.relatedContacts);
      masterResults.relatedData.structures.push(...contractsResults.relatedStructures);
      
      masterResults.summary.searchesCompleted++;
      console.log('✅ Recherche contrats & factures terminée');
      
    } catch (error) {
      console.error('❌ Erreur recherche contrats/factures:', error.message);
      masterResults.summary.errors.push('Recherche contrats/factures: ' + error.message);
    }

    // 4. Déduplication des résultats
    console.log('\n🔄 === ÉTAPE 4: DÉDUPLICATION ===');
    
    const deduplicateById = (array) => {
      const seen = new Set();
      return array.filter(item => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
    };
    
    Object.keys(masterResults.festitest).forEach(key => {
      if (Array.isArray(masterResults.festitest[key])) {
        masterResults.festitest[key] = deduplicateById(masterResults.festitest[key]);
      }
    });
    
    Object.keys(masterResults.meltin).forEach(key => {
      if (Array.isArray(masterResults.meltin[key])) {
        masterResults.meltin[key] = deduplicateById(masterResults.meltin[key]);
      }
    });
    
    Object.keys(masterResults.relatedData).forEach(key => {
      if (Array.isArray(masterResults.relatedData[key])) {
        masterResults.relatedData[key] = deduplicateById(masterResults.relatedData[key]);
      }
    });

    // 5. Calcul du total d'éléments trouvés
    let totalItems = 0;
    Object.values(masterResults.festitest).forEach(arr => {
      if (Array.isArray(arr)) totalItems += arr.length;
    });
    Object.values(masterResults.meltin).forEach(arr => {
      if (Array.isArray(arr)) totalItems += arr.length;
    });
    Object.values(masterResults.relatedData).forEach(arr => {
      if (Array.isArray(arr)) totalItems += arr.length;
    });
    
    masterResults.summary.totalItemsFound = totalItems;
    masterResults.summary.endTime = new Date();
    
    // 6. Générer le rapport final
    console.log('\n🎉 === RAPPORT FINAL CONSOLIDÉ ===');
    console.log(`⏱️ Durée totale: ${masterResults.summary.endTime - masterResults.summary.startTime} ms`);
    console.log(`🔍 Recherches complétées: ${masterResults.summary.searchesCompleted}`);
    console.log(`📊 Total d'éléments trouvés: ${masterResults.summary.totalItemsFound}`);
    console.log(`⚠️ Erreurs: ${masterResults.summary.errors.length}`);
    
    if (masterResults.summary.errors.length > 0) {
      console.log('\n❌ ERREURS RENCONTRÉES:');
      masterResults.summary.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n📋 RÉSUMÉ PAR CATÉGORIE:');
    
    // Résumé FESTITEST
    console.log('\n🎵 FESTITEST:');
    Object.keys(masterResults.festitest).forEach(key => {
      const items = masterResults.festitest[key];
      if (items.length > 0) {
        console.log(`  ${key}: ${items.length} élément(s)`);
      }
    });
    
    // Résumé MELTIN RECORDZ
    console.log('\n🎤 MELTIN RECORDZ:');
    Object.keys(masterResults.meltin).forEach(key => {
      const items = masterResults.meltin[key];
      if (items.length > 0) {
        console.log(`  ${key}: ${items.length} élément(s)`);
      }
    });
    
    // Résumé DONNÉES LIÉES
    console.log('\n🔗 DONNÉES LIÉES:');
    Object.keys(masterResults.relatedData).forEach(key => {
      const items = masterResults.relatedData[key];
      if (items.length > 0) {
        console.log(`  ${key}: ${items.length} élément(s)`);
      }
    });

    // 7. Affichage détaillé des données principales
    if (masterResults.festitest.concerts.length > 0) {
      console.log('\n🎵 === DÉTAILS CONCERT FESTITEST ===');
      masterResults.festitest.concerts.forEach((concert, index) => {
        console.log(`\n📄 Concert #${index + 1}:`);
        console.log('  🆔 ID:', concert.id);
        console.log('  📝 Titre:', concert.titre || 'N/A');
        console.log('  📅 Date:', concert.date || 'N/A');
        console.log('  🏢 Lieu:', concert.lieuNom || 'N/A');
        console.log('  🌍 Ville:', concert.lieuVille || 'N/A');
        console.log('  🎤 Artiste:', concert.artisteNom || 'N/A');
        console.log('  🏢 Structure:', concert.structureNom || concert.structureId || 'N/A');
        console.log('  👥 Contacts:', concert.contactIds || concert.contactId || 'N/A');
        console.log('  📊 Statut:', concert.statut || 'N/A');
        console.log('  💰 Montant:', concert.montant || 'N/A');
        console.log('  📱 Formule:', concert.formule || 'N/A');
        console.log('  📝 Description:', concert.description || 'N/A');
      });
    }

    if (masterResults.meltin.structures.length > 0) {
      console.log('\n🏢 === DÉTAILS STRUCTURE MELTIN RECORDZ ===');
      masterResults.meltin.structures.forEach((structure, index) => {
        console.log(`\n📄 Structure #${index + 1}:`);
        console.log('  🆔 ID:', structure.id);
        console.log('  🏢 Nom:', structure.nom || 'N/A');
        console.log('  📂 Type:', structure.type || 'N/A');
        console.log('  📧 Email:', structure.email || 'N/A');
        console.log('  📞 Téléphone:', structure.telephone || 'N/A');
        console.log('  📍 Adresse:', structure.adresse || 'N/A');
        console.log('  🌍 Ville:', structure.ville || 'N/A');
        console.log('  🌐 Site web:', structure.siteWeb || 'N/A');
        console.log('  👥 Contacts liés:', structure.contacts?.length || 0);
      });
    }

    // 8. Instructions pour utiliser les données
    console.log('\n💡 === INSTRUCTIONS D\'UTILISATION ===');
    console.log('📁 Les données sont sauvegardées dans:');
    console.log('  • window.masterFestitestData - Données consolidées complètes');
    console.log('  • window.festitestData - Données de la recherche générale');
    console.log('  • window.festitestVenueData - Données des lieux');
    console.log('  • window.festitestContractsData - Données contrats/factures');
    
    console.log('\n🔧 Pour migrer les données vers la structure contact:');
    console.log('  1. Identifiez la structure "meltin recordz" dans window.masterFestitestData.meltin.structures');
    console.log('  2. Récupérez les métadonnées du concert festitest dans window.masterFestitestData.festitest.concerts');
    console.log('  3. Utilisez ces données pour remplir les champs de métadonnées de la structure');
    console.log('  4. Testez l\'interface de contact structure avec ces données consolidées');
    
    console.log('\n📋 Structure des métadonnées recommandée:');
    console.log('  • concerts: [array of concert objects]');
    console.log('  • venues: [array of venue objects]');  
    console.log('  • contracts: [array of contract objects]');
    console.log('  • invoices: [array of invoice objects]');
    console.log('  • contacts: [array of related contact objects]');

    // Sauvegarder les résultats finaux
    window.masterFestitestData = masterResults;
    console.log('\n💾 Données maître sauvegardées dans window.masterFestitestData');
    
    return masterResults;

  } catch (error) {
    console.error('💥 Erreur fatale dans la récupération maître:', error);
    masterResults.summary.errors.push('Erreur fatale: ' + error.message);
    masterResults.summary.endTime = new Date();
    return masterResults;
  }
})();