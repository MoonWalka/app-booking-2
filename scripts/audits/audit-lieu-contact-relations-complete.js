/**
 * AUDIT COMPLET DU SYSTÈME DE RELATIONS LIEU-CONTACT
 * Script à exécuter dans la console du navigateur après connexion
 * 
 * Ce script analyse en profondeur:
 * 1. La structure des données
 * 2. Les formats de relations (ID vs objets)
 * 3. Les relations bidirectionnelles
 * 4. Les incohérences et problèmes cachés
 * 5. Les entrepriseId manquants
 */

console.log('🔍 AUDIT COMPLET DU SYSTÈME DE RELATIONS LIEU-CONTACT');
console.log('='.repeat(80));

/**
 * Audit complet du système de relations
 */
async function auditLieuContactRelations() {
  const { db, collection, getDocs, doc, getDoc } = await import('/src/services/firebase-service.js');
  
  const report = {
    timestamp: new Date().toISOString(),
    currentOrganization: null,
    statistics: {
      lieux: { total: 0, withContacts: 0, withoutContacts: 0, withProblems: 0 },
      contacts: { total: 0, withLieux: 0, withoutLieux: 0, withProblems: 0 }
    },
    dataFormats: {
      lieux: {},
      contacts: {}
    },
    relationProblems: [],
    organizationProblems: [],
    structuralProblems: [],
    bidirectionalIssues: [],
    recommendations: []
  };

  try {
    // 1. Récupérer l'organisation courante
    console.log('\n📊 1. ORGANISATION COURANTE');
    console.log('-'.repeat(40));
    
    const storedOrg = localStorage.getItem('currentOrganization');
    if (storedOrg) {
      report.currentOrganization = JSON.parse(storedOrg);
      console.log('✅ Organisation:', report.currentOrganization.name);
      console.log('   ID:', report.currentOrganization.id);
    } else {
      console.log('⚠️ Aucune organisation courante trouvée dans localStorage');
    }

    // 2. Analyser tous les lieux
    console.log('\n📍 2. ANALYSE DES LIEUX');
    console.log('-'.repeat(40));
    
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    report.statistics.lieux.total = lieuxSnapshot.size;
    
    const lieuxByOrg = {};
    const lieuxAnalysis = [];
    
    for (const lieuDoc of lieuxSnapshot.docs) {
      const lieu = lieuDoc.data();
      const analysis = {
        id: lieuDoc.id,
        nom: lieu.nom || 'Sans nom',
        entrepriseId: lieu.entrepriseId,
        problems: [],
        contactsFormat: null,
        contactsCount: 0,
        contactsDetails: []
      };

      // Vérifier entrepriseId
      if (!lieu.entrepriseId) {
        analysis.problems.push('entrepriseId manquant');
        report.organizationProblems.push({
          type: 'lieu_missing_entrepriseId',
          id: lieuDoc.id,
          nom: lieu.nom
        });
      } else {
        lieuxByOrg[lieu.entrepriseId] = (lieuxByOrg[lieu.entrepriseId] || 0) + 1;
      }

      // Analyser le format des contacts
      if (lieu.contactsIds) {
        analysis.contactsFormat = 'contactsIds (array)';
        analysis.contactsCount = lieu.contactsIds.length;
        report.statistics.lieux.withContacts++;
        
        // Vérifier le type des éléments
        for (const contactId of lieu.contactsIds) {
          if (typeof contactId === 'object') {
            analysis.problems.push(`contactsIds contient un objet au lieu d'un ID: ${JSON.stringify(contactId)}`);
            report.structuralProblems.push({
              type: 'object_in_contactsIds',
              lieuId: lieuDoc.id,
              value: contactId
            });
          } else if (!contactId) {
            analysis.problems.push('contactsIds contient une valeur null/undefined');
          }
          
          analysis.contactsDetails.push({
            id: contactId,
            type: typeof contactId
          });
        }
      } else if (lieu.contacts) {
        analysis.contactsFormat = 'contacts (array d\'objets)';
        analysis.contactsCount = lieu.contacts.length;
        report.statistics.lieux.withContacts++;
        
        // Format obsolète - signaler comme problème
        analysis.problems.push('Utilise le format obsolète "contacts" au lieu de "contactsIds"');
        report.structuralProblems.push({
          type: 'obsolete_contacts_format',
          lieuId: lieuDoc.id,
          format: 'contacts array'
        });
      } else if (lieu.contactId) {
        analysis.contactsFormat = 'contactId (string unique)';
        analysis.contactsCount = 1;
        report.statistics.lieux.withContacts++;
        
        // Format non standard
        analysis.problems.push('Utilise "contactId" au lieu de "contactsIds"');
      } else {
        report.statistics.lieux.withoutContacts++;
      }

      // Enregistrer les formats trouvés
      if (analysis.contactsFormat) {
        report.dataFormats.lieux[analysis.contactsFormat] = 
          (report.dataFormats.lieux[analysis.contactsFormat] || 0) + 1;
      }

      if (analysis.problems.length > 0) {
        report.statistics.lieux.withProblems++;
      }

      lieuxAnalysis.push(analysis);
    }

    console.log(`📊 Total lieux: ${report.statistics.lieux.total}`);
    console.log(`✅ Avec contacts: ${report.statistics.lieux.withContacts}`);
    console.log(`❌ Sans contacts: ${report.statistics.lieux.withoutContacts}`);
    console.log(`⚠️ Avec problèmes: ${report.statistics.lieux.withProblems}`);
    console.log('\n📊 Formats de données trouvés:');
    Object.entries(report.dataFormats.lieux).forEach(([format, count]) => {
      console.log(`   - ${format}: ${count}`);
    });
    console.log('\n📊 Lieux par organization:');
    Object.entries(lieuxByOrg).forEach(([orgId, count]) => {
      console.log(`   - ${orgId}: ${count} lieux`);
    });

    // 3. Analyser tous les contacts
    console.log('\n👥 3. ANALYSE DES CONTACTS');
    console.log('-'.repeat(40));
    
    const contactsSnapshot = await getDocs(collection(db, 'contacts'));
    report.statistics.contacts.total = contactsSnapshot.size;
    
    const contactsByOrg = {};
    const contactsAnalysis = [];
    
    for (const contactDoc of contactsSnapshot.docs) {
      const contact = contactDoc.data();
      const analysis = {
        id: contactDoc.id,
        nom: contact.nom || 'Sans nom',
        entrepriseId: contact.entrepriseId,
        problems: [],
        lieuxFormat: null,
        lieuxCount: 0,
        lieuxDetails: []
      };

      // Vérifier entrepriseId
      if (!contact.entrepriseId) {
        analysis.problems.push('entrepriseId manquant');
        report.organizationProblems.push({
          type: 'contact_missing_entrepriseId',
          id: contactDoc.id,
          nom: contact.nom
        });
      } else {
        contactsByOrg[contact.entrepriseId] = (contactsByOrg[contact.entrepriseId] || 0) + 1;
      }

      // Analyser le format des lieux
      if (contact.lieuxIds) {
        analysis.lieuxFormat = 'lieuxIds (array)';
        analysis.lieuxCount = contact.lieuxIds.length;
        report.statistics.contacts.withLieux++;
        
        // Vérifier le type des éléments
        for (const lieuId of contact.lieuxIds) {
          if (typeof lieuId === 'object') {
            analysis.problems.push(`lieuxIds contient un objet au lieu d'un ID: ${JSON.stringify(lieuId)}`);
            report.structuralProblems.push({
              type: 'object_in_lieuxIds',
              contactId: contactDoc.id,
              value: lieuId
            });
          } else if (!lieuId) {
            analysis.problems.push('lieuxIds contient une valeur null/undefined');
          }
          
          analysis.lieuxDetails.push({
            id: lieuId,
            type: typeof lieuId
          });
        }
      } else if (contact.lieuxAssocies) {
        analysis.lieuxFormat = 'lieuxAssocies (array d\'objets)';
        analysis.lieuxCount = contact.lieuxAssocies.length;
        report.statistics.contacts.withLieux++;
        
        // Format obsolète
        analysis.problems.push('Utilise le format obsolète "lieuxAssocies" au lieu de "lieuxIds"');
        report.structuralProblems.push({
          type: 'obsolete_lieuxAssocies_format',
          contactId: contactDoc.id,
          format: 'lieuxAssocies array'
        });
      } else if (contact.lieux) {
        analysis.lieuxFormat = 'lieux (format inconnu)';
        report.statistics.contacts.withLieux++;
        analysis.problems.push('Utilise un format non standard "lieux"');
      } else {
        report.statistics.contacts.withoutLieux++;
      }

      // Enregistrer les formats trouvés
      if (analysis.lieuxFormat) {
        report.dataFormats.contacts[analysis.lieuxFormat] = 
          (report.dataFormats.contacts[analysis.lieuxFormat] || 0) + 1;
      }

      if (analysis.problems.length > 0) {
        report.statistics.contacts.withProblems++;
      }

      contactsAnalysis.push(analysis);
    }

    console.log(`📊 Total contacts: ${report.statistics.contacts.total}`);
    console.log(`✅ Avec lieux: ${report.statistics.contacts.withLieux}`);
    console.log(`❌ Sans lieux: ${report.statistics.contacts.withoutLieux}`);
    console.log(`⚠️ Avec problèmes: ${report.statistics.contacts.withProblems}`);
    console.log('\n📊 Formats de données trouvés:');
    Object.entries(report.dataFormats.contacts).forEach(([format, count]) => {
      console.log(`   - ${format}: ${count}`);
    });
    console.log('\n📊 Contacts par organization:');
    Object.entries(contactsByOrg).forEach(([orgId, count]) => {
      console.log(`   - ${orgId}: ${count} contacts`);
    });

    // 4. Vérifier les relations bidirectionnelles
    console.log('\n🔗 4. VÉRIFICATION DES RELATIONS BIDIRECTIONNELLES');
    console.log('-'.repeat(40));
    
    let bidirectionalOk = 0;
    let bidirectionalMissing = 0;
    let orphanRelations = 0;
    
    // Vérifier lieu -> contact
    for (const lieuAnalysis of lieuxAnalysis) {
      if (lieuAnalysis.contactsCount > 0 && lieuAnalysis.contactsFormat === 'contactsIds (array)') {
        const lieu = lieuxSnapshot.docs.find(d => d.id === lieuAnalysis.id);
        const lieuData = lieu.data();
        
        for (const contactId of lieuData.contactsIds) {
          if (typeof contactId === 'string') {
            // Vérifier si le contact existe
            const contactExists = contactsSnapshot.docs.find(d => d.id === contactId);
            
            if (!contactExists) {
              orphanRelations++;
              report.bidirectionalIssues.push({
                type: 'orphan_contact_in_lieu',
                lieuId: lieuAnalysis.id,
                lieuNom: lieuAnalysis.nom,
                contactId: contactId,
                message: `Le lieu référence un contact qui n'existe pas`
              });
            } else {
              // Vérifier la relation inverse
              const contactData = contactExists.data();
              const hasReversRelation = contactData.lieuxIds?.includes(lieuAnalysis.id);
              
              if (!hasReversRelation) {
                bidirectionalMissing++;
                report.bidirectionalIssues.push({
                  type: 'missing_reverse_relation',
                  lieuId: lieuAnalysis.id,
                  lieuNom: lieuAnalysis.nom,
                  contactId: contactId,
                  contactNom: contactData.nom,
                  message: `Le lieu référence le contact, mais le contact ne référence pas le lieu`
                });
              } else {
                bidirectionalOk++;
              }
            }
          }
        }
      }
    }
    
    console.log(`✅ Relations bidirectionnelles OK: ${bidirectionalOk}`);
    console.log(`❌ Relations manquantes: ${bidirectionalMissing}`);
    console.log(`⚠️ Relations orphelines: ${orphanRelations}`);

    // 5. Cas spéciaux et anomalies
    console.log('\n🚨 5. CAS SPÉCIAUX ET ANOMALIES');
    console.log('-'.repeat(40));
    
    // Chercher des lieux sans ID
    const lieuxSansId = lieuxSnapshot.docs.filter(doc => !doc.id);
    if (lieuxSansId.length > 0) {
      console.log(`⚠️ ${lieuxSansId.length} lieu(x) sans ID!`);
      report.structuralProblems.push({
        type: 'lieux_without_id',
        count: lieuxSansId.length,
        severity: 'critical'
      });
    }
    
    // Chercher des structures imbriquées suspectes
    let nestedStructures = 0;
    contactsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.lieuxIds && Array.isArray(data.lieuxIds)) {
        data.lieuxIds.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            nestedStructures++;
            console.log(`⚠️ Structure imbriquée trouvée dans contact ${doc.id}:`, item);
          }
        });
      }
    });
    
    if (nestedStructures > 0) {
      report.structuralProblems.push({
        type: 'nested_structures_in_arrays',
        count: nestedStructures,
        severity: 'high'
      });
    }

    // 6. Générer les recommandations
    console.log('\n💡 6. RECOMMANDATIONS');
    console.log('-'.repeat(40));
    
    // Recommandations basées sur l'analyse
    if (report.dataFormats.lieux['contacts (array d\'objets)'] > 0) {
      report.recommendations.push({
        priority: 'HIGH',
        action: 'Migrer les lieux utilisant "contacts" vers "contactsIds"',
        impact: `${report.dataFormats.lieux['contacts (array d\'objets)']} lieux affectés`
      });
    }
    
    if (report.dataFormats.contacts['lieuxAssocies (array d\'objets)'] > 0) {
      report.recommendations.push({
        priority: 'HIGH',
        action: 'Migrer les contacts utilisant "lieuxAssocies" vers "lieuxIds"',
        impact: `${report.dataFormats.contacts['lieuxAssocies (array d\'objets)']} contacts affectés`
      });
    }
    
    if (report.organizationProblems.length > 0) {
      report.recommendations.push({
        priority: 'CRITICAL',
        action: 'Corriger les entrepriseId manquants',
        impact: `${report.organizationProblems.length} entités sans entrepriseId`
      });
    }
    
    if (bidirectionalMissing > 0) {
      report.recommendations.push({
        priority: 'MEDIUM',
        action: 'Réparer les relations bidirectionnelles manquantes',
        impact: `${bidirectionalMissing} relations à corriger`
      });
    }
    
    if (orphanRelations > 0) {
      report.recommendations.push({
        priority: 'HIGH',
        action: 'Nettoyer les relations orphelines',
        impact: `${orphanRelations} références vers des entités inexistantes`
      });
    }
    
    if (nestedStructures > 0) {
      report.recommendations.push({
        priority: 'CRITICAL',
        action: 'Corriger les structures imbriquées dans les arrays',
        impact: `${nestedStructures} structures imbriquées détectées`
      });
    }

    // Afficher les recommandations
    report.recommendations.forEach(rec => {
      console.log(`[${rec.priority}] ${rec.action}`);
      console.log(`   Impact: ${rec.impact}`);
    });

    // 7. Afficher les problèmes critiques
    if (report.bidirectionalIssues.length > 0) {
      console.log('\n🔴 PROBLÈMES CRITIQUES DÉTECTÉS:');
      console.log('-'.repeat(40));
      
      // Limiter l'affichage à 10 pour ne pas surcharger
      const issuesToShow = report.bidirectionalIssues.slice(0, 10);
      issuesToShow.forEach(issue => {
        console.log(`❌ ${issue.type}:`);
        console.log(`   ${issue.message}`);
        console.log(`   Lieu: ${issue.lieuNom} (${issue.lieuId})`);
        if (issue.contactNom) {
          console.log(`   Contact: ${issue.contactNom} (${issue.contactId})`);
        }
      });
      
      if (report.bidirectionalIssues.length > 10) {
        console.log(`\n... et ${report.bidirectionalIssues.length - 10} autres problèmes`);
      }
    }

    // Sauvegarder le rapport complet
    window.auditReport = report;
    console.log('\n📄 Rapport complet sauvegardé dans window.auditReport');
    console.log('   Utilisez JSON.stringify(window.auditReport, null, 2) pour l\'afficher');
    
    return report;

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    report.error = error.message;
    return report;
  }
}

// Fonction pour corriger automatiquement certains problèmes
async function fixIdentifiedProblems(dryRun = true) {
  console.log('\n🔧 CORRECTION DES PROBLÈMES IDENTIFIÉS');
  console.log(`Mode: ${dryRun ? 'DRY RUN (simulation)' : 'RÉEL'}`);
  console.log('='.repeat(80));
  
  if (!window.auditReport) {
    console.error('❌ Aucun rapport d\'audit disponible. Exécutez d\'abord auditLieuContactRelations()');
    return;
  }
  
  const fixes = {
    bidirectionalFixed: 0,
    entrepriseIdFixed: 0,
    formatMigrated: 0
  };
  
  const { db, doc, updateDoc, arrayUnion } = await import('/src/services/firebase-service.js');
  
  // 1. Corriger les relations bidirectionnelles manquantes
  console.log('\n🔗 Correction des relations bidirectionnelles...');
  
  for (const issue of window.auditReport.bidirectionalIssues) {
    if (issue.type === 'missing_reverse_relation') {
      console.log(`   Ajout de ${issue.lieuId} dans lieuxIds du contact ${issue.contactId}`);
      
      if (!dryRun) {
        try {
          await updateDoc(doc(db, 'contacts', issue.contactId), {
            lieuxIds: arrayUnion(issue.lieuId)
          });
          fixes.bidirectionalFixed++;
        } catch (error) {
          console.error(`   ❌ Erreur:`, error.message);
        }
      } else {
        fixes.bidirectionalFixed++;
      }
    }
  }
  
  console.log(`\n📊 Résumé des corrections ${dryRun ? '(simulation)' : ''}:`);
  console.log(`   - Relations bidirectionnelles: ${fixes.bidirectionalFixed}`);
  console.log(`   - EntrepriseId: ${fixes.entrepriseIdFixed}`);
  console.log(`   - Formats migrés: ${fixes.formatMigrated}`);
  
  if (dryRun) {
    console.log('\n💡 Pour appliquer réellement les corrections, exécutez:');
    console.log('   fixIdentifiedProblems(false)');
  }
  
  return fixes;
}

// Exposer les fonctions
window.auditLieuContactRelations = auditLieuContactRelations;
window.fixIdentifiedProblems = fixIdentifiedProblems;

console.log('\n🚀 FONCTIONS DISPONIBLES:');
console.log('   auditLieuContactRelations() - Lance l\'audit complet');
console.log('   fixIdentifiedProblems(true) - Simule les corrections');
console.log('   fixIdentifiedProblems(false) - Applique les corrections');
console.log('\n💡 Commencez par: auditLieuContactRelations()');