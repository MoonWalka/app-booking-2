/**
 * @fileoverview Utilitaires de diagnostic pour les relances automatiques
 * Permet de débugger et tester le système de relances automatiques
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { relancesAutomatiquesService, RELANCE_TYPES } from '@/services/relancesAutomatiquesService';
import { db } from '@/services/firebase-service';
import { collection, query, where, getDocs, doc, getDoc } from '@/services/firebase-service';

/**
 * Diagnostic complet des relances automatiques
 * 
 * @param {string} concertId - ID du concert à analyser
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Rapport de diagnostic
 */
export const diagnosticRelancesAutomatiques = async (concertId, organizationId) => {
  const rapport = {
    timestamp: new Date().toISOString(),
    concertId,
    organizationId,
    concert: null,
    relancesExistantes: [],
    etatConcert: null,
    recommandations: [],
    erreurs: []
  };

  try {
    console.log('🔍 Début du diagnostic des relances automatiques');
    console.log(`📋 Concert: ${concertId}`);
    console.log(`🏢 Organisation: ${organizationId}`);

    // 1. Vérifier que le concert existe
    try {
      const concertDoc = await getDoc(doc(db, 'concerts', concertId));
      if (concertDoc.exists()) {
        rapport.concert = { id: concertId, ...concertDoc.data() };
        console.log('✅ Concert trouvé:', rapport.concert.titre);
      } else {
        rapport.erreurs.push('Concert non trouvé');
        console.error('❌ Concert non trouvé');
        return rapport;
      }
    } catch (error) {
      rapport.erreurs.push(`Erreur lecture concert: ${error.message}`);
      console.error('❌ Erreur lecture concert:', error);
      return rapport;
    }

    // 2. Récupérer les relances existantes
    try {
      const relancesQuery = query(
        collection(db, 'relances'),
        where('concertId', '==', concertId),
        where('organizationId', '==', organizationId),
        where('automatique', '==', true)
      );
      
      const relancesSnapshot = await getDocs(relancesQuery);
      rapport.relancesExistantes = relancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📋 ${rapport.relancesExistantes.length} relances automatiques trouvées`);
      rapport.relancesExistantes.forEach(relance => {
        console.log(`  - ${relance.nom} (${relance.type}) - Terminée: ${relance.terminee}`);
      });

    } catch (error) {
      rapport.erreurs.push(`Erreur lecture relances: ${error.message}`);
      console.error('❌ Erreur lecture relances:', error);
    }

    // 3. Évaluer l'état du concert
    try {
      rapport.etatConcert = evaluerEtatConcertDetaille(rapport.concert);
      console.log('📊 État du concert évalué:', rapport.etatConcert);
    } catch (error) {
      rapport.erreurs.push(`Erreur évaluation état: ${error.message}`);
      console.error('❌ Erreur évaluation état:', error);
    }

    // 4. Analyser quelles relances devraient exister
    if (rapport.etatConcert) {
      for (const [typeId, typeConfig] of Object.entries(RELANCE_TYPES)) {
        if (typeConfig.futur) continue; // Ignorer les fonctionnalités futures

        const devaitExister = verifierConditionsDetaille(typeConfig.conditions, rapport.etatConcert);
        const existe = rapport.relancesExistantes.find(r => r.type === typeId && !r.terminee);

        if (devaitExister && !existe) {
          rapport.recommandations.push({
            action: 'créer',
            type: typeId,
            nom: typeConfig.nom,
            raison: 'Conditions remplies mais relance manquante'
          });
        } else if (!devaitExister && existe) {
          rapport.recommandations.push({
            action: 'terminer',
            type: typeId,
            nom: typeConfig.nom,
            raison: 'Conditions non remplies mais relance active'
          });
        }
      }
    }

    console.log(`💡 ${rapport.recommandations.length} recommandations générées`);
    rapport.recommandations.forEach(rec => {
      console.log(`  - ${rec.action.toUpperCase()}: ${rec.nom} (${rec.raison})`);
    });

  } catch (error) {
    rapport.erreurs.push(`Erreur générale: ${error.message}`);
    console.error('❌ Erreur générale diagnostic:', error);
  }

  console.log('🏁 Diagnostic terminé');
  return rapport;
};

/**
 * Évalue l'état d'un concert de manière détaillée
 * 
 * @private
 * @param {Object} concert - Données du concert
 * @returns {Object} État détaillé
 */
function evaluerEtatConcertDetaille(concert) {
  const etat = {
    concert_cree: !!concert,
    formulaire_envoye: false,
    formulaire_recu: false,
    formulaire_valide: false,
    contrat_genere: false,
    contrat_envoye: false,
    contrat_signe: false,
    facture_envoyee: false,
    
    // Informations détaillées
    details: {
      champsEssentiels: {
        titre: !!concert.titre,
        date: !!concert.date,
        contactId: !!concert.contactId,
        artisteId: !!concert.artisteId,
        lieuId: !!concert.lieuId
      },
      formulaire: {
        formValidated: !!concert.formValidated,
        formSubmissionId: !!concert.formSubmissionId,
        formValidatedAt: !!concert.formValidatedAt
      },
      contrat: {
        // À implémenter selon la structure des données de contrat
      }
    }
  };

  // Analyser l'état du formulaire
  if (concert.formValidated) {
    etat.formulaire_envoye = true;
    etat.formulaire_recu = true;
    etat.formulaire_valide = true;
  } else if (concert.formSubmissionId) {
    etat.formulaire_envoye = true;
    etat.formulaire_recu = true;
  }

  // Analyser si le concert semble complet
  const champsEssentiels = ['titre', 'date', 'contactId', 'artisteId', 'lieuId'];
  const champsCompletes = champsEssentiels.filter(champ => !!concert[champ]);
  
  console.log(`📊 Champs essentiels: ${champsCompletes.length}/${champsEssentiels.length}`);
  console.log(`   Complétés: ${champsCompletes.join(', ')}`);
  console.log(`   Manquants: ${champsEssentiels.filter(champ => !concert[champ]).join(', ')}`);

  if (champsCompletes.length === champsEssentiels.length) {
    // Concert complet, probablement formulaire envoyé implicitement
    etat.formulaire_envoye = true;
  }

  return etat;
}

/**
 * Vérifie les conditions de manière détaillée
 * 
 * @private
 * @param {Object} conditions - Conditions à vérifier
 * @param {Object} etatConcert - État du concert
 * @returns {boolean} True si conditions remplies
 */
function verifierConditionsDetaille(conditions, etatConcert) {
  const resultats = [];
  
  for (const [cle, valeurAttendue] of Object.entries(conditions)) {
    const valeurActuelle = etatConcert[cle];
    const correspond = valeurActuelle === valeurAttendue;
    
    resultats.push({
      condition: cle,
      attendue: valeurAttendue,
      actuelle: valeurActuelle,
      correspond
    });
    
    console.log(`   ${cle}: ${valeurActuelle} === ${valeurAttendue} ? ${correspond ? '✅' : '❌'}`);
  }
  
  return resultats.every(r => r.correspond);
}

/**
 * Teste la création manuelle d'une relance
 * 
 * @param {string} concertId - ID du concert
 * @param {string} organizationId - ID de l'organisation
 * @param {string} typeRelance - Type de relance à créer
 * @returns {Promise<Object>} Résultat du test
 */
export const testerCreationRelanceManuelle = async (concertId, organizationId, typeRelance = 'envoyer_formulaire') => {
  try {
    console.log(`🧪 Test création relance manuelle: ${typeRelance}`);
    
    // Récupérer le concert
    const concertDoc = await getDoc(doc(db, 'concerts', concertId));
    if (!concertDoc.exists()) {
      throw new Error('Concert non trouvé');
    }
    
    const concert = { id: concertId, ...concertDoc.data() };
    console.log('📋 Concert récupéré:', concert.titre);
    
    // Utiliser le service directement
    await relancesAutomatiquesService.evaluerEtMettreAJourRelances(
      concert,
      null, // formulaireData
      null, // contratData
      organizationId
    );
    
    console.log('✅ Test de création réussi');
    return { succes: true, message: 'Relance créée avec succès' };
    
  } catch (error) {
    console.error('❌ Erreur test création:', error);
    return { succes: false, erreur: error.message };
  }
};

/**
 * Affiche un rapport de diagnostic dans la console de manière formatée
 * 
 * @param {Object} rapport - Rapport de diagnostic
 */
export const afficherRapportDiagnostic = (rapport) => {
  console.group('📊 RAPPORT DIAGNOSTIC RELANCES AUTOMATIQUES');
  
  console.log(`🕒 Timestamp: ${rapport.timestamp}`);
  console.log(`🎵 Concert: ${rapport.concert?.titre || 'Non trouvé'} (${rapport.concertId})`);
  console.log(`🏢 Organisation: ${rapport.organizationId}`);
  
  if (rapport.erreurs.length > 0) {
    console.group('❌ Erreurs détectées');
    rapport.erreurs.forEach(erreur => console.error(`- ${erreur}`));
    console.groupEnd();
  }
  
  if (rapport.etatConcert) {
    console.group('📊 État du concert');
    Object.entries(rapport.etatConcert).forEach(([key, value]) => {
      if (key !== 'details') {
        console.log(`${key}: ${value ? '✅' : '❌'}`);
      }
    });
    console.groupEnd();
  }
  
  if (rapport.relancesExistantes.length > 0) {
    console.group('📋 Relances existantes');
    rapport.relancesExistantes.forEach(relance => {
      console.log(`- ${relance.nom} (${relance.type}) - ${relance.terminee ? '✅ Terminée' : '⏳ Active'}`);
    });
    console.groupEnd();
  }
  
  if (rapport.recommandations.length > 0) {
    console.group('💡 Recommandations');
    rapport.recommandations.forEach(rec => {
      console.log(`- ${rec.action.toUpperCase()}: ${rec.nom} (${rec.raison})`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

const debugUtils = {
  diagnosticRelancesAutomatiques,
  testerCreationRelanceManuelle,
  afficherRapportDiagnostic
};

export default debugUtils;