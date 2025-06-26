const admin = require('firebase-admin');

// Initialiser Firebase Admin avec le fichier de clé de service
if (!admin.apps.length) {
  const serviceAccount = require('./service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function auditContactsUnified() {
  console.log('\n========== AUDIT FINAL CONTACTS_UNIFIED ==========\n');
  
  try {
    // 1. Compter les documents dans contacts_unified
    console.log('1. COMPTAGE DES DOCUMENTS DANS CONTACTS_UNIFIED\n');
    const contactsUnifiedRef = db.collection('contacts_unified');
    const snapshot = await contactsUnifiedRef.get();
    console.log(`   Nombre total de documents: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      // Analyser les types de contacts
      const types = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        const type = data.entityType || 'unknown';
        types[type] = (types[type] || 0) + 1;
      });
      
      console.log('\n   Répartition par type:');
      Object.entries(types).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
      
      // Échantillon de documents
      console.log('\n   Échantillon (5 premiers documents):');
      let count = 0;
      snapshot.forEach(doc => {
        if (count < 5) {
          const data = doc.data();
          console.log(`   - ${doc.id}: ${data.entityType} - ${data.structureRaisonSociale || data.personneNom || 'Sans nom'}`);
          count++;
        }
      });
    }
    
    // 2. Vérifier les références dans les concerts
    console.log('\n\n2. RÉFÉRENCES DANS LES CONCERTS\n');
    const concertsRef = db.collection('concerts');
    const concertsWithContactUnified = await concertsRef
      .where('contactId', '!=', null)
      .get();
    
    console.log(`   Concerts avec contactId (ancien format): ${concertsWithContactUnified.size}`);
    
    if (concertsWithContactUnified.size > 0) {
      console.log('\n   Échantillon (5 premiers):');
      let count = 0;
      concertsWithContactUnified.forEach(doc => {
        if (count < 5) {
          const data = doc.data();
          console.log(`   - Concert: ${data.titre} (${doc.id}) -> Contact: ${data.contactId}`);
          count++;
        }
      });
    }
    
    // 3. Vérifier les références dans les contrats
    console.log('\n\n3. RÉFÉRENCES DANS LES CONTRATS\n');
    const contratsRef = db.collection('contrats');
    const contratsSnapshot = await contratsRef.get();
    
    let contratsWithContactUnified = 0;
    const contratsSample = [];
    
    contratsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId || data.contact_id) {
        contratsWithContactUnified++;
        if (contratsSample.length < 5) {
          contratsSample.push({
            id: doc.id,
            numero: data.numero,
            contactId: data.contactId || data.contact_id
          });
        }
      }
    });
    
    console.log(`   Contrats avec références contacts_unified: ${contratsWithContactUnified}`);
    if (contratsSample.length > 0) {
      console.log('\n   Échantillon:');
      contratsSample.forEach(contrat => {
        console.log(`   - Contrat ${contrat.numero} (${contrat.id}) -> Contact: ${contrat.contactId}`);
      });
    }
    
    // 4. Vérifier les références dans les lieux
    console.log('\n\n4. RÉFÉRENCES DANS LES LIEUX\n');
    const lieuxRef = db.collection('lieux');
    const lieuxSnapshot = await lieuxRef.get();
    
    let lieuxWithContactUnified = 0;
    const lieuxSample = [];
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId || (data.contactIds && data.contactIds.length > 0)) {
        lieuxWithContactUnified++;
        if (lieuxSample.length < 5) {
          lieuxSample.push({
            id: doc.id,
            nom: data.nom,
            contactIds: data.contactIds || [data.contactId]
          });
        }
      }
    });
    
    console.log(`   Lieux avec références contacts: ${lieuxWithContactUnified}`);
    if (lieuxSample.length > 0) {
      console.log('\n   Échantillon:');
      lieuxSample.forEach(lieu => {
        console.log(`   - Lieu ${lieu.nom} (${lieu.id}) -> Contacts: ${lieu.contactIds.join(', ')}`);
      });
    }
    
    // 5. Vérifier les références dans les factures
    console.log('\n\n5. RÉFÉRENCES DANS LES FACTURES\n');
    const facturesRef = db.collection('factures');
    const facturesSnapshot = await facturesRef.get();
    
    let facturesWithContactUnified = 0;
    const facturesSample = [];
    
    facturesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId || data.contact_id) {
        facturesWithContactUnified++;
        if (facturesSample.length < 5) {
          facturesSample.push({
            id: doc.id,
            numero: data.numero,
            contactId: data.contactId || data.contact_id
          });
        }
      }
    });
    
    console.log(`   Factures avec références contacts_unified: ${facturesWithContactUnified}`);
    if (facturesSample.length > 0) {
      console.log('\n   Échantillon:');
      facturesSample.forEach(facture => {
        console.log(`   - Facture ${facture.numero} (${facture.id}) -> Contact: ${facture.contactId}`);
      });
    }
    
    // 6. Analyser le code source
    console.log('\n\n6. ANALYSE DU CODE SOURCE\n');
    console.log('   Fichiers critiques utilisant encore contacts_unified:');
    console.log('   - src/pages/PreContratGenerationPage.js (ligne 119)');
    console.log('   - src/hooks/contacts/useDeleteContact.js (ligne 23)');
    console.log('   - src/components/precontrats/desktop/PreContratGenerator.js');
    console.log('   - Plus de 20 scripts de migration/debug');
    
    // 7. Résumé et recommandations
    console.log('\n\n========== RÉSUMÉ ET RECOMMANDATIONS ==========\n');
    
    const hasDocuments = snapshot.size > 0;
    const hasReferences = concertsWithContactUnified.size > 0 || 
                         contratsWithContactUnified > 0 || 
                         lieuxWithContactUnified > 0 || 
                         facturesWithContactUnified > 0;
    
    console.log('ÉTAT ACTUEL:');
    console.log(`- Documents dans contacts_unified: ${snapshot.size}`);
    console.log(`- Références actives dans d'autres collections: ${hasReferences ? 'OUI' : 'NON'}`);
    console.log(`- Code dépendant: OUI (fichiers critiques)`);
    
    console.log('\nRISQUES:');
    if (hasDocuments) {
      console.log('- ÉLEVÉ: Perte de données si suppression immédiate');
    }
    if (hasReferences) {
      console.log('- ÉLEVÉ: Rupture des liens avec concerts/contrats/lieux/factures');
    }
    console.log('- MOYEN: Code cassé dans PreContratGenerationPage et useDeleteContact');
    
    console.log('\nRECOMMANDATION: ');
    if (hasDocuments || hasReferences) {
      console.log('❌ NE PAS SUPPRIMER contacts_unified maintenant');
      console.log('\nSTRATÉGIE DE MIGRATION PROPOSÉE:');
      console.log('1. Migrer tous les documents vers structures/personnes/liaisons');
      console.log('2. Mettre à jour les références dans concerts/contrats/lieux/factures');
      console.log('3. Adapter PreContratGenerationPage pour utiliser le nouveau modèle');
      console.log('4. Adapter useDeleteContact pour le nouveau modèle');
      console.log('5. Tester en profondeur');
      console.log('6. Garder contacts_unified en lecture seule pendant 1 mois');
      console.log('7. Supprimer après validation complète');
    } else {
      console.log('✅ Peut être supprimé MAIS attention au code dépendant');
      console.log('\nACTIONS REQUISES AVANT SUPPRESSION:');
      console.log('1. Adapter PreContratGenerationPage');
      console.log('2. Adapter useDeleteContact');
      console.log('3. Nettoyer les scripts de migration');
      console.log('4. Tester toutes les fonctionnalités');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'audit:', error);
  }
}

// Exécuter l'audit
auditContactsUnified()
  .then(() => {
    console.log('\nAudit terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });