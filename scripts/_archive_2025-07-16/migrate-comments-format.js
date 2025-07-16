#!/usr/bin/env node

/**
 * Script de migration pour convertir les commentaires de l'ancien format au nouveau
 * Ancien format: { content, createdBy, createdAt }
 * Nouveau format: { contenu, auteur, date }
 */

const admin = require('firebase-admin');
const serviceAccount = require('../keys/tourcraft-75d53-firebase-adminsdk-w18zp-96aac37cb4.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateComments() {
  console.log('🔄 Début de la migration des commentaires...\n');
  
  let totalStructures = 0;
  let totalPersonnes = 0;
  let totalCommentsMigrated = 0;
  
  try {
    // Migration des commentaires dans les structures
    console.log('📋 Migration des commentaires des structures...');
    const structuresSnapshot = await db.collection('structures').get();
    
    for (const doc of structuresSnapshot.docs) {
      const data = doc.data();
      if (data.commentaires && Array.isArray(data.commentaires)) {
        let needsUpdate = false;
        const updatedComments = data.commentaires.map(comment => {
          // Si le commentaire a l'ancien format
          if ((comment.content !== undefined || comment.createdBy !== undefined || comment.createdAt !== undefined) &&
              (comment.contenu === undefined || comment.auteur === undefined || comment.date === undefined)) {
            needsUpdate = true;
            totalCommentsMigrated++;
            
            return {
              id: comment.id || Date.now().toString(),
              contenu: comment.contenu || comment.content || '',
              auteur: comment.auteur || comment.createdBy || 'Utilisateur inconnu',
              date: comment.date || comment.createdAt || new Date(),
              modifie: comment.modifie || false,
              type: comment.type || 'general',
              // Conserver les autres propriétés
              ...(comment.personneContext && { personneContext: comment.personneContext })
            };
          }
          return comment;
        });
        
        if (needsUpdate) {
          await doc.ref.update({ commentaires: updatedComments });
          totalStructures++;
          console.log(`✅ Structure ${doc.id}: ${data.commentaires.length} commentaire(s) migré(s)`);
        }
      }
    }
    
    // Migration des commentaires dans les personnes
    console.log('\n📋 Migration des commentaires des personnes...');
    const personnesSnapshot = await db.collection('personnes').get();
    
    for (const doc of personnesSnapshot.docs) {
      const data = doc.data();
      if (data.commentaires && Array.isArray(data.commentaires)) {
        let needsUpdate = false;
        const updatedComments = data.commentaires.map(comment => {
          // Si le commentaire a l'ancien format
          if ((comment.content !== undefined || comment.createdBy !== undefined || comment.createdAt !== undefined) &&
              (comment.contenu === undefined || comment.auteur === undefined || comment.date === undefined)) {
            needsUpdate = true;
            totalCommentsMigrated++;
            
            return {
              id: comment.id || Date.now().toString(),
              contenu: comment.contenu || comment.content || '',
              auteur: comment.auteur || comment.createdBy || 'Utilisateur inconnu',
              date: comment.date || comment.createdAt || new Date(),
              modifie: comment.modifie || false,
              type: comment.type || 'general',
              // Conserver les autres propriétés
              ...(comment.personneContext && { personneContext: comment.personneContext })
            };
          }
          return comment;
        });
        
        if (needsUpdate) {
          await doc.ref.update({ commentaires: updatedComments });
          totalPersonnes++;
          console.log(`✅ Personne ${doc.id}: ${data.commentaires.length} commentaire(s) migré(s)`);
        }
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`- Structures mises à jour: ${totalStructures}`);
    console.log(`- Personnes mises à jour: ${totalPersonnes}`);
    console.log(`- Total de commentaires migrés: ${totalCommentsMigrated}`);
    console.log('\n✅ Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter la migration
migrateComments();