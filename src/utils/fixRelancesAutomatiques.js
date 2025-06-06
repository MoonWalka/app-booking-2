/**
 * @fileoverview Utilitaire pour corriger les relances automatiques incohérentes
 * Corrige les cas où les relances ne sont pas dans le bon état
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { relancesAutomatiquesService } from '@/services/relancesAutomatiquesService';

/**
 * Corrige les relances automatiques pour un concert spécifique
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la correction
 */
export const fixRelancesConcert = async (concertId, organizationId) => {
  try {
    console.log(`🔧 Correction des relances automatiques pour le concert: ${concertId}`);

    // 1. Récupérer les données du concert
    const concertDoc = await getDoc(doc(db, 'concerts', concertId));
    if (!concertDoc.exists()) {
      throw new Error(`Concert ${concertId} non trouvé`);
    }

    const concert = { id: concertId, ...concertDoc.data() };
    console.log('📋 Concert récupéré:', concert.titre);

    // 2. Récupérer les données du formulaire si disponible
    let formulaireData = null;
    if (concert.formValidated && concert.formSubmissionId) {
      formulaireData = {
        id: concert.formSubmissionId,
        statut: 'valide',
        dateValidation: concert.formValidatedAt || new Date()
      };
      console.log('📋 Formulaire détecté comme validé');
    }

    // 3. Récupérer les données du contrat si disponible
    let contratData = null;
    const contratsQuery = query(
      collection(db, 'contrats'),
      where('concertId', '==', concertId),
      where('organizationId', '==', organizationId)
    );
    const contratsSnapshot = await getDocs(contratsQuery);
    
    if (!contratsSnapshot.empty) {
      const contratDoc = contratsSnapshot.docs[0];
      contratData = { id: contratDoc.id, ...contratDoc.data() };
      console.log('📋 Contrat détecté:', contratData.status);
    }

    // 4. Forcer la réévaluation des relances
    await relancesAutomatiquesService.evaluerEtMettreAJourRelances(
      concert,
      formulaireData,
      contratData,
      organizationId
    );

    console.log('✅ Correction des relances automatiques terminée');
    return {
      success: true,
      message: 'Relances automatiques corrigées avec succès',
      concert: concert.titre,
      formulaire: !!formulaireData,
      contrat: !!contratData
    };

  } catch (error) {
    console.error('❌ Erreur lors de la correction des relances:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Corrige les relances automatiques pour tous les concerts d'une organisation
 * 
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la correction globale
 */
export const fixAllRelances = async (organizationId) => {
  try {
    console.log(`🔧 Correction de toutes les relances pour l'organisation: ${organizationId}`);

    // Récupérer tous les concerts de l'organisation
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('organizationId', '==', organizationId)
    );
    const concertsSnapshot = await getDocs(concertsQuery);

    const results = [];
    for (const concertDoc of concertsSnapshot.docs) {
      const result = await fixRelancesConcert(concertDoc.id, organizationId);
      results.push({
        concertId: concertDoc.id,
        titre: concertDoc.data().titre,
        ...result
      });
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`✅ Correction terminée: ${successCount} succès, ${errorCount} erreurs`);

    return {
      success: true,
      totalConcerts: results.length,
      successCount,
      errorCount,
      results
    };

  } catch (error) {
    console.error('❌ Erreur lors de la correction globale:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Utilitaire pour la console du navigateur
 * Permet d'exécuter `fixRelancesConcert('concert-id', 'org-id')` dans la console
 */
if (typeof window !== 'undefined') {
  window.fixRelancesConcert = fixRelancesConcert;
  window.fixAllRelances = fixAllRelances;
  
  console.log(`
🔧 Utilitaires de correction des relances automatiques disponibles:

• fixRelancesConcert('concert-id', 'org-id') - Corriger un concert spécifique
• fixAllRelances('org-id') - Corriger tous les concerts d'une organisation

Exemples:
fixRelancesConcert('con-1749149822115-9cx49g', 'tTvA6fzQpi6u3kx8wZO8')
fixAllRelances('tTvA6fzQpi6u3kx8wZO8')
  `);
}

const fixUtils = {
  fixRelancesConcert,
  fixAllRelances
};

export default fixUtils;