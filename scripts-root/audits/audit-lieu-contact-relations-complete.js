// Script d'audit complet des relations lieu-contact
// À exécuter dans la console du navigateur

window.auditLieuContactRelations = async function() {
  console.log('🔍 AUDIT COMPLET DES RELATIONS LIEU-CONTACT');
  console.log('==========================================\n');
  
  const { collection, getDocs, query, where, doc, getDoc, db } = window.FirebaseService || {};
  
  if (!db) {
    console.error('❌ Firebase non disponible');
    return;
  }
  
  const report = {
    totalLieux: 0,
    lieuxSansId: [],
    lieuxSansOrganizationId: [],
    lieuxAvecContactIds: 0,
    lieuxSansContactIds: 0,
    contactsAvecLieuxIds: 0,
    relationsManquantes: [],
    formatsProblematiiques: [],
    anomalies: []
  };
  
  try {
    // 1. ANALYSER TOUS LES LIEUX
    console.log('📍 Phase 1: Analyse des lieux...');
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    report.totalLieux = lieuxSnapshot.size;
    
    for (const lieuDoc of lieuxSnapshot.docs) {
      const lieu = lieuDoc.data();
      const lieuId = lieuDoc.id;
      
      // Vérifier l'ID
      if (!lieuId) {
        report.lieuxSansId.push(lieu);
        console.error('🚨 LIEU SANS ID TROUVÉ:', lieu);
      }
      
      // Vérifier organizationId
      if (!lieu.organizationId) {
        report.lieuxSansOrganizationId.push({ id: lieuId, nom: lieu.nom });
      }
      
      // Analyser contactIds
      if (lieu.contactIds && Array.isArray(lieu.contactIds)) {
        if (lieu.contactIds.length > 0) {
          report.lieuxAvecContactIds++;
          
          // Vérifier le format des contactIds
          for (const contactId of lieu.contactIds) {
            if (typeof contactId !== 'string') {
              report.formatsProblematiiques.push({
                lieuId,
                probleme: 'contactId non-string',
                valeur: contactId
              });
            }
          }
        } else {
          report.lieuxSansContactIds++;
        }
      } else if (lieu.contactIds !== undefined && lieu.contactIds !== null) {
        report.formatsProblematiiques.push({
          lieuId,
          probleme: 'contactIds n\'est pas un tableau',
          valeur: lieu.contactIds
        });
      } else {
        report.lieuxSansContactIds++;
      }
      
      // Chercher d'autres champs suspects
      const champsContacts = ['contacts', 'contact', 'contactId', 'programmateurIds'];
      for (const champ of champsContacts) {
        if (lieu[champ] !== undefined) {
          report.anomalies.push({
            lieuId,
            champ,
            valeur: lieu[champ],
            message: `Champ obsolète '${champ}' trouvé`
          });
        }
      }
    }
    
    // 2. ANALYSER LES CONTACTS
    console.log('\n👥 Phase 2: Analyse des contacts...');
    const contactsSnapshot = await getDocs(collection(db, 'contacts'));
    
    for (const contactDoc of contactsSnapshot.docs) {
      const contact = contactDoc.data();
      const contactId = contactDoc.id;
      
      if (contact.lieuxIds && Array.isArray(contact.lieuxIds) && contact.lieuxIds.length > 0) {
        report.contactsAvecLieuxIds++;
        
        // Vérifier la cohérence bidirectionnelle
        for (const lieuId of contact.lieuxIds) {
          const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
          if (lieuDoc.exists()) {
            const lieu = lieuDoc.data();
            if (!lieu.contactIds || !lieu.contactIds.includes(contactId)) {
              report.relationsManquantes.push({
                type: 'lieu->contact manquant',
                contactId,
                lieuId,
                contactNom: contact.nom,
                lieuNom: lieu.nom
              });
            }
          } else {
            report.anomalies.push({
              contactId,
              probleme: 'Référence à un lieu inexistant',
              lieuId
            });
          }
        }
      }
    }
    
    // 3. RAPPORT FINAL
    console.log('\n📊 RAPPORT D\'AUDIT');
    console.log('==================\n');
    
    console.log(`📍 Lieux analysés: ${report.totalLieux}`);
    console.log(`  ✅ Avec contactIds: ${report.lieuxAvecContactIds}`);
    console.log(`  ❌ Sans contactIds: ${report.lieuxSansContactIds}`);
    console.log(`  🚨 Sans organizationId: ${report.lieuxSansOrganizationId.length}`);
    
    console.log(`\n👥 Contacts avec lieuxIds: ${report.contactsAvecLieuxIds}`);
    
    if (report.lieuxSansId.length > 0) {
      console.log('\n🚨🚨 ALERTE CRITIQUE: LIEUX SANS ID');
      console.table(report.lieuxSansId);
    }
    
    if (report.relationsManquantes.length > 0) {
      console.log(`\n⚠️ Relations manquantes: ${report.relationsManquantes.length}`);
      console.table(report.relationsManquantes);
    }
    
    if (report.formatsProblematiiques.length > 0) {
      console.log(`\n⚠️ Formats problématiques: ${report.formatsProblematiiques.length}`);
      console.table(report.formatsProblematiiques);
    }
    
    if (report.anomalies.length > 0) {
      console.log(`\n⚠️ Anomalies détectées: ${report.anomalies.length}`);
      console.table(report.anomalies);
    }
    
    // 4. SUGGESTIONS DE CORRECTION
    console.log('\n🔧 ACTIONS CORRECTIVES SUGGÉRÉES');
    console.log('================================\n');
    
    if (report.lieuxSansId.length > 0) {
      console.log('1. 🚨 CRITICAL: Investiguer les lieux sans ID (impossible normalement!)');
    }
    
    if (report.relationsManquantes.length > 0) {
      console.log('2. Exécuter BidirectionalRelationsFixer dans /debug');
    }
    
    if (report.lieuxSansOrganizationId.length > 0) {
      console.log('3. Exécuter OrganizationIdFixer dans /debug');
    }
    
    if (report.formatsProblematiiques.length > 0) {
      console.log('4. Nettoyer les formats de données incorrects');
    }
    
    window.auditReport = report;
    console.log('\n✅ Audit terminé. Rapport disponible dans window.auditReport');
    
  } catch (error) {
    console.error('❌ Erreur durant l\'audit:', error);
  }
};

// Fonction pour diagnostiquer un lieu spécifique
window.diagnosticLieuSpecifique = async function(lieuId) {
  console.log(`\n🔍 Diagnostic du lieu ${lieuId}`);
  console.log('============================\n');
  
  const { doc, getDoc, collection, query, where, getDocs, db } = window.FirebaseService || {};
  
  try {
    // 1. Charger le lieu
    const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
    if (!lieuDoc.exists()) {
      console.error('❌ Lieu non trouvé');
      return;
    }
    
    const lieu = lieuDoc.data();
    console.log('📍 Données du lieu:', lieu);
    
    // 2. Analyser les champs
    console.log('\n📋 Analyse des champs:');
    console.log('- ID:', lieuDoc.id);
    console.log('- organizationId:', lieu.organizationId || '❌ MANQUANT');
    console.log('- contactIds:', lieu.contactIds || '❌ NON DÉFINI');
    console.log('- Type de contactIds:', Array.isArray(lieu.contactIds) ? 'Array' : typeof lieu.contactIds);
    
    // 3. Chercher les contacts via relation inverse
    console.log('\n🔄 Recherche des contacts via lieuxIds:');
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('lieuxIds', 'array-contains', lieuId)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    
    console.log(`Trouvé ${contactsSnapshot.size} contact(s):`);
    contactsSnapshot.forEach(doc => {
      const contact = doc.data();
      console.log(`- ${contact.nom} (ID: ${doc.id})`);
    });
    
    // 4. Vérifier la cohérence
    if (lieu.contactIds && lieu.contactIds.length > 0) {
      console.log('\n🔍 Vérification des contactIds:');
      for (const contactId of lieu.contactIds) {
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        if (contactDoc.exists()) {
          const contact = contactDoc.data();
          const aLieuDansLieuxIds = contact.lieuxIds && contact.lieuxIds.includes(lieuId);
          console.log(`- ${contactId}: ${aLieuDansLieuxIds ? '✅' : '❌'} relation bidirectionnelle`);
        } else {
          console.log(`- ${contactId}: ❌ CONTACT INEXISTANT`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
  }
};

console.log('✅ Scripts d\'audit chargés. Utilisez:');
console.log('- auditLieuContactRelations() pour un audit complet');
console.log('- diagnosticLieuSpecifique("ID_DU_LIEU") pour un lieu spécifique');