/**
 * Script manuel pour corriger les structures sans organizationId
 * Utilise l'API cliente Firebase
 */

import { db } from '../src/services/firebase-service';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

async function fixStructures() {
  console.log('🔧 Correction manuelle des structures sans organizationId\n');
  
  try {
    // Récupérer toutes les structures
    const structuresRef = collection(db, 'structures');
    const snapshot = await getDocs(structuresRef);
    
    console.log(`Total structures: ${snapshot.size}`);
    
    // L'organizationId par défaut
    const defaultOrgId = 'tTvA6fzQpi6u3kx8wZO8';
    let count = 0;
    
    // Parcourir et corriger
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      if (!data.organizationId) {
        console.log(`\n📝 Correction de: ${data.nom || data.raisonSociale || docSnap.id}`);
        
        await updateDoc(doc(db, 'structures', docSnap.id), {
          organizationId: defaultOrgId,
          updatedAt: new Date()
        });
        
        count++;
      }
    }
    
    console.log(`\n✅ ${count} structures corrigées`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter
fixStructures();