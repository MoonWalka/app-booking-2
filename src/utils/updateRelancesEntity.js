/**
 * @fileoverview Script pour mettre à jour les relances existantes avec les champs entity
 * Corrige les relances qui affichent "sans entité"
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  getDoc,
  serverTimestamp 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Met à jour les relances automatiques d'un concert avec les champs entity
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export const updateRelancesConcert = async (concertId, organizationId) => {
  try {
    console.log(`🔧 Mise à jour des relances du concert: ${concertId}`);

    // Récupérer les données du concert
    const concertRef = doc(db, 'concerts', concertId);
    const concertSnap = await getDoc(concertRef);
    
    if (!concertSnap.exists()) {
      throw new Error(`Concert ${concertId} non trouvé`);
    }

    const concertData = concertSnap.data();
    const concertTitre = concertData.titre || 'Concert sans titre';

    // Récupérer toutes les relances du concert
    const q = query(
      collection(db, 'relances'),
      where('concertId', '==', concertId),
      where('organizationId', '==', organizationId)
    );

    const snapshot = await getDocs(q);
    let updated = 0;
    let alreadyOk = 0;

    for (const docSnap of snapshot.docs) {
      const relanceData = docSnap.data();
      
      // Vérifier si les champs entity sont manquants
      if (!relanceData.entityType || !relanceData.entityId || !relanceData.entityName) {
        await updateDoc(doc(db, 'relances', docSnap.id), {
          entityType: 'concert',
          entityId: concertId,
          entityName: concertTitre,
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Relance ${docSnap.id} mise à jour`);
        updated++;
      } else {
        alreadyOk++;
      }
    }

    console.log(`📊 Résultat: ${updated} mises à jour, ${alreadyOk} déjà OK`);

    return {
      success: true,
      concertId,
      concertTitre,
      totalRelances: snapshot.size,
      updated,
      alreadyOk
    };

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Met à jour toutes les relances automatiques de l'organisation
 * 
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat global
 */
export const updateAllRelancesEntity = async (organizationId) => {
  try {
    console.log(`🔧 Mise à jour de toutes les relances de l'organisation: ${organizationId}`);

    // Récupérer toutes les relances automatiques
    const q = query(
      collection(db, 'relances'),
      where('organizationId', '==', organizationId),
      where('automatique', '==', true)
    );

    const snapshot = await getDocs(q);
    console.log(`📊 ${snapshot.size} relances automatiques trouvées`);

    // Grouper par concert
    const relancesParConcert = {};
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.concertId) {
        if (!relancesParConcert[data.concertId]) {
          relancesParConcert[data.concertId] = [];
        }
        relancesParConcert[data.concertId].push({
          id: docSnap.id,
          data
        });
      }
    });

    const results = [];
    for (const [concertId, relances] of Object.entries(relancesParConcert)) {
      console.log(`\n🎵 Traitement du concert ${concertId} (${relances.length} relances)`);
      
      const result = await updateRelancesConcert(concertId, organizationId);
      results.push(result);
    }

    const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
    const totalOk = results.reduce((sum, r) => sum + (r.alreadyOk || 0), 0);
    const errors = results.filter(r => !r.success);

    console.log('\n✅ Mise à jour globale terminée');
    console.log(`📊 Total: ${totalUpdated} mises à jour, ${totalOk} déjà OK`);
    
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} erreurs rencontrées`);
    }

    return {
      success: true,
      totalRelances: snapshot.size,
      totalUpdated,
      totalOk,
      concertsTraites: results.length,
      errors
    };

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour globale:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Vérifie l'état des relances d'un concert
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 */
export const checkRelancesEntity = async (concertId, organizationId) => {
  try {
    console.log(`🔍 Vérification des relances du concert: ${concertId}`);

    const q = query(
      collection(db, 'relances'),
      where('concertId', '==', concertId),
      where('organizationId', '==', organizationId)
    );

    const snapshot = await getDocs(q);
    
    console.log(`\n📊 ${snapshot.size} relances trouvées:`);
    
    snapshot.docs.forEach((docSnap, index) => {
      const data = docSnap.data();
      console.log(`\n${index + 1}. ${data.nom || 'Sans nom'} (${docSnap.id})`);
      console.log(`   entityType: ${data.entityType || '❌ MANQUANT'}`);
      console.log(`   entityId: ${data.entityId || '❌ MANQUANT'}`);
      console.log(`   entityName: ${data.entityName || '❌ MANQUANT'}`);
      console.log(`   concertId: ${data.concertId || '❌ MANQUANT'}`);
      console.log(`   automatique: ${data.automatique ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
};

// Rendre disponible dans la console
if (typeof window !== 'undefined') {
  window.updateRelancesConcert = updateRelancesConcert;
  window.updateAllRelancesEntity = updateAllRelancesEntity;
  window.checkRelancesEntity = checkRelancesEntity;
  
  console.log(`
🔧 Utilitaires de mise à jour des relances disponibles:

• checkRelancesEntity('concert-id', 'org-id') - Vérifier l'état des relances
• updateRelancesConcert('concert-id', 'org-id') - Mettre à jour un concert
• updateAllRelancesEntity('org-id') - Mettre à jour toutes les relances

Exemples:
checkRelancesEntity('con-1749149822115-9cx49g', 'tTvA6fzQpi6u3kx8wZO8')
updateRelancesConcert('con-1749149822115-9cx49g', 'tTvA6fzQpi6u3kx8wZO8')
updateAllRelancesEntity('tTvA6fzQpi6u3kx8wZO8')
  `);
}

const updateUtils = {
  updateRelancesConcert,
  updateAllRelancesEntity,
  checkRelancesEntity
};

export default updateUtils;