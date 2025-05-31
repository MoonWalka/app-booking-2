/**
 * Script pour corriger les incohérences de champs de date dans les concerts
 */

import { collection, getDocs, updateDoc, doc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Corriger les concerts qui ont 'date' au lieu de 'dateEvenement'
 */
export const fixConcertDateFields = async () => {
  console.log('🔧 === CORRECTION DES CHAMPS DE DATE ===');
  
  try {
    const concertsRef = collection(db, 'concerts');
    const snapshot = await getDocs(concertsRef);
    
    console.log(`📊 Analyse de ${snapshot.docs.length} concerts...`);
    
    let fixedCount = 0;
    const problems = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      // Vérifier les problèmes de champs de date
      const hasDate = data.date !== undefined;
      const hasDateEvenement = data.dateEvenement !== undefined;
      
      console.log(`📄 Concert ${docId}:`, {
        titre: data.titre,
        hasDate,
        hasDateEvenement,
        date: data.date,
        dateEvenement: data.dateEvenement
      });
      
      // Cas 1: A 'date' mais pas 'dateEvenement' -> copier
      if (hasDate && !hasDateEvenement) {
        try {
          await updateDoc(doc(db, 'concerts', docId), {
            dateEvenement: data.date,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Corrigé: ${docId} - date -> dateEvenement`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Erreur correction ${docId}:`, error);
          problems.push({ docId, error: error.message, type: 'update_failed' });
        }
      }
      
      // Cas 2: Ni 'date' ni 'dateEvenement' -> problème
      if (!hasDate && !hasDateEvenement) {
        problems.push({ 
          docId, 
          error: 'Aucun champ de date trouvé', 
          type: 'missing_date',
          data: data 
        });
      }
      
      // Cas 3: Les deux existent mais sont différents -> avertissement
      if (hasDate && hasDateEvenement && data.date !== data.dateEvenement) {
        problems.push({ 
          docId, 
          error: 'Champs de date incohérents', 
          type: 'inconsistent_dates',
          date: data.date,
          dateEvenement: data.dateEvenement 
        });
      }
    }
    
    console.log(`\n📈 === RÉSULTATS ===`);
    console.log(`✅ Concerts corrigés: ${fixedCount}`);
    console.log(`⚠️ Problèmes détectés: ${problems.length}`);
    
    if (problems.length > 0) {
      console.log('\n🚨 === PROBLÈMES DÉTECTÉS ===');
      problems.forEach((problem, index) => {
        console.log(`${index + 1}. ${problem.docId}: ${problem.error}`);
        if (problem.type === 'missing_date') {
          console.log('   Données:', problem.data);
        } else if (problem.type === 'inconsistent_dates') {
          console.log(`   date: ${problem.date}, dateEvenement: ${problem.dateEvenement}`);
        }
      });
    }
    
    return {
      total: snapshot.docs.length,
      fixed: fixedCount,
      problems: problems
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  }
};

/**
 * Vérifier la cohérence des données sans les modifier
 */
export const auditConcertDates = async () => {
  console.log('📋 === AUDIT DES DATES DE CONCERTS ===');
  
  try {
    const concertsRef = collection(db, 'concerts');
    const snapshot = await getDocs(concertsRef);
    
    const audit = {
      total: snapshot.docs.length,
      withDate: 0,
      withDateEvenement: 0,
      withBoth: 0,
      withNeither: 0,
      inconsistent: 0,
      examples: []
    };
    
    snapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const hasDate = data.date !== undefined;
      const hasDateEvenement = data.dateEvenement !== undefined;
      
      if (hasDate) audit.withDate++;
      if (hasDateEvenement) audit.withDateEvenement++;
      if (hasDate && hasDateEvenement) audit.withBoth++;
      if (!hasDate && !hasDateEvenement) audit.withNeither++;
      if (hasDate && hasDateEvenement && data.date !== data.dateEvenement) {
        audit.inconsistent++;
      }
      
      // Garder quelques exemples
      if (audit.examples.length < 3) {
        audit.examples.push({
          id: docSnapshot.id,
          titre: data.titre,
          date: data.date,
          dateEvenement: data.dateEvenement
        });
      }
    });
    
    console.log('📊 Résultats de l\'audit:', audit);
    return audit;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    throw error;
  }
};

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.fixConcertDateFields = fixConcertDateFields;
  window.auditConcertDates = auditConcertDates;
}