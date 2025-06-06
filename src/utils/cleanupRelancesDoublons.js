/**
 * @fileoverview Utilitaire pour nettoyer les relances automatiques en doublon
 * Corrige les cas où des relances identiques ont été créées plusieurs fois
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Nettoie les relances en doublon pour un concert spécifique
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat du nettoyage
 */
export const cleanupRelancesDoublons = async (concertId, organizationId) => {
  try {
    console.log(`🧹 Nettoyage des doublons pour le concert: ${concertId}`);

    // Récupérer toutes les relances automatiques du concert
    const q = query(
      collection(db, 'relances'),
      where('concertId', '==', concertId),
      where('organizationId', '==', organizationId),
      where('automatique', '==', true)
    );

    const snapshot = await getDocs(q);
    const relances = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📋 Trouvé ${relances.length} relances automatiques`);

    // Grouper par type
    const relancesParType = {};
    relances.forEach(relance => {
      if (!relancesParType[relance.type]) {
        relancesParType[relance.type] = [];
      }
      relancesParType[relance.type].push(relance);
    });

    const resultats = {
      totalRelances: relances.length,
      doublonesSupprimes: 0,
      relancesConservees: 0,
      typesNettoyes: []
    };

    // Pour chaque type, garder seulement la plus récente et supprimer les autres
    for (const [type, relancesDuType] of Object.entries(relancesParType)) {
      if (relancesDuType.length > 1) {
        console.log(`🔍 Type "${type}": ${relancesDuType.length} doublons détectés`);

        // Trier par date de création (plus récent en premier)
        relancesDuType.sort((a, b) => {
          const dateA = a.dateCreation?.seconds || 0;
          const dateB = b.dateCreation?.seconds || 0;
          return dateB - dateA;
        });

        // Garder la première (plus récente)
        const relanceAGarder = relancesDuType[0];
        const relancesASupprimer = relancesDuType.slice(1);

        console.log(`✅ Conservation de la relance: ${relanceAGarder.id} (${new Date(relanceAGarder.dateCreation?.seconds * 1000).toLocaleString()})`);

        // Supprimer les doublons
        for (const relance of relancesASupprimer) {
          await deleteDoc(doc(db, 'relances', relance.id));
          console.log(`🗑️ Suppression du doublon: ${relance.id}`);
          resultats.doublonesSupprimes++;
        }

        resultats.relancesConservees++;
        resultats.typesNettoyes.push(type);
      } else {
        console.log(`✅ Type "${type}": aucun doublon`);
        resultats.relancesConservees++;
      }
    }

    // Mise à jour de la liste des relances du concert
    await updateConcertRelancesList(concertId, organizationId);

    console.log(`✅ Nettoyage terminé: ${resultats.doublonesSupprimes} doublons supprimés, ${resultats.relancesConservees} relances conservées`);

    return {
      success: true,
      ...resultats
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des doublons:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Met à jour la liste des relances du concert avec les relances existantes
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<void>}
 */
export const updateConcertRelancesList = async (concertId, organizationId) => {
  try {
    console.log(`🔄 Mise à jour de la liste des relances du concert: ${concertId}`);

    // Récupérer toutes les relances existantes du concert
    const q = query(
      collection(db, 'relances'),
      where('concertId', '==', concertId),
      where('organizationId', '==', organizationId)
    );

    const snapshot = await getDocs(q);
    const relanceIds = snapshot.docs.map(doc => doc.id);

    // Mettre à jour le concert avec le flag pour éviter les boucles
    const concertRef = doc(db, 'concerts', concertId);
    await updateDoc(concertRef, {
      relances: relanceIds,
      updatedAt: serverTimestamp(),
      _lastUpdateType: 'relance_cleanup'
    });

    console.log(`✅ Liste des relances mise à jour: ${relanceIds.length} relances`);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la liste des relances:', error);
    throw error;
  }
};

/**
 * Nettoie tous les doublons pour une organisation
 * 
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat du nettoyage global
 */
export const cleanupAllRelancesDoublons = async (organizationId) => {
  try {
    console.log(`🧹 Nettoyage global des doublons pour l'organisation: ${organizationId}`);

    // Récupérer tous les concerts de l'organisation
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('organizationId', '==', organizationId)
    );
    const concertsSnapshot = await getDocs(concertsQuery);

    const resultats = {
      totalConcerts: concertsSnapshot.docs.length,
      concertsNettoyes: 0,
      totalDoublonesSupprimes: 0,
      erreurs: []
    };

    for (const concertDoc of concertsSnapshot.docs) {
      try {
        const resultat = await cleanupRelancesDoublons(concertDoc.id, organizationId);
        
        if (resultat.success) {
          resultats.concertsNettoyes++;
          resultats.totalDoublonesSupprimes += resultat.doublonesSupprimes;
        } else {
          resultats.erreurs.push({
            concertId: concertDoc.id,
            error: resultat.error
          });
        }
      } catch (error) {
        resultats.erreurs.push({
          concertId: concertDoc.id,
          error: error.message
        });
      }
    }

    console.log(`✅ Nettoyage global terminé: ${resultats.concertsNettoyes}/${resultats.totalConcerts} concerts nettoyés`);

    return {
      success: true,
      ...resultats
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage global:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Utilitaire pour la console du navigateur
 */
if (typeof window !== 'undefined') {
  window.cleanupRelancesDoublons = cleanupRelancesDoublons;
  window.cleanupAllRelancesDoublons = cleanupAllRelancesDoublons;
  window.updateConcertRelancesList = updateConcertRelancesList;
  
  console.log(`
🧹 Utilitaires de nettoyage des doublons disponibles:

• cleanupRelancesDoublons('concert-id', 'org-id') - Nettoyer un concert spécifique
• cleanupAllRelancesDoublons('org-id') - Nettoyer tous les concerts d'une organisation
• updateConcertRelancesList('concert-id', 'org-id') - Mettre à jour la liste des relances

Exemples:
cleanupRelancesDoublons('con-1749149822115-9cx49g', 'tTvA6fzQpi6u3kx8wZO8')
cleanupAllRelancesDoublons('tTvA6fzQpi6u3kx8wZO8')
  `);
}

const cleanupUtils = {
  cleanupRelancesDoublons,
  cleanupAllRelancesDoublons,
  updateConcertRelancesList
};

export default cleanupUtils;