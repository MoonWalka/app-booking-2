// SCRIPT À EXÉCUTER DANS LA CONSOLE DU NAVIGATEUR
// Coller ce code dans les outils de développement (F12) de l'application TourCraft

(async function auditFirebaseCollections() {
  console.log('🔍 AUDIT DES COLLECTIONS FIREBASE TOURCRAFT');
  console.log('============================================');
  
  // Vérifier que Firebase est disponible
  if (typeof window === 'undefined' || !window.db) {
    console.error('❌ Firebase non disponible. Assurez-vous d\'être connecté à l\'application.');
    return;
  }
  
  const { collection, getDocs, query, where, orderBy, limit } = window;
  const db = window.db;
  
  try {
    const stats = {
      contacts: { total: 0, structures: 0, personnes: 0, mixtes: 0, examples: [] },
      structures: { total: 0, examples: [] },
      programmateurs: { total: 0 },
      lieux: { total: 0 },
      concerts: { total: 0 }
    };
    
    console.log('📊 Analyse des collections...');
    
    // 1. CONTACTS
    try {
      const contactsSnapshot = await getDocs(collection(db, 'contacts'));
      stats.contacts.total = contactsSnapshot.size;
      
      contactsSnapshot.forEach(doc => {
        const data = doc.data();
        const hasStructureData = data.structureRaisonSociale?.trim();
        const hasPersonneData = data.prenom?.trim() && data.nom?.trim();
        
        // Ajouter des exemples
        if (stats.contacts.examples.length < 3) {
          stats.contacts.examples.push({
            id: doc.id,
            nom: data.nom,
            structureRaisonSociale: data.structureRaisonSociale,
            entityType: data.entityType,
            type: data.type
          });
        }
        
        if (hasStructureData && hasPersonneData) {
          stats.contacts.mixtes++;
        } else if (hasStructureData) {
          stats.contacts.structures++;
        } else if (hasPersonneData) {
          stats.contacts.personnes++;
        }
      });
      
      console.log('✅ Collection CONTACTS:', stats.contacts.total, 'documents');
      console.log('   - Personnes:', stats.contacts.personnes);
      console.log('   - Structures:', stats.contacts.structures);
      console.log('   - Mixtes:', stats.contacts.mixtes);
    } catch (e) {
      console.log('❌ Collection contacts: erreur ou vide');
    }
    
    // 2. STRUCTURES SÉPARÉES
    try {
      const structuresSnapshot = await getDocs(collection(db, 'structures'));
      stats.structures.total = structuresSnapshot.size;
      
      structuresSnapshot.forEach(doc => {
        if (stats.structures.examples.length < 3) {
          const data = doc.data();
          stats.structures.examples.push({
            id: doc.id,
            raisonSociale: data.raisonSociale,
            type: data.type
          });
        }
      });
      
      console.log('✅ Collection STRUCTURES:', stats.structures.total, 'documents');
    } catch (e) {
      console.log('❌ Collection structures: erreur ou vide');
    }
    
    // 3. PROGRAMMATEURS (ancien)
    try {
      const programmateursSnapshot = await getDocs(collection(db, 'programmateurs'));
      stats.programmateurs.total = programmateursSnapshot.size;
      console.log('⚠️ Collection PROGRAMMATEURS (ancien):', stats.programmateurs.total, 'documents');
    } catch (e) {
      console.log('✅ Collection programmateurs: supprimée (normal après migration)');
    }
    
    // 4. LIEUX
    try {
      const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
      stats.lieux.total = lieuxSnapshot.size;
      console.log('📍 Collection LIEUX:', stats.lieux.total, 'documents');
    } catch (e) {
      console.log('❌ Collection lieux: erreur');
    }
    
    // 5. CONCERTS
    try {
      const concertsSnapshot = await getDocs(collection(db, 'concerts'));
      stats.concerts.total = concertsSnapshot.size;
      console.log('🎵 Collection CONCERTS:', stats.concerts.total, 'documents');
    } catch (e) {
      console.log('❌ Collection concerts: erreur');
    }
    
    console.log('\n📋 RÉSUMÉ GÉNÉRAL:');
    console.log('==================');
    console.table(stats);
    
    // Échantillons de données
    if (stats.contacts.examples.length > 0) {
      console.log('\n🔍 ÉCHANTILLON CONTACTS:');
      console.table(stats.contacts.examples);
    }
    
    if (stats.structures.examples.length > 0) {
      console.log('\n🔍 ÉCHANTILLON STRUCTURES:');
      console.table(stats.structures.examples);
    }
    
    // DIAGNOSTIC : Où sont les structures ?
    console.log('\n🕵️ DIAGNOSTIC - OÙ SONT LES STRUCTURES ?');
    console.log('=========================================');
    
    if (stats.contacts.structures === 0 && stats.structures.total === 0) {
      console.warn('⚠️ PROBLÈME: Aucune structure trouvée ni dans contacts ni dans collection séparée !');
    } else if (stats.contacts.structures > 0 && stats.structures.total === 0) {
      console.log('✅ Les structures sont dans la collection CONTACTS (migration réussie)');
    } else if (stats.contacts.structures === 0 && stats.structures.total > 0) {
      console.log('✅ Les structures sont dans une collection STRUCTURES séparée');
    } else {
      console.log('🔄 Les structures sont réparties entre les deux collections');
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  }
})();