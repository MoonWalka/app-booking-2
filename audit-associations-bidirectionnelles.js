#!/usr/bin/env node

/**
 * Audit complet des associations bidirectionnelles Contact ↔ Lieu
 * 
 * Ce script analyse la cohérence des relations entre les collections 'programmateurs' et 'lieux'
 * pour identifier les incohérences et les références cassées.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Initialiser Firebase avec l'émulateur ou la vraie base
const app = initializeApp({
  projectId: 'demo-project' // Pour l'émulateur
});
const db = getFirestore(app);

async function auditAssociationsBidirectionnelles() {
  console.log('🔍 AUDIT COMPLET DES ASSOCIATIONS CONTACT ↔ LIEU');
  console.log('=' .repeat(70));

  const rapport = {
    contacts: [],
    lieux: [],
    incoherences: [],
    statistiques: {
      totalContacts: 0,
      totalLieux: 0,
      contactsAvecLieux: 0,
      lieuxAvecContacts: 0,
      associationsCoherentes: 0,
      referencesOrphelines: 0
    }
  };

  try {
    // 1. COLLECTE DES DONNÉES
    console.log('\n📊 Collecte des données...');
    
    // Récupérer tous les contacts
    const contactsSnapshot = await getDocs(collection(db, 'programmateurs'));
    const contacts = contactsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Récupérer tous les lieux
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const lieux = lieuxSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    rapport.statistiques.totalContacts = contacts.length;
    rapport.statistiques.totalLieux = lieux.length;

    console.log(`✅ ${contacts.length} contacts récupérés`);
    console.log(`✅ ${lieux.length} lieux récupérés`);

    // 2. ANALYSE DES CONTACTS
    console.log('\n👥 Analyse des contacts...');
    
    for (const contact of contacts) {
      const contactAnalyse = {
        id: contact.id,
        nom: contact.contact?.nom || contact.nom || 'Sans nom',
        email: contact.contact?.email || contact.email || '',
        lieuxReferences: [],
        lieuxReelsAssocies: [],
        structureId: contact.structureId || null,
        incoherences: []
      };

      // Vérifier les références de lieux dans le contact
      const lieuxIds = contact.lieuxIds || contact.lieuxAssocies || [];
      if (lieuxIds.length > 0) {
        rapport.statistiques.contactsAvecLieux++;
        
        for (const lieuRef of lieuxIds) {
          const lieuId = typeof lieuRef === 'object' ? lieuRef.id : lieuRef;
          contactAnalyse.lieuxReferences.push(lieuId);
          
          // Vérifier si le lieu existe vraiment
          const lieuExiste = lieux.find(l => l.id === lieuId);
          if (lieuExiste) {
            contactAnalyse.lieuxReelsAssocies.push({
              id: lieuId,
              nom: lieuExiste.nom,
              retourReference: verifierRetourReference(lieuExiste, contact.id)
            });
          } else {
            contactAnalyse.incoherences.push(`Lieu ${lieuId} référencé mais n'existe pas`);
            rapport.statistiques.referencesOrphelines++;
          }
        }
      }

      rapport.contacts.push(contactAnalyse);
    }

    // 3. ANALYSE DES LIEUX
    console.log('\n🗺️ Analyse des lieux...');
    
    for (const lieu of lieux) {
      const lieuAnalyse = {
        id: lieu.id,
        nom: lieu.nom || 'Sans nom',
        ville: lieu.ville || '',
        contactsReferences: [],
        contactsReelsAssocies: [],
        incoherences: []
      };

      // Méthode 1: programmateurId (ancien système)
      if (lieu.programmateurId) {
        rapport.statistiques.lieuxAvecContacts++;
        lieuAnalyse.contactsReferences.push(lieu.programmateurId);
        
        const contactExiste = contacts.find(c => c.id === lieu.programmateurId);
        if (contactExiste) {
          lieuAnalyse.contactsReelsAssocies.push({
            id: lieu.programmateurId,
            nom: contactExiste.contact?.nom || contactExiste.nom,
            retourReference: verifierRetourReferenceLieu(contactExiste, lieu.id)
          });
        } else {
          lieuAnalyse.incoherences.push(`Contact ${lieu.programmateurId} référencé mais n'existe pas`);
          rapport.statistiques.referencesOrphelines++;
        }
      }

      // Méthode 2: programmateursAssocies (nouveau système)
      if (lieu.programmateursAssocies && Array.isArray(lieu.programmateursAssocies)) {
        if (lieu.programmateursAssocies.length > 0) {
          rapport.statistiques.lieuxAvecContacts++;
        }
        
        for (const progRef of lieu.programmateursAssocies) {
          const progId = typeof progRef === 'object' ? progRef.id : progRef;
          if (!lieuAnalyse.contactsReferences.includes(progId)) {
            lieuAnalyse.contactsReferences.push(progId);
          }
          
          const contactExiste = contacts.find(c => c.id === progId);
          if (contactExiste) {
            const dejaAjoute = lieuAnalyse.contactsReelsAssocies.find(c => c.id === progId);
            if (!dejaAjoute) {
              lieuAnalyse.contactsReelsAssocies.push({
                id: progId,
                nom: contactExiste.contact?.nom || contactExiste.nom,
                retourReference: verifierRetourReferenceLieu(contactExiste, lieu.id)
              });
            }
          } else {
            lieuAnalyse.incoherences.push(`Contact ${progId} référencé mais n'existe pas`);
            rapport.statistiques.referencesOrphelines++;
          }
        }
      }

      rapport.lieux.push(lieuAnalyse);
    }

    // 4. DÉTECTION DES INCOHÉRENCES BIDIRECTIONNELLES
    console.log('\n🔍 Détection des incohérences bidirectionnelles...');
    
    for (const contact of rapport.contacts) {
      for (const lieuAssocie of contact.lieuxReelsAssocies) {
        if (!lieuAssocie.retourReference) {
          rapport.incoherences.push({
            type: 'REFERENCE_UNIDIRECTIONNELLE_CONTACT_VERS_LIEU',
            contactId: contact.id,
            contactNom: contact.nom,
            lieuId: lieuAssocie.id,
            lieuNom: lieuAssocie.nom,
            description: `Contact ${contact.nom} référence lieu ${lieuAssocie.nom}, mais le lieu ne référence pas le contact en retour`
          });
        } else {
          rapport.statistiques.associationsCoherentes++;
        }
      }
    }

    for (const lieu of rapport.lieux) {
      for (const contactAssocie of lieu.contactsReelsAssocies) {
        if (!contactAssocie.retourReference) {
          rapport.incoherences.push({
            type: 'REFERENCE_UNIDIRECTIONNELLE_LIEU_VERS_CONTACT',
            lieuId: lieu.id,
            lieuNom: lieu.nom,
            contactId: contactAssocie.id,
            contactNom: contactAssocie.nom,
            description: `Lieu ${lieu.nom} référence contact ${contactAssocie.nom}, mais le contact ne référence pas le lieu en retour`
          });
        }
      }
    }

    // 5. AFFICHAGE DU RAPPORT
    console.log('\n' + '='.repeat(70));
    console.log('📊 STATISTIQUES GÉNÉRALES');
    console.log('='.repeat(70));
    console.log(`Total contacts: ${rapport.statistiques.totalContacts}`);
    console.log(`Total lieux: ${rapport.statistiques.totalLieux}`);
    console.log(`Contacts avec lieux: ${rapport.statistiques.contactsAvecLieux}`);
    console.log(`Lieux avec contacts: ${rapport.statistiques.lieuxAvecContacts}`);
    console.log(`Associations cohérentes: ${rapport.statistiques.associationsCoherentes}`);
    console.log(`Références orphelines: ${rapport.statistiques.referencesOrphelines}`);

    console.log('\n' + '='.repeat(70));
    console.log(`❌ INCOHÉRENCES DÉTECTÉES (${rapport.incoherences.length})`);
    console.log('='.repeat(70));
    
    if (rapport.incoherences.length === 0) {
      console.log('✅ Aucune incohérence détectée !');
    } else {
      rapport.incoherences.forEach((inc, index) => {
        console.log(`\n${index + 1}. ${inc.type}`);
        console.log(`   ${inc.description}`);
      });
    }

    // 6. EXEMPLES DÉTAILLÉS
    console.log('\n' + '='.repeat(70));
    console.log('🔍 EXEMPLES DÉTAILLÉS (3 premiers contacts et lieux)');
    console.log('='.repeat(70));
    
    // Afficher les 3 premiers contacts
    console.log('\n👥 CONTACTS:');
    rapport.contacts.slice(0, 3).forEach(contact => {
      console.log(`\n📝 ${contact.nom} (${contact.id})`);
      console.log(`   Email: ${contact.email || 'Non défini'}`);
      console.log(`   Structure ID: ${contact.structureId || 'Non défini'}`);
      console.log(`   Lieux référencés: ${contact.lieuxReferences.length}`);
      console.log(`   Lieux réels: ${contact.lieuxReelsAssocies.length}`);
      if (contact.lieuxReelsAssocies.length > 0) {
        contact.lieuxReelsAssocies.forEach(lieu => {
          console.log(`     - ${lieu.nom} (${lieu.id}) ${lieu.retourReference ? '✅' : '❌'}`);
        });
      }
      if (contact.incoherences.length > 0) {
        console.log(`   ⚠️ Incohérences: ${contact.incoherences.join(', ')}`);
      }
    });

    // Afficher les 3 premiers lieux
    console.log('\n🗺️ LIEUX:');
    rapport.lieux.slice(0, 3).forEach(lieu => {
      console.log(`\n📍 ${lieu.nom} (${lieu.id})`);
      console.log(`   Ville: ${lieu.ville || 'Non définie'}`);
      console.log(`   Contacts référencés: ${lieu.contactsReferences.length}`);
      console.log(`   Contacts réels: ${lieu.contactsReelsAssocies.length}`);
      if (lieu.contactsReelsAssocies.length > 0) {
        lieu.contactsReelsAssocies.forEach(contact => {
          console.log(`     - ${contact.nom} (${contact.id}) ${contact.retourReference ? '✅' : '❌'}`);
        });
      }
      if (lieu.incoherences.length > 0) {
        console.log(`   ⚠️ Incohérences: ${lieu.incoherences.join(', ')}`);
      }
    });

    // 7. SAUVEGARDE DU RAPPORT
    const fs = require('fs');
    const rapportJson = JSON.stringify(rapport, null, 2);
    fs.writeFileSync('audit-associations-rapport.json', rapportJson);
    console.log('\n💾 Rapport complet sauvegardé dans: audit-associations-rapport.json');

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  }
}

// Fonctions utilitaires
function verifierRetourReference(lieu, contactId) {
  // Vérifier si le lieu référence le contact en retour
  if (lieu.programmateurId === contactId) return true;
  if (lieu.programmateursAssocies) {
    return lieu.programmateursAssocies.some(ref => {
      const id = typeof ref === 'object' ? ref.id : ref;
      return id === contactId;
    });
  }
  return false;
}

function verifierRetourReferenceLieu(contact, lieuId) {
  // Vérifier si le contact référence le lieu en retour
  const lieuxIds = contact.lieuxIds || contact.lieuxAssocies || [];
  return lieuxIds.some(ref => {
    const id = typeof ref === 'object' ? ref.id : ref;
    return id === lieuId;
  });
}

// Exécuter l'audit si appelé directement
if (require.main === module) {
  auditAssociationsBidirectionnelles()
    .then(() => {
      console.log('\n✅ Audit terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { auditAssociationsBidirectionnelles };