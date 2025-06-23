#!/usr/bin/env node

/**
 * Script de diagnostic pour analyser le format des commentaires dans Firebase
 */

const admin = require('firebase-admin');
const serviceAccount = require('../keys/tourcraft-75d53-firebase-adminsdk-w18zp-96aac37cb4.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function diagnoseComments() {
  console.log('🔍 Diagnostic des commentaires dans Firebase...\n');
  
  let stats = {
    structures: {
      total: 0,
      withComments: 0,
      oldFormat: 0,
      newFormat: 0,
      mixedFormat: 0
    },
    personnes: {
      total: 0,
      withComments: 0,
      oldFormat: 0,
      newFormat: 0,
      mixedFormat: 0
    },
    commentDetails: {
      totalComments: 0,
      oldFormatComments: 0,
      newFormatComments: 0
    }
  };
  
  try {
    // Analyser les structures
    console.log('📋 Analyse des structures...');
    const structuresSnapshot = await db.collection('structures').get();
    stats.structures.total = structuresSnapshot.size;
    
    for (const doc of structuresSnapshot.docs) {
      const data = doc.data();
      if (data.commentaires && Array.isArray(data.commentaires) && data.commentaires.length > 0) {
        stats.structures.withComments++;
        
        let hasOldFormat = false;
        let hasNewFormat = false;
        
        data.commentaires.forEach(comment => {
          stats.commentDetails.totalComments++;
          
          // Vérifier le format
          if (comment.content !== undefined || comment.createdBy !== undefined || comment.createdAt !== undefined) {
            hasOldFormat = true;
            stats.commentDetails.oldFormatComments++;
          }
          if (comment.contenu !== undefined && comment.auteur !== undefined && comment.date !== undefined) {
            hasNewFormat = true;
            stats.commentDetails.newFormatComments++;
          }
        });
        
        if (hasOldFormat && hasNewFormat) {
          stats.structures.mixedFormat++;
          console.log(`⚠️  Structure ${doc.id} a un format mixte (${data.commentaires.length} commentaires)`);
        } else if (hasOldFormat) {
          stats.structures.oldFormat++;
          console.log(`🔴 Structure ${doc.id} utilise l'ancien format (${data.commentaires.length} commentaires)`);
          // Afficher un exemple
          if (data.commentaires[0]) {
            console.log('   Exemple:', {
              content: data.commentaires[0].content?.substring(0, 50) + '...',
              createdBy: data.commentaires[0].createdBy,
              createdAt: data.commentaires[0].createdAt
            });
          }
        } else if (hasNewFormat) {
          stats.structures.newFormat++;
          console.log(`🟢 Structure ${doc.id} utilise le nouveau format (${data.commentaires.length} commentaires)`);
        }
      }
    }
    
    // Analyser les personnes
    console.log('\n📋 Analyse des personnes...');
    const personnesSnapshot = await db.collection('personnes').get();
    stats.personnes.total = personnesSnapshot.size;
    
    for (const doc of personnesSnapshot.docs) {
      const data = doc.data();
      if (data.commentaires && Array.isArray(data.commentaires) && data.commentaires.length > 0) {
        stats.personnes.withComments++;
        
        let hasOldFormat = false;
        let hasNewFormat = false;
        
        data.commentaires.forEach(comment => {
          stats.commentDetails.totalComments++;
          
          // Vérifier le format
          if (comment.content !== undefined || comment.createdBy !== undefined || comment.createdAt !== undefined) {
            hasOldFormat = true;
            stats.commentDetails.oldFormatComments++;
          }
          if (comment.contenu !== undefined && comment.auteur !== undefined && comment.date !== undefined) {
            hasNewFormat = true;
            stats.commentDetails.newFormatComments++;
          }
        });
        
        if (hasOldFormat && hasNewFormat) {
          stats.personnes.mixedFormat++;
          console.log(`⚠️  Personne ${doc.id} a un format mixte (${data.commentaires.length} commentaires)`);
        } else if (hasOldFormat) {
          stats.personnes.oldFormat++;
          console.log(`🔴 Personne ${doc.id} utilise l'ancien format (${data.commentaires.length} commentaires)`);
          // Afficher un exemple
          if (data.commentaires[0]) {
            console.log('   Exemple:', {
              content: data.commentaires[0].content?.substring(0, 50) + '...',
              createdBy: data.commentaires[0].createdBy,
              createdAt: data.commentaires[0].createdAt
            });
          }
        } else if (hasNewFormat) {
          stats.personnes.newFormat++;
          console.log(`🟢 Personne ${doc.id} utilise le nouveau format (${data.commentaires.length} commentaires)`);
        }
      }
    }
    
    // Afficher le résumé
    console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('\nStructures:');
    console.log(`- Total: ${stats.structures.total}`);
    console.log(`- Avec commentaires: ${stats.structures.withComments}`);
    console.log(`- Ancien format: ${stats.structures.oldFormat}`);
    console.log(`- Nouveau format: ${stats.structures.newFormat}`);
    console.log(`- Format mixte: ${stats.structures.mixedFormat}`);
    
    console.log('\nPersonnes:');
    console.log(`- Total: ${stats.personnes.total}`);
    console.log(`- Avec commentaires: ${stats.personnes.withComments}`);
    console.log(`- Ancien format: ${stats.personnes.oldFormat}`);
    console.log(`- Nouveau format: ${stats.personnes.newFormat}`);
    console.log(`- Format mixte: ${stats.personnes.mixedFormat}`);
    
    console.log('\nCommentaires:');
    console.log(`- Total: ${stats.commentDetails.totalComments}`);
    console.log(`- Ancien format: ${stats.commentDetails.oldFormatComments}`);
    console.log(`- Nouveau format: ${stats.commentDetails.newFormatComments}`);
    
    if (stats.structures.oldFormat > 0 || stats.personnes.oldFormat > 0) {
      console.log('\n⚠️  Des commentaires utilisent l\'ancien format!');
      console.log('Exécutez le script de migration: node scripts/migrate-comments-format.js');
    } else {
      console.log('\n✅ Tous les commentaires utilisent le nouveau format!');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter le diagnostic
diagnoseComments();