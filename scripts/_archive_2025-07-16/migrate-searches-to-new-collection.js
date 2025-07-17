// Script de migration des recherches de la collection 'selections' vers 'recherches'
// À exécuter une seule fois pour migrer les données existantes

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../src/services/firebase-service.js';

async function migrateSearches() {
  console.log('🚀 Début de la migration des recherches...');
  
  try {
    // 1. Récupérer toutes les recherches sauvegardées de l'ancienne collection
    const q = query(
      collection(db, 'selections'),
      where('type', 'in', ['saved_search', 'saved_search_with_results'])
    );
    
    const snapshot = await getDocs(q);
    console.log(`📊 ${snapshot.size} recherches trouvées à migrer`);
    
    if (snapshot.size === 0) {
      console.log('✅ Aucune recherche à migrer');
      return;
    }
    
    // 2. Migrer chaque recherche vers la nouvelle collection
    let successCount = 0;
    let errorCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const searchData = docSnapshot.data();
      const searchId = docSnapshot.id;
      
      try {
        // Nettoyer les données avant la migration
        const cleanedData = {
          entrepriseId: searchData.entrepriseId,
          userId: searchData.userId,
          name: searchData.name,
          criteria: searchData.criteria,
          results: searchData.results || null,
          description: searchData.description || '',
          createdAt: searchData.createdAt,
          updatedAt: searchData.updatedAt
        };
        
        // Ne pas inclure le champ 'type' dans la nouvelle collection
        
        // Ajouter à la nouvelle collection
        await addDoc(collection(db, 'recherches'), cleanedData);
        
        // Supprimer de l'ancienne collection (optionnel - décommenter si souhaité)
        // await deleteDoc(doc(db, 'selections', searchId));
        
        successCount++;
        console.log(`✅ Recherche "${searchData.name}" migrée avec succès`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de la migration de la recherche ${searchId}:`, error);
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`✅ ${successCount} recherches migrées avec succès`);
    console.log(`❌ ${errorCount} erreurs lors de la migration`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration terminée avec succès!');
      console.log('⚠️  Note: Les anciennes données sont toujours dans la collection "selections".');
      console.log('    Décommentez la ligne deleteDoc() pour les supprimer après vérification.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
migrateSearches();