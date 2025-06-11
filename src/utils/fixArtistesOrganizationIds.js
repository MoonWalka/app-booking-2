import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Corrige spécifiquement les artistes sans organizationId
 * @param {string} organizationId - ID de l'organisation à attribuer
 * @returns {Promise<{success: number, errors: Array}>}
 */
export async function fixArtistesOrganizationIds(organizationId) {
  if (!organizationId) {
    throw new Error('organizationId est requis');
  }

  console.log(`🎵 Correction des organizationId manquants pour les artistes...`);
  console.log(`Organisation ID: ${organizationId}`);
  
  try {
    // Récupérer tous les artistes
    const artistesSnapshot = await getDocs(collection(db, 'artistes'));
    
    // Analyser et filtrer ceux qui n'ont pas d'organizationId
    const artistesToFix = [];
    let totalArtistes = 0;
    let artistesWithOrgId = 0;
    
    artistesSnapshot.forEach(docSnapshot => {
      totalArtistes++;
      const data = docSnapshot.data();
      if (!data.organizationId) {
        artistesToFix.push({ 
          id: docSnapshot.id, 
          nom: data.nom || 'Sans nom',
          style: data.style || 'Non défini'
        });
      } else {
        artistesWithOrgId++;
      }
    });

    console.log(`\n📊 Analyse des artistes:`);
    console.log(`- Total artistes: ${totalArtistes}`);
    console.log(`- Avec organizationId: ${artistesWithOrgId}`);
    console.log(`- Sans organizationId: ${artistesToFix.length}`);

    if (artistesToFix.length === 0) {
      console.log(`✅ Tous les artistes ont déjà un organizationId!`);
      return { success: 0, errors: [], alreadyFixed: true };
    }

    // Afficher quelques exemples
    console.log(`\nExemples d'artistes à corriger:`);
    artistesToFix.slice(0, 5).forEach(artiste => {
      console.log(`- ${artiste.nom} (${artiste.style}) - ID: ${artiste.id}`);
    });
    if (artistesToFix.length > 5) {
      console.log(`... et ${artistesToFix.length - 5} autres`);
    }

    // Demander confirmation
    const confirmMessage = `\n⚠️  Voulez-vous ajouter l'organizationId "${organizationId}" à ${artistesToFix.length} artistes?\n` +
                          `Tapez "OUI" pour confirmer ou toute autre touche pour annuler: `;
    
    const confirmation = window.prompt(confirmMessage);
    
    if (confirmation?.toUpperCase() !== 'OUI') {
      console.log('❌ Correction annulée');
      return { success: 0, errors: [], cancelled: true };
    }

    // Procéder à la correction par batch
    const maxBatchSize = 500;
    const errors = [];
    let successCount = 0;

    console.log(`\n🔧 Début de la correction...`);

    for (let i = 0; i < artistesToFix.length; i += maxBatchSize) {
      const batch = writeBatch(db);
      const currentBatch = artistesToFix.slice(i, i + maxBatchSize);

      currentBatch.forEach(({ id }) => {
        const docRef = doc(db, 'artistes', id);
        batch.update(docRef, { 
          organizationId,
          updatedAt: new Date(),
          organizationIdAddedAt: new Date() // Pour traçabilité
        });
      });

      try {
        await batch.commit();
        successCount += currentBatch.length;
        console.log(`✅ Batch ${Math.floor(i / maxBatchSize) + 1}: ${currentBatch.length} artistes corrigés`);
      } catch (error) {
        console.error(`❌ Erreur batch:`, error);
        errors.push(error);
      }
    }

    console.log(`\n🎯 Résultat final:`);
    console.log(`- ${successCount} artistes corrigés avec succès`);
    console.log(`- ${errors.length} erreurs`);
    
    if (successCount > 0) {
      console.log(`\n✅ Les artistes devraient maintenant apparaître dans la recherche!`);
    }

    return { success: successCount, errors };

  } catch (error) {
    console.error(`❌ Erreur lors de la correction des artistes:`, error);
    throw error;
  }
}

/**
 * Analyse les artistes pour détecter les doublons
 */
export async function analyzeArtistesDuplicates() {
  console.log(`🔍 Analyse des doublons d'artistes...`);
  
  const artistesSnapshot = await getDocs(collection(db, 'artistes'));
  const artistesByName = new Map();
  
  artistesSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.nom) {
      const nomLower = data.nom.toLowerCase().trim();
      if (!artistesByName.has(nomLower)) {
        artistesByName.set(nomLower, []);
      }
      artistesByName.get(nomLower).push({ id: doc.id, ...data });
    }
  });
  
  const duplicates = [];
  artistesByName.forEach((artistes, nom) => {
    if (artistes.length > 1) {
      duplicates.push({ nom, artistes });
    }
  });
  
  console.log(`\n📊 Résultat de l'analyse:`);
  console.log(`- ${duplicates.length} noms d'artistes en double trouvés`);
  
  if (duplicates.length > 0) {
    console.log(`\nDoublons détectés:`);
    duplicates.forEach(({ nom, artistes }) => {
      console.log(`\n"${nom}" (${artistes.length} occurrences):`);
      artistes.forEach(artiste => {
        console.log(`  - ID: ${artiste.id} | Org: ${artiste.organizationId || 'AUCUN'} | Style: ${artiste.style || 'N/A'}`);
      });
    });
  }
  
  return duplicates;
}

/**
 * Fonction helper pour lancer la correction depuis la console
 */
export function installArtistesFixers() {
  if (typeof window !== 'undefined') {
    window.fixArtistesOrganizationIds = fixArtistesOrganizationIds;
    window.analyzeArtistesDuplicates = analyzeArtistesDuplicates;
    console.log('🎵 Helpers artistes installés!');
    console.log('- Correction: await window.fixArtistesOrganizationIds("votre-organization-id")');
    console.log('- Analyse doublons: await window.analyzeArtistesDuplicates()');
  }
}

// Auto-installer les helpers
installArtistesFixers();