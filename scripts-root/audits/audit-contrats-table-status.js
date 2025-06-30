#!/usr/bin/env node

/**
 * Script d'audit pour vérifier l'affichage des contrats avec le système de statuts
 * 
 * Objectifs :
 * 1. Vérifier que ContratsTableNew affiche correctement les contrats avec status='generated'
 * 2. Vérifier le mapping des propriétés entre la collection 'contrats' et l'affichage
 * 3. Identifier les problèmes potentiels dans le flux de données
 */

const fs = require('fs');
const path = require('path');

console.log('=== AUDIT DU SYSTÈME D\'AFFICHAGE DES CONTRATS ===\n');

// 1. Analyser ContratsPage.js
console.log('1. ANALYSE DE ContratsPage.js');
console.log('------------------------------');

const contratsPagePath = path.join(__dirname, '../../src/pages/ContratsPage.js');
const contratsPageContent = fs.readFileSync(contratsPagePath, 'utf8');

// Vérifier la source des données
if (contratsPageContent.includes("collection(db, 'contrats')")) {
  console.log('✅ ContratsPage charge bien depuis la collection "contrats"');
} else {
  console.log('❌ ContratsPage ne charge pas depuis la collection "contrats"');
}

// Vérifier le champ de tri
const orderByMatch = contratsPageContent.match(/orderBy\(['"]([^'"]+)['"]/);
if (orderByMatch) {
  console.log(`✅ Tri par: ${orderByMatch[1]}`);
  if (orderByMatch[1] === 'dateGeneration') {
    console.log('   ⚠️  ATTENTION: Le tri par "dateGeneration" pourrait ne pas exister dans tous les contrats');
    console.log('   💡 Recommandation: Utiliser "updatedAt" ou "createdAt" qui sont toujours présents');
  }
}

// Vérifier la structure des données passées
console.log('\n📊 Structure des données passées à ContratsTableNew:');
const returnMatch = contratsPageContent.match(/return\s*{\s*([^}]+)\s*}/gs);
if (returnMatch) {
  console.log('   - id: doc.id');
  console.log('   - ...contratData (toutes les propriétés du contrat)');
  console.log('   - concert: concertData (données du concert associé)');
}

// 2. Analyser ContratsTableNew.js
console.log('\n2. ANALYSE DE ContratsTableNew.js');
console.log('----------------------------------');

const contratsTablePath = path.join(__dirname, '../../src/components/contrats/sections/ContratsTableNew.js');
const contratsTableContent = fs.readFileSync(contratsTablePath, 'utf8');

// Vérifier comment le statut est utilisé
console.log('\n📋 Utilisation du statut dans ContratsTableNew:');
const statusUsages = contratsTableContent.match(/contrat\.status/g);
if (statusUsages) {
  console.log(`✅ Le statut est utilisé ${statusUsages.length} fois dans le composant`);
  
  // Vérifier les valeurs de statut attendues
  const statusChecks = [
    { pattern: /status === 'finalized'/, value: 'finalized' },
    { pattern: /status === 'signed'/, value: 'signed' },
    { pattern: /status === 'sent'/, value: 'sent' },
    { pattern: /status === 'generated'/, value: 'generated' },
    { pattern: /status === 'draft'/, value: 'draft' }
  ];
  
  console.log('\n🔍 Valeurs de statut vérifiées:');
  statusChecks.forEach(check => {
    if (contratsTableContent.match(check.pattern)) {
      console.log(`   ✅ ${check.value}`);
    } else {
      console.log(`   ❌ ${check.value} (non vérifié)`);
    }
  });
}

// Vérifier l'icône du contrat
console.log('\n🎨 Logique de l\'icône de contrat (colonne "Contrat"):');
const iconLogic = contratsTableContent.match(/if\s*\(contrat\.status[^}]+}/gs);
if (iconLogic) {
  console.log('✅ La logique de l\'icône utilise bien contrat.status');
  console.log('\n📊 Ordre de priorité des icônes:');
  console.log('   1. finalized/signed → Vert (file-earmark-check-fill)');
  console.log('   2. sent → Bleu info (file-earmark-arrow-up-fill)');
  console.log('   3. generated → Bleu primary (file-earmark-text-fill)');
  console.log('   4. draft/contratGenere → Jaune (file-earmark-text-fill)');
  console.log('   5. Aucun statut → Gris (file-earmark)');
}

// 3. Problèmes potentiels identifiés
console.log('\n3. PROBLÈMES POTENTIELS IDENTIFIÉS');
console.log('-----------------------------------');

const problems = [];

// Problème 1: Champ dateGeneration
if (contratsPageContent.includes("orderBy('dateGeneration'")) {
  problems.push({
    issue: 'Tri par dateGeneration',
    description: 'Le champ dateGeneration pourrait ne pas exister dans tous les contrats',
    solution: 'Utiliser updatedAt ou createdAt qui sont toujours présents'
  });
}

// Problème 2: Propriétés manquantes
const requiredProps = ['ref', 'entrepriseCode', 'collaborateurCode', 'type', 'raisonSociale'];
console.log('\n🔍 Vérification des propriétés requises:');
requiredProps.forEach(prop => {
  const propUsed = contratsTableContent.includes(`contrat.${prop}`);
  if (propUsed) {
    console.log(`   ✅ ${prop} est utilisé`);
    if (!contratsPageContent.includes(prop)) {
      problems.push({
        issue: `Propriété ${prop} manquante`,
        description: `${prop} est utilisé dans le tableau mais pourrait ne pas être chargé`,
        solution: `S'assurer que ${prop} est bien présent dans les données du contrat`
      });
    }
  }
});

// Problème 3: Mapping des données du concert
if (contratsTableContent.includes('contrat.artisteNom') && !contratsPageContent.includes('artisteNom')) {
  problems.push({
    issue: 'Mapping artisteNom',
    description: 'artisteNom est utilisé mais vient de concert.artisteNom',
    solution: 'Ajouter le mapping: artisteNom: concertData?.artisteNom dans ContratsPage'
  });
}

// 4. Recommandations
console.log('\n4. RECOMMANDATIONS');
console.log('------------------');

if (problems.length > 0) {
  console.log('\n❌ Problèmes à corriger:');
  problems.forEach((problem, index) => {
    console.log(`\n${index + 1}. ${problem.issue}`);
    console.log(`   Description: ${problem.description}`);
    console.log(`   Solution: ${problem.solution}`);
  });
} else {
  console.log('\n✅ Aucun problème majeur détecté');
}

console.log('\n💡 Recommandations générales:');
console.log('1. Ajouter un mapping explicite des propriétés dans ContratsPage');
console.log('2. Utiliser un champ de tri plus fiable (updatedAt)');
console.log('3. S\'assurer que toutes les propriétés requises sont présentes');
console.log('4. Ajouter des valeurs par défaut pour les propriétés optionnelles');

// 5. Exemple de correction suggérée
console.log('\n5. EXEMPLE DE CORRECTION SUGGÉRÉE');
console.log('---------------------------------');
console.log(`
// Dans ContratsPage.js, modifier le mapping des données :

const contratsPromises = contratsSnapshot.docs.map(async (doc) => {
  const contratData = doc.data();
  
  // ... chargement du concert ...
  
  return {
    id: doc.id,
    ...contratData,
    // Mapping explicite des propriétés nécessaires
    ref: contratData.ref || contratData.contratNumber || \`CONT-\${doc.id.slice(0, 6)}\`,
    entrepriseCode: contratData.entrepriseCode || 'MR',
    collaborateurCode: contratData.collaborateurCode || '--',
    type: contratData.type || contratData.contratType || 'Standard',
    raisonSociale: contratData.raisonSociale || concertData?.structureNom || '--',
    artisteNom: concertData?.artisteNom || contratData.artisteNom || '--',
    lieu: concertData?.lieuNom || contratData.lieu || '--',
    dateEvenement: concertData?.date || contratData.dateEvenement,
    // Statut normalisé
    status: contratData.status || (contratData.contratGenere ? 'draft' : null),
    // Données du concert
    concert: concertData,
    concertId: contratData.concertId
  };
});
`);

console.log('\n=== FIN DE L\'AUDIT ===\n');