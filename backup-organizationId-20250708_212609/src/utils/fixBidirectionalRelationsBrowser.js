/**
 * Script de réparation des relations bidirectionnelles dans le navigateur
 * Corrige les relations entre dates et artistes
 */

import { db } from '@/services/firebase-service';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function fixArtisteDateRelations(organizationId) {
  console.log('🔧 Réparation des relations artiste-date...');
  
  const stats = {
    checked: 0,
    fixed: 0,
    errors: 0
  };
  
  try {
    // 1. Récupérer tous les dates de l'organisation
    console.log('📋 Récupération des dates...');
    const datesQuery = query(
      collection(db, 'dates'),
      where('organizationId', '==', organizationId)
    );
    const datesSnapshot = await getDocs(datesQuery);
    
    console.log(`   Trouvé ${datesSnapshot.size} dates`);
    
    // 2. Pour chaque date avec un artiste, vérifier la relation inverse
    for (const dateDoc of datesSnapshot.docs) {
      const date = { id: dateDoc.id, ...dateDoc.data() };
      stats.checked++;
      
      if (date.artisteId) {
        try {
          // Récupérer l'artiste
          const artisteRef = doc(db, 'artistes', date.artisteId);
          const artisteDoc = await getDoc(artisteRef);
          
          if (artisteDoc.exists()) {
            const artiste = artisteDoc.data();
            const datesIds = artiste.datesIds || [];
            
            // Vérifier si le date est dans la liste
            if (!datesIds.includes(date.id)) {
              console.log(`✅ Ajout du date "${date.titre}" à l'artiste "${artiste.nom}"`);
              
              await updateDoc(artisteRef, {
                datesIds: arrayUnion(date.id),
                updatedAt: new Date()
              });
              
              stats.fixed++;
            }
          } else {
            console.warn(`⚠️ Artiste ${date.artisteId} introuvable pour le date "${date.titre}"`);
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la mise à jour du date "${date.titre}":`, error);
          stats.errors++;
        }
      }
    }
    
    // 3. Afficher le résumé
    console.log('\n📊 RÉSUMÉ');
    console.log('===========');
    console.log(`Dates vérifiés: ${stats.checked}`);
    console.log(`Relations corrigées: ${stats.fixed}`);
    console.log(`Erreurs: ${stats.errors}`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
    throw error;
  }
}

// Fonction utilitaire à appeler depuis la console
window.fixArtisteDateRelations = fixArtisteDateRelations;