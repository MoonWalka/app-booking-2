/**
 * Script de réparation des relations bidirectionnelles dans le navigateur
 * Corrige les relations entre concerts et artistes
 */

import { db } from '@/services/firebase-service';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function fixArtisteConcertRelations(organizationId) {
  console.log('🔧 Réparation des relations artiste-concert...');
  
  const stats = {
    checked: 0,
    fixed: 0,
    errors: 0
  };
  
  try {
    // 1. Récupérer tous les concerts de l'organisation
    console.log('📋 Récupération des concerts...');
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('organizationId', '==', organizationId)
    );
    const concertsSnapshot = await getDocs(concertsQuery);
    
    console.log(`   Trouvé ${concertsSnapshot.size} concerts`);
    
    // 2. Pour chaque concert avec un artiste, vérifier la relation inverse
    for (const concertDoc of concertsSnapshot.docs) {
      const concert = { id: concertDoc.id, ...concertDoc.data() };
      stats.checked++;
      
      if (concert.artisteId) {
        try {
          // Récupérer l'artiste
          const artisteRef = doc(db, 'artistes', concert.artisteId);
          const artisteDoc = await getDoc(artisteRef);
          
          if (artisteDoc.exists()) {
            const artiste = artisteDoc.data();
            const concertsIds = artiste.concertsIds || [];
            
            // Vérifier si le concert est dans la liste
            if (!concertsIds.includes(concert.id)) {
              console.log(`✅ Ajout du concert "${concert.titre}" à l'artiste "${artiste.nom}"`);
              
              await updateDoc(artisteRef, {
                concertsIds: arrayUnion(concert.id),
                updatedAt: new Date()
              });
              
              stats.fixed++;
            }
          } else {
            console.warn(`⚠️ Artiste ${concert.artisteId} introuvable pour le concert "${concert.titre}"`);
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la mise à jour du concert "${concert.titre}":`, error);
          stats.errors++;
        }
      }
    }
    
    // 3. Afficher le résumé
    console.log('\n📊 RÉSUMÉ');
    console.log('===========');
    console.log(`Concerts vérifiés: ${stats.checked}`);
    console.log(`Relations corrigées: ${stats.fixed}`);
    console.log(`Erreurs: ${stats.errors}`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
    throw error;
  }
}

// Fonction utilitaire à appeler depuis la console
window.fixArtisteConcertRelations = fixArtisteConcertRelations;