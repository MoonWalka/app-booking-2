import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU",
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0",
  measurementId: "G-C7KPDD9RHG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function auditContactsUnified() {
  console.log('\n========== AUDIT FINAL CONTACTS_UNIFIED ==========\n');
  
  try {
    // 1. Compter les documents dans contacts_unified
    console.log('1. COMPTAGE DES DOCUMENTS DANS CONTACTS_UNIFIED\n');
    const contactsUnifiedRef = collection(db, 'contacts_unified');
    const snapshot = await getDocs(contactsUnifiedRef);
    console.log(`   Nombre total de documents: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      // Analyser les types de contacts
      const types = {};
      const orgIds = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        const type = data.entityType || 'unknown';
        types[type] = (types[type] || 0) + 1;
        if (data.organizationId) {
          orgIds.add(data.organizationId);
        }
      });
      
      console.log('\n   Répartition par type:');
      Object.entries(types).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
      
      console.log(`\n   Organisations présentes: ${orgIds.size}`);
      
      // Échantillon de documents
      console.log('\n   Échantillon (5 premiers documents):');
      let count = 0;
      snapshot.forEach(doc => {
        if (count < 5) {
          const data = doc.data();
          const nom = data.structureRaisonSociale || 
                     `${data.personnePrenom || ''} ${data.personneNom || ''}`.trim() ||
                     'Sans nom';
          console.log(`   - ${doc.id}: ${data.entityType} - ${nom}`);
          count++;
        }
      });
    }
    
    // 2. Vérifier les références dans les concerts
    console.log('\n\n2. RÉFÉRENCES DANS LES CONCERTS\n');
    const concertsRef = collection(db, 'concerts');
    const concertsQuery = query(concertsRef, limit(100));
    const concertsSnapshot = await getDocs(concertsQuery);
    
    let concertsWithContactId = 0;
    let concertsWithStructureId = 0;
    const concertsSample = [];
    
    concertsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId) {
        concertsWithContactId++;
        if (concertsSample.length < 3) {
          concertsSample.push({
            id: doc.id,
            titre: data.titre,
            contactId: data.contactId,
            type: 'contactId'
          });
        }
      }
      if (data.structureId) {
        concertsWithStructureId++;
      }
    });
    
    console.log(`   Concerts avec contactId (ancien format): ${concertsWithContactId}`);
    console.log(`   Concerts avec structureId (nouveau format): ${concertsWithStructureId}`);
    console.log(`   Total concerts analysés: ${concertsSnapshot.size}`);
    
    if (concertsSample.length > 0) {
      console.log('\n   Échantillon concerts avec contactId:');
      concertsSample.forEach(concert => {
        console.log(`   - "${concert.titre}" -> contactId: ${concert.contactId}`);
      });
    }
    
    // 3. Vérifier les références dans les contrats
    console.log('\n\n3. RÉFÉRENCES DANS LES CONTRATS\n');
    const contratsRef = collection(db, 'contrats');
    const contratsQuery = query(contratsRef, limit(100));
    const contratsSnapshot = await getDocs(contratsQuery);
    
    let contratsWithContactUnified = 0;
    const contratsSample = [];
    
    contratsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId || data.contact_id) {
        contratsWithContactUnified++;
        if (contratsSample.length < 3) {
          contratsSample.push({
            id: doc.id,
            numero: data.numero,
            contactId: data.contactId || data.contact_id
          });
        }
      }
    });
    
    console.log(`   Contrats avec références contacts_unified: ${contratsWithContactUnified}`);
    console.log(`   Total contrats analysés: ${contratsSnapshot.size}`);
    
    if (contratsSample.length > 0) {
      console.log('\n   Échantillon:');
      contratsSample.forEach(contrat => {
        console.log(`   - Contrat ${contrat.numero} -> Contact: ${contrat.contactId}`);
      });
    }
    
    // 4. Vérifier les références dans les lieux
    console.log('\n\n4. RÉFÉRENCES DANS LES LIEUX\n');
    const lieuxRef = collection(db, 'lieux');
    const lieuxQuery = query(lieuxRef, limit(50));
    const lieuxSnapshot = await getDocs(lieuxQuery);
    
    let lieuxWithContactUnified = 0;
    const lieuxSample = [];
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId || (data.contactIds && data.contactIds.length > 0)) {
        lieuxWithContactUnified++;
        if (lieuxSample.length < 3) {
          lieuxSample.push({
            id: doc.id,
            nom: data.nom,
            contactIds: data.contactIds || [data.contactId]
          });
        }
      }
    });
    
    console.log(`   Lieux avec références contacts: ${lieuxWithContactUnified}`);
    console.log(`   Total lieux analysés: ${lieuxSnapshot.size}`);
    
    if (lieuxSample.length > 0) {
      console.log('\n   Échantillon:');
      lieuxSample.forEach(lieu => {
        console.log(`   - "${lieu.nom}" -> Contacts: ${lieu.contactIds.join(', ')}`);
      });
    }
    
    // 5. Vérifier les nouvelles collections
    console.log('\n\n5. ÉTAT DES NOUVELLES COLLECTIONS\n');
    
    // Structures
    const structuresRef = collection(db, 'structures');
    const structuresSnapshot = await getDocs(query(structuresRef, limit(10)));
    console.log(`   Structures: ${structuresSnapshot.size} documents`);
    
    // Personnes
    const personnesRef = collection(db, 'personnes');
    const personnesSnapshot = await getDocs(query(personnesRef, limit(10)));
    console.log(`   Personnes: ${personnesSnapshot.size} documents`);
    
    // Liaisons
    const liaisonsRef = collection(db, 'liaisons');
    const liaisonsSnapshot = await getDocs(query(liaisonsRef, limit(10)));
    console.log(`   Liaisons: ${liaisonsSnapshot.size} documents`);
    
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
    const hasReferences = concertsWithContactId > 0 || 
                         contratsWithContactUnified > 0 || 
                         lieuxWithContactUnified > 0;
    
    console.log('ÉTAT ACTUEL:');
    console.log(`- Documents dans contacts_unified: ${snapshot.size}`);
    console.log(`- Références actives dans d'autres collections: ${hasReferences ? 'OUI' : 'NON'}`);
    console.log(`- Code dépendant: OUI (fichiers critiques)`);
    console.log(`- Nouvelles collections prêtes: ${structuresSnapshot.size > 0 || personnesSnapshot.size > 0 ? 'OUI' : 'NON'}`);
    
    console.log('\nRISQUES:');
    if (hasDocuments) {
      console.log('- ÉLEVÉ: Perte de données si suppression immédiate');
    }
    if (hasReferences) {
      console.log('- ÉLEVÉ: Rupture des liens avec concerts/contrats/lieux');
    }
    console.log('- MOYEN: Code cassé dans PreContratGenerationPage et useDeleteContact');
    
    console.log('\nRECOMMANDATION: ');
    if (hasDocuments || hasReferences) {
      console.log('❌ NE PAS SUPPRIMER contacts_unified maintenant');
      console.log('\nSTRATÉGIE DE MIGRATION PROPOSÉE:');
      console.log('1. Phase 1 - Migration des données (1-2 jours):');
      console.log('   - Migrer tous les documents vers structures/personnes/liaisons');
      console.log('   - Valider l\'intégrité des données migrées');
      console.log('\n2. Phase 2 - Mise à jour des références (2-3 jours):');
      console.log('   - Mettre à jour contactId -> structureId dans concerts');
      console.log('   - Mettre à jour les références dans contrats/lieux/factures');
      console.log('\n3. Phase 3 - Adaptation du code (1-2 jours):');
      console.log('   - Adapter PreContratGenerationPage pour utiliser structures');
      console.log('   - Adapter useDeleteContact pour le nouveau modèle');
      console.log('   - Nettoyer les scripts de migration');
      console.log('\n4. Phase 4 - Validation (1 semaine):');
      console.log('   - Tests complets de toutes les fonctionnalités');
      console.log('   - Garder contacts_unified en lecture seule');
      console.log('\n5. Phase 5 - Suppression (après 1 mois):');
      console.log('   - Supprimer contacts_unified après validation complète');
    } else {
      console.log('✅ Peut être supprimé MAIS attention au code dépendant');
      console.log('\nACTIONS REQUISES AVANT SUPPRESSION:');
      console.log('1. Adapter PreContratGenerationPage');
      console.log('2. Adapter useDeleteContact');
      console.log('3. Nettoyer les scripts de migration');
      console.log('4. Tester toutes les fonctionnalités');
    }
    
    console.log('\n\nDURÉE ESTIMÉE TOTALE: 1 à 2 semaines de travail + 1 mois de validation');
    
  } catch (error) {
    console.error('Erreur lors de l\'audit:', error);
  }
}

// Exécuter l'audit
auditContactsUnified();