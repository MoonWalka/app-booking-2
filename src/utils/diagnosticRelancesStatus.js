/**
 * @fileoverview Diagnostic rapide de l'état des relances automatiques
 * Affiche un rapport détaillé dans la console
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Effectue un diagnostic rapide des relances automatiques
 * 
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Rapport de diagnostic
 */
export const diagnosticRelancesStatus = async (organizationId) => {
  try {
    console.log(`\n🔍 DIAGNOSTIC DES RELANCES AUTOMATIQUES`);
    console.log(`🏢 Organisation: ${organizationId}`);
    console.log('═'.repeat(50));

    // 1. Récupérer tous les concerts
    const concertsSnapshot = await getDocs(
      query(collection(db, 'concerts'), where('organizationId', '==', organizationId))
    );
    
    console.log(`\n📊 Concerts trouvés: ${concertsSnapshot.size}`);

    // 2. Récupérer toutes les relances automatiques
    const relancesSnapshot = await getDocs(
      query(
        collection(db, 'relances'),
        where('organizationId', '==', organizationId),
        where('automatique', '==', true)
      )
    );
    
    console.log(`📊 Relances automatiques trouvées: ${relancesSnapshot.size}`);

    // 3. Analyser les doublons
    const relancesParConcert = {};
    const doublons = [];
    
    relancesSnapshot.docs.forEach(doc => {
      const relance = { id: doc.id, ...doc.data() };
      const key = `${relance.concertId}_${relance.type}`;
      
      if (!relancesParConcert[key]) {
        relancesParConcert[key] = [];
      }
      
      relancesParConcert[key].push(relance);
    });

    // Identifier les doublons
    Object.entries(relancesParConcert).forEach(([key, relances]) => {
      if (relances.length > 1) {
        doublons.push({
          key,
          count: relances.length,
          relances: relances.map(r => ({
            id: r.id,
            nom: r.nom,
            dateCreation: r.dateCreation?.seconds 
              ? new Date(r.dateCreation.seconds * 1000).toLocaleString()
              : 'Date inconnue'
          }))
        });
      }
    });

    if (doublons.length > 0) {
      console.log(`\n⚠️  DOUBLONS DÉTECTÉS: ${doublons.length} cas`);
      doublons.forEach(doublon => {
        const [concertId, type] = doublon.key.split('_');
        console.log(`\n  Concert: ${concertId}`);
        console.log(`  Type: ${type}`);
        console.log(`  Nombre de doublons: ${doublon.count}`);
        doublon.relances.forEach((r, i) => {
          console.log(`    ${i + 1}. ${r.id} - ${r.dateCreation}`);
        });
      });
    } else {
      console.log('\n✅ Aucun doublon détecté');
    }

    // 4. Vérifier la cohérence des listes
    let incoherences = 0;
    
    for (const concertDoc of concertsSnapshot.docs) {
      const concert = concertDoc.data();
      const relancesListeConcert = concert.relances || [];
      
      // Récupérer les vraies relances du concert
      const relancesConcert = relancesSnapshot.docs
        .filter(doc => doc.data().concertId === concertDoc.id)
        .map(doc => doc.id);
      
      if (relancesListeConcert.length !== relancesConcert.length) {
        incoherences++;
        console.log(`\n⚠️  Incohérence pour concert ${concertDoc.id}:`);
        console.log(`   Liste dans concert: ${relancesListeConcert.length} relances`);
        console.log(`   Relances réelles: ${relancesConcert.length} relances`);
      }
    }

    if (incoherences > 0) {
      console.log(`\n⚠️  INCOHÉRENCES: ${incoherences} concerts avec listes incorrectes`);
    } else {
      console.log('\n✅ Toutes les listes sont cohérentes');
    }

    // 5. Résumé
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RÉSUMÉ:');
    console.log(`  • Concerts: ${concertsSnapshot.size}`);
    console.log(`  • Relances automatiques: ${relancesSnapshot.size}`);
    console.log(`  • Doublons: ${doublons.length} cas`);
    console.log(`  • Incohérences: ${incoherences} concerts`);
    
    const totalDoublons = doublons.reduce((sum, d) => sum + (d.count - 1), 0);
    if (totalDoublons > 0) {
      console.log(`\n💡 RECOMMANDATION: Exécuter cleanupAllRelancesDoublons('${organizationId}') pour nettoyer ${totalDoublons} doublons`);
    }
    
    if (incoherences > 0) {
      console.log(`💡 RECOMMANDATION: Exécuter fixAllRelances('${organizationId}') pour corriger les incohérences`);
    }

    return {
      concerts: concertsSnapshot.size,
      relances: relancesSnapshot.size,
      doublons: doublons.length,
      totalDoublons,
      incoherences
    };

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    throw error;
  }
};

/**
 * Affiche les relances d'un concert spécifique
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 */
export const afficherRelancesConcert = async (concertId, organizationId) => {
  try {
    console.log(`\n🔍 RELANCES DU CONCERT ${concertId}`);
    console.log('═'.repeat(50));

    // Récupérer les relances
    const relancesSnapshot = await getDocs(
      query(
        collection(db, 'relances'),
        where('concertId', '==', concertId),
        where('organizationId', '==', organizationId)
      )
    );

    console.log(`📊 Total: ${relancesSnapshot.size} relances`);
    
    const relances = relancesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Séparer automatiques et manuelles
    const automatiques = relances.filter(r => r.automatique);
    const manuelles = relances.filter(r => !r.automatique);

    console.log(`  • Automatiques: ${automatiques.length}`);
    console.log(`  • Manuelles: ${manuelles.length}`);

    if (automatiques.length > 0) {
      console.log('\n📋 RELANCES AUTOMATIQUES:');
      automatiques.forEach((r, i) => {
        const date = r.dateCreation?.seconds 
          ? new Date(r.dateCreation.seconds * 1000).toLocaleString()
          : 'Date inconnue';
        console.log(`  ${i + 1}. ${r.nom} (${r.type})`);
        console.log(`     ID: ${r.id}`);
        console.log(`     Créée: ${date}`);
        console.log(`     Terminée: ${r.terminee ? '✅' : '❌'}`);
      });
    }

    if (manuelles.length > 0) {
      console.log('\n📋 RELANCES MANUELLES:');
      manuelles.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.nom}`);
        console.log(`     ID: ${r.id}`);
        console.log(`     Terminée: ${r.terminee ? '✅' : '❌'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage:', error);
    throw error;
  }
};

// Rendre disponible dans la console
if (typeof window !== 'undefined') {
  window.diagnosticRelancesStatus = diagnosticRelancesStatus;
  window.afficherRelancesConcert = afficherRelancesConcert;
  
  console.log(`
🔍 Outils de diagnostic disponibles:

• diagnosticRelancesStatus('org-id') - Diagnostic complet de l'organisation
• afficherRelancesConcert('concert-id', 'org-id') - Afficher les relances d'un concert

Exemples:
diagnosticRelancesStatus('tTvA6fzQpi6u3kx8wZO8')
afficherRelancesConcert('con-1749149822115-9cx49g', 'tTvA6fzQpi6u3kx8wZO8')
  `);
}

const diagnosticUtils = {
  diagnosticRelancesStatus,
  afficherRelancesConcert
};

export default diagnosticUtils;