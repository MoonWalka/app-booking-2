/**
 * Script pour rechercher spécifiquement les données de lieu/venue pour festitest
 * Se concentre sur les collections lieux et les références dans les concerts
 */

(async function searchFestitestVenue() {
  console.log('🏢 === RECHERCHE DU LIEU FESTITEST ===');
  
  try {
    // Importer les services Firebase
    const { db, collection, query, where, getDocs, doc, getDoc } = await import('./src/services/firebase-service.js');
    const { getCurrentOrganization } = await import('./src/services/firebase-service.js');
    
    const currentOrgId = getCurrentOrganization();
    console.log('🏢 Organisation:', currentOrgId);
    
    const results = {
      lieux: [],
      concerts: [],
      structures: []
    };

    // 1. Rechercher dans la collection "lieux"
    console.log('\n📍 === RECHERCHE DANS LES LIEUX ===');
    
    const lieuSearchTerms = ['festitest', 'Festitest', 'FESTITEST'];
    const lieuFields = ['nom', 'nomLowercase', 'ville', 'adresse'];
    
    for (const field of lieuFields) {
      for (const term of lieuSearchTerms) {
        try {
          const q = query(
            collection(db, 'lieux'),
            where(field, '==', term)
          );
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            console.log(`✅ ${snapshot.size} lieu(x) trouvé(s) pour ${field}="${term}"`);
            snapshot.forEach(docSnap => {
              const data = { id: docSnap.id, ...docSnap.data() };
              results.lieux.push(data);
              console.log('📍 Lieu trouvé:', {
                id: data.id,
                nom: data.nom,
                ville: data.ville,
                adresse: data.adresse,
                type: data.type,
                capacite: data.capacite
              });
            });
          }
        } catch (error) {
          if (!error.message.includes('No matching field')) {
            console.warn(`⚠️ Erreur recherche lieu ${field}:`, error.message);
          }
        }
      }
    }

    // 2. Rechercher des concerts avec lieuNom contenant "festitest"
    console.log('\n🎵 === RECHERCHE CONCERTS AVEC LIEU FESTITEST ===');
    
    const concertCollections = ['concerts'];
    if (currentOrgId) {
      concertCollections.push(`concerts_org_${currentOrgId}`);
    }
    
    for (const collName of concertCollections) {
      try {
        for (const term of lieuSearchTerms) {
          const q = query(
            collection(db, collName),
            where('lieuNom', '==', term)
          );
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            console.log(`✅ ${snapshot.size} concert(s) avec lieu "${term}" dans ${collName}`);
            snapshot.forEach(docSnap => {
              const data = { id: docSnap.id, _collection: collName, ...docSnap.data() };
              results.concerts.push(data);
              console.log('🎵 Concert trouvé:', {
                id: data.id,
                titre: data.titre,
                date: data.date,
                lieuNom: data.lieuNom,
                lieuId: data.lieuId,
                lieuVille: data.lieuVille,
                lieuAdresse: data.lieuAdresse
              });
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Collection ${collName} non accessible:`, error.message);
      }
    }

    // 3. Si on trouve des concerts avec lieuId, récupérer les détails du lieu
    console.log('\n🔗 === RÉCUPÉRATION DES DÉTAILS DES LIEUX ===');
    
    const lieuIds = [...new Set(results.concerts
      .filter(concert => concert.lieuId)
      .map(concert => concert.lieuId))];
    
    for (const lieuId of lieuIds) {
      try {
        console.log(`📍 Récupération du lieu ID: ${lieuId}`);
        const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
        
        if (lieuDoc.exists()) {
          const lieuData = { id: lieuDoc.id, ...lieuDoc.data() };
          results.lieux.push(lieuData);
          console.log('✅ Détails du lieu récupérés:', {
            id: lieuData.id,
            nom: lieuData.nom,
            ville: lieuData.ville,
            adresse: lieuData.adresse,
            capacite: lieuData.capacite,
            contact: lieuData.contact
          });
        } else {
          console.log(`❌ Lieu ${lieuId} non trouvé`);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur récupération lieu ${lieuId}:`, error.message);
      }
    }

    // 4. Rechercher des structures liées aux lieux trouvés
    console.log('\n🏢 === RECHERCHE STRUCTURES LIÉES ===');
    
    const lieuNoms = [...new Set([
      ...results.lieux.map(lieu => lieu.nom),
      ...results.concerts.map(concert => concert.lieuNom)
    ].filter(Boolean))];
    
    for (const nomLieu of lieuNoms) {
      try {
        const q = query(
          collection(db, 'structures'),
          where('nom', '==', nomLieu)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          console.log(`✅ ${snapshot.size} structure(s) pour lieu "${nomLieu}"`);
          snapshot.forEach(docSnap => {
            const data = { id: docSnap.id, ...docSnap.data() };
            results.structures.push(data);
            console.log('🏢 Structure trouvée:', {
              id: data.id,
              nom: data.nom,
              type: data.type,
              ville: data.ville,
              email: data.email
            });
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur recherche structure pour lieu ${nomLieu}:`, error.message);
      }
    }

    // 5. Résumé et sauvegarde
    console.log('\n🎉 === RÉSUMÉ RECHERCHE LIEU FESTITEST ===');
    console.log(`📍 Lieux trouvés: ${results.lieux.length}`);
    console.log(`🎵 Concerts trouvés: ${results.concerts.length}`);
    console.log(`🏢 Structures trouvées: ${results.structures.length}`);
    
    if (results.lieux.length > 0) {
      console.log('\n📋 DÉTAILS DES LIEUX:');
      results.lieux.forEach((lieu, index) => {
        console.log(`\n📍 Lieu #${index + 1}:`);
        console.log('  ID:', lieu.id);
        console.log('  Nom:', lieu.nom || 'N/A');
        console.log('  Type:', lieu.type || 'N/A');
        console.log('  Ville:', lieu.ville || 'N/A');
        console.log('  Adresse:', lieu.adresse || 'N/A');
        console.log('  Code postal:', lieu.codePostal || 'N/A');
        console.log('  Capacité:', lieu.capacite || 'N/A');
        console.log('  Contact:', lieu.contact || 'N/A');
        console.log('  Email:', lieu.email || 'N/A');
        console.log('  Téléphone:', lieu.telephone || 'N/A');
        console.log('  Site web:', lieu.siteWeb || 'N/A');
        console.log('  Métadonnées complètes:', JSON.stringify(lieu, null, 2));
      });
    }
    
    if (results.concerts.length > 0) {
      console.log('\n📋 CONCERTS ASSOCIÉS:');
      results.concerts.forEach((concert, index) => {
        console.log(`\n🎵 Concert #${index + 1}:`);
        console.log('  ID:', concert.id);
        console.log('  Titre:', concert.titre || 'N/A');
        console.log('  Date:', concert.date || 'N/A');
        console.log('  Lieu ID:', concert.lieuId || 'N/A');
        console.log('  Lieu Nom:', concert.lieuNom || 'N/A');
        console.log('  Lieu Ville:', concert.lieuVille || 'N/A');
        console.log('  Lieu Adresse:', concert.lieuAdresse || 'N/A');
      });
    }

    // Sauvegarder pour utilisation ultérieure
    window.festitestVenueData = results;
    console.log('\n💾 Données sauvegardées dans window.festitestVenueData');
    
    return results;
    
  } catch (error) {
    console.error('💥 Erreur lors de la recherche du lieu:', error);
    throw error;
  }
})();