/**
 * Utilitaire pour corriger le problème de boucle dans les relances automatiques
 * 
 * PROBLÈME IDENTIFIÉ :
 * - Double déclenchement des relances (useConcertForm + useConcertWatcher)
 * - Modification du concert par le service de relances qui déclenche de nouvelles évaluations
 * - Création massive de relances en boucle
 */

import { db, collection, query, where, getDocs, writeBatch, doc } from '@/services/firebase-service';

/**
 * Nettoie les relances en double pour une organisation
 */
export async function cleanupDuplicateRelances(organizationId) {
  console.log('🧹 Début du nettoyage des relances en double...');
  
  try {
    // Récupérer toutes les relances de l'organisation
    const relancesRef = collection(db, 'relances');
    const q = query(relancesRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    
    const relancesByKey = new Map();
    const duplicates = [];
    
    // Identifier les doublons
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Créer une clé unique basée sur les propriétés importantes
      const key = `${data.entityType}-${data.entityId}-${data.type}-${data.titre}`;
      
      if (relancesByKey.has(key)) {
        // C'est un doublon
        const existing = relancesByKey.get(key);
        const existingDate = existing.data.dateCreation?.toDate ? existing.data.dateCreation.toDate() : new Date(existing.data.dateCreation);
        const currentDate = data.dateCreation?.toDate ? data.dateCreation.toDate() : new Date(data.dateCreation);
        
        // Garder la plus ancienne
        if (currentDate > existingDate) {
          duplicates.push({ id: docSnap.id, data });
        } else {
          duplicates.push(existing);
          relancesByKey.set(key, { id: docSnap.id, data });
        }
      } else {
        relancesByKey.set(key, { id: docSnap.id, data });
      }
    });
    
    console.log(`🔍 Trouvé ${duplicates.length} doublons à supprimer`);
    
    // Supprimer les doublons par batch
    if (duplicates.length > 0) {
      let batch = writeBatch(db);
      let count = 0;
      
      for (const dup of duplicates) {
        batch.delete(doc(db, 'relances', dup.id));
        count++;
        
        // Firebase limite à 500 opérations par batch
        if (count === 500) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      
      console.log(`✅ ${duplicates.length} doublons supprimés`);
    }
    
    return duplicates.length;
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des doublons:', error);
    throw error;
  }
}

/**
 * Désactive temporairement les relances automatiques pour éviter les boucles
 */
export async function disableAutomaticRelances(organizationId) {
  console.log('🚫 Désactivation temporaire des relances automatiques...');
  
  try {
    // Stocker un flag dans localStorage pour désactiver temporairement
    const flagKey = `relances_auto_disabled_${organizationId}`;
    localStorage.setItem(flagKey, 'true');
    
    // Expirer après 5 minutes
    setTimeout(() => {
      localStorage.removeItem(flagKey);
      console.log('✅ Relances automatiques réactivées');
    }, 5 * 60 * 1000);
    
    console.log('⏸️ Relances automatiques désactivées pour 5 minutes');
    
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation:', error);
  }
}

/**
 * Vérifie si les relances automatiques sont désactivées
 */
export function areAutomaticRelancesDisabled(organizationId) {
  const flagKey = `relances_auto_disabled_${organizationId}`;
  return localStorage.getItem(flagKey) === 'true';
}

/**
 * Marque les concerts pour éviter les boucles de mise à jour
 */
export async function markConcertsAsProcessed(concertIds) {
  console.log(`🏷️ Marquage de ${concertIds.length} concerts comme traités...`);
  
  try {
    const batch = writeBatch(db);
    
    for (const concertId of concertIds) {
      const concertRef = doc(db, 'concerts', concertId);
      batch.update(concertRef, {
        _relancesProcessedAt: new Date().toISOString(),
        _lastUpdateType: 'relance_cleanup'
      });
    }
    
    await batch.commit();
    console.log('✅ Concerts marqués comme traités');
    
  } catch (error) {
    console.error('❌ Erreur lors du marquage des concerts:', error);
  }
}

/**
 * Corrige le problème de boucle pour une organisation
 */
export async function fixRelancesLoop(organizationId) {
  console.log('🔧 Correction du problème de boucle des relances...');
  
  try {
    // 1. Désactiver temporairement les relances automatiques
    await disableAutomaticRelances(organizationId);
    
    // 2. Nettoyer les doublons
    const duplicatesRemoved = await cleanupDuplicateRelances(organizationId);
    
    // 3. Récupérer tous les concerts avec des relances
    const concertsRef = collection(db, 'concerts');
    const q = query(concertsRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    
    const concertIds = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.relances && data.relances.length > 0) {
        concertIds.push(doc.id);
      }
    });
    
    // 4. Marquer les concerts comme traités
    if (concertIds.length > 0) {
      await markConcertsAsProcessed(concertIds);
    }
    
    console.log('✅ Correction terminée');
    console.log(`   - ${duplicatesRemoved} doublons supprimés`);
    console.log(`   - ${concertIds.length} concerts marqués`);
    console.log('   - Relances automatiques désactivées pour 5 minutes');
    
    return {
      duplicatesRemoved,
      concertsProcessed: concertIds.length,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  }
}