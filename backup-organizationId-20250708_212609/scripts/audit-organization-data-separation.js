#!/usr/bin/env node
/**
 * Script d'audit pour vérifier la séparation des données entre organisations
 * Ce script vérifie si les données sont correctement filtrées par organizationId
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Fonction pour auditer une collection
 */
async function auditCollection(collectionName) {
  console.log(`\n📊 Audit de la collection: ${collectionName}`);
  console.log('='.repeat(50));
  
  try {
    // Récupérer tous les documents
    const snapshot = await db.collection(collectionName).get();
    const totalDocs = snapshot.size;
    
    // Analyser les organizationIds
    const orgStats = {};
    const docsWithoutOrgId = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.organizationId) {
        orgStats[data.organizationId] = (orgStats[data.organizationId] || 0) + 1;
      } else {
        docsWithoutOrgId.push({
          id: doc.id,
          preview: JSON.stringify(data).substring(0, 100) + '...'
        });
      }
    });
    
    // Afficher les résultats
    console.log(`Total documents: ${totalDocs}`);
    console.log(`Documents sans organizationId: ${docsWithoutOrgId.length}`);
    console.log(`\nRépartition par organisation:`);
    
    Object.entries(orgStats).forEach(([orgId, count]) => {
      console.log(`  - ${orgId}: ${count} documents (${((count/totalDocs)*100).toFixed(1)}%)`);
    });
    
    // Afficher les documents sans organizationId
    if (docsWithoutOrgId.length > 0) {
      console.log(`\n⚠️  Documents sans organizationId:`);
      docsWithoutOrgId.slice(0, 5).forEach(doc => {
        console.log(`  - ${doc.id}: ${doc.preview}`);
      });
      if (docsWithoutOrgId.length > 5) {
        console.log(`  ... et ${docsWithoutOrgId.length - 5} autres`);
      }
    }
    
    return {
      collection: collectionName,
      total: totalDocs,
      withoutOrgId: docsWithoutOrgId.length,
      byOrganization: orgStats
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'audit de ${collectionName}:`, error.message);
    return null;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔍 Audit de la séparation des données par organisation');
  console.log('Date:', new Date().toLocaleString());
  
  const collections = ['concerts', 'contacts', 'lieux', 'artistes', 'structures', 'formulaires', 'contrats'];
  const results = [];
  
  for (const collection of collections) {
    const result = await auditCollection(collection);
    if (result) results.push(result);
  }
  
  // Résumé final
  console.log('\n\n📈 RÉSUMÉ DE L\'AUDIT');
  console.log('='.repeat(70));
  
  const problematicCollections = results.filter(r => r.withoutOrgId > 0);
  
  if (problematicCollections.length > 0) {
    console.log('\n🚨 Collections avec des problèmes:');
    problematicCollections.forEach(r => {
      console.log(`  - ${r.collection}: ${r.withoutOrgId} documents sans organizationId (${((r.withoutOrgId/r.total)*100).toFixed(1)}%)`);
    });
  } else {
    console.log('\n✅ Toutes les collections ont un organizationId sur tous les documents');
  }
  
  // Vérifier la cohérence des organizations
  console.log('\n\n🏢 Organisations détectées:');
  const allOrgs = new Set();
  results.forEach(r => {
    Object.keys(r.byOrganization).forEach(orgId => allOrgs.add(orgId));
  });
  
  console.log(`Total: ${allOrgs.size} organisations`);
  allOrgs.forEach(orgId => {
    console.log(`\n  Organisation: ${orgId}`);
    results.forEach(r => {
      const count = r.byOrganization[orgId] || 0;
      if (count > 0) {
        console.log(`    - ${r.collection}: ${count} documents`);
      }
    });
  });
  
  // Créer un rapport JSON
  const report = {
    date: new Date().toISOString(),
    summary: {
      totalCollections: collections.length,
      collectionsWithIssues: problematicCollections.length,
      totalOrganizations: allOrgs.size
    },
    details: results,
    recommendations: []
  };
  
  if (problematicCollections.length > 0) {
    report.recommendations.push(
      "1. Ajouter organizationId aux documents qui n'en ont pas",
      "2. Implémenter des règles de sécurité Firestore pour forcer organizationId",
      "3. Modifier ListWithFilters pour toujours filtrer par organizationId"
    );
  }
  
  // Sauvegarder le rapport
  const fs = require('fs');
  const reportPath = './audit/audit-organization-separation-' + new Date().toISOString().split('T')[0] + '.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n\n📄 Rapport sauvegardé dans: ${reportPath}`);
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});