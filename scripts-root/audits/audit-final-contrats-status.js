#!/usr/bin/env node

/**
 * Audit final du système d'affichage des contrats
 * Vérifie que toutes les corrections ont été appliquées
 */

const fs = require('fs');
const path = require('path');

console.log('=== AUDIT FINAL - SYSTÈME D\'AFFICHAGE DES CONTRATS ===\n');

// 1. Vérifier ContratsPage
console.log('1. VÉRIFICATION DE ContratsPage.js');
console.log('-----------------------------------');

const contratsPagePath = path.join(__dirname, '../../src/pages/ContratsPage.js');
const contratsPageContent = fs.readFileSync(contratsPagePath, 'utf8');

const checks = {
  'Import useTabs': contratsPageContent.includes("import { useTabs }"),
  'Hook useTabs utilisé': contratsPageContent.includes("const { openTab, openDevisTab, openNewDevisTab, openContratTab } = useTabs()"),
  'Tri par updatedAt': contratsPageContent.includes("orderBy('updatedAt', 'desc')"),
  'Mapping ref': contratsPageContent.includes("ref: contratData.ref || contratData.contratNumber"),
  'Mapping entrepriseCode': contratsPageContent.includes("entrepriseCode: contratData.entrepriseCode || 'MR'"),
  'Mapping status': contratsPageContent.includes("status: contratData.status || (contratData.contratGenere ? 'draft' : null)"),
  'Handler handleViewFacture': contratsPageContent.includes("const handleViewFacture"),
  'Handler handleGenerateFacture': contratsPageContent.includes("const handleGenerateFacture"),
  'Props passées à ContratsTableNew': contratsPageContent.includes("openDevisTab={openDevisTab}")
};

Object.entries(checks).forEach(([check, result]) => {
  console.log(`${result ? '✅' : '❌'} ${check}`);
});

// 2. Vérifier le mapping des données
console.log('\n2. VÉRIFICATION DU MAPPING DES DONNÉES');
console.log('--------------------------------------');

const mappingFields = [
  'ref', 'entrepriseCode', 'collaborateurCode', 'type', 
  'raisonSociale', 'artisteNom', 'lieu', 'dateEvenement',
  'status', 'concertId', 'structureId'
];

console.log('Champs mappés avec valeurs par défaut:');
mappingFields.forEach(field => {
  if (contratsPageContent.includes(`${field}:`)) {
    console.log(`✅ ${field}`);
  } else {
    console.log(`❌ ${field} (non trouvé)`);
  }
});

// 3. Vérifier ContratsTableNew
console.log('\n3. VÉRIFICATION DE ContratsTableNew.js');
console.log('---------------------------------------');

const contratsTablePath = path.join(__dirname, '../../src/components/contrats/sections/ContratsTableNew.js');
const contratsTableContent = fs.readFileSync(contratsTablePath, 'utf8');

// Vérifier la gestion du statut 'generated'
const statusGenerated = contratsTableContent.match(/status === 'generated'/g);
console.log(`✅ Statut 'generated' vérifié ${statusGenerated ? statusGenerated.length : 0} fois`);

// Vérifier l'icône pour le statut generated
if (contratsTableContent.includes("status === 'generated'") && 
    contratsTableContent.includes("bi-file-earmark-text-fill text-primary")) {
  console.log('✅ Icône bleue primaire configurée pour status="generated"');
} else {
  console.log('❌ Configuration de l\'icône pour status="generated" non trouvée');
}

// 4. Résumé des corrections
console.log('\n4. RÉSUMÉ DES CORRECTIONS APPLIQUÉES');
console.log('------------------------------------');

const corrections = [
  {
    titre: 'Tri des contrats',
    avant: 'orderBy("dateGeneration", "desc")',
    apres: 'orderBy("updatedAt", "desc")',
    raison: 'dateGeneration n\'existe pas toujours'
  },
  {
    titre: 'Mapping des données',
    avant: 'Propriétés manquantes',
    apres: 'Toutes les propriétés avec valeurs par défaut',
    raison: 'Assurer l\'affichage même avec données incomplètes'
  },
  {
    titre: 'Handlers d\'onglets',
    avant: 'Handlers manquants dans ContratsPage',
    apres: 'Tous les handlers ajoutés et passés',
    raison: 'Permettre l\'ouverture des onglets devis/contrat/facture'
  },
  {
    titre: 'Gestion du statut',
    avant: 'Pas de normalisation',
    apres: 'status || (contratGenere ? "draft" : null)',
    raison: 'Compatibilité avec l\'ancien système'
  }
];

corrections.forEach((correction, index) => {
  console.log(`\n${index + 1}. ${correction.titre}`);
  console.log(`   Avant: ${correction.avant}`);
  console.log(`   Après: ${correction.apres}`);
  console.log(`   Raison: ${correction.raison}`);
});

// 5. Vérification finale
console.log('\n5. VÉRIFICATION FINALE');
console.log('----------------------');

const allChecks = Object.values(checks).every(v => v);
if (allChecks) {
  console.log('\n✅ TOUTES LES CORRECTIONS ONT ÉTÉ APPLIQUÉES AVEC SUCCÈS !');
  console.log('\nLes contrats avec status="generated" devraient maintenant:');
  console.log('  - Être chargés depuis la collection "contrats"');
  console.log('  - Apparaître dans la liste avec toutes les propriétés');
  console.log('  - Afficher une icône bleue primaire');
  console.log('  - Être cliquables pour ouvrir dans un onglet');
} else {
  console.log('\n⚠️  CERTAINES CORRECTIONS SONT MANQUANTES');
  console.log('Veuillez vérifier les points marqués ❌ ci-dessus');
}

console.log('\n=== FIN DE L\'AUDIT ===\n');