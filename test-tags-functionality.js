#!/usr/bin/env node

/**
 * Script de test pour vérifier que la fonctionnalité des tags est bien implémentée
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Test de la fonctionnalité Tags...\n');

// Vérifier que tous les fichiers nécessaires existent
const filesToCheck = [
  'src/pages/ContactTagsPage.js',
  'src/components/contact/parametrage/TagsManager.js',
  'src/components/contacts/ContactsListFiltered.js',
  'src/components/tabs/TabManagerProduction.js',
  'src/config/tagsHierarchy.js'
];

let allFilesExist = true;
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - Manquant`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Certains fichiers sont manquants!');
  process.exit(1);
}

// Vérifier que les routes sont configurées
const appJsPath = path.join(__dirname, 'src/App.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

if (appJsContent.includes('/contacts/tags')) {
  console.log('✅ Route /contacts/tags configurée dans App.js');
} else {
  console.log('❌ Route /contacts/tags manquante dans App.js');
}

// Vérifier que le menu est configuré
const layoutPath = path.join(__dirname, 'src/components/common/layout/DesktopLayout.js');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

if (layoutContent.includes('"Tags"') && layoutContent.includes('/contacts/tags')) {
  console.log('✅ Menu Tags configuré dans DesktopLayout.js');
} else {
  console.log('❌ Menu Tags manquant dans DesktopLayout.js');
}

// Vérifier les hiérarchies de tags
const tagsHierarchyPath = path.join(__dirname, 'src/config/tagsHierarchy.js');
const tagsHierarchyContent = fs.readFileSync(tagsHierarchyPath, 'utf8');

const hierarchies = ['TAGS_HIERARCHY', 'GENRES_HIERARCHY', 'RESEAUX_HIERARCHY', 'MOTS_CLES_HIERARCHY'];
hierarchies.forEach(hierarchy => {
  if (tagsHierarchyContent.includes(`export const ${hierarchy}`)) {
    console.log(`✅ ${hierarchy} définie`);
  } else {
    console.log(`❌ ${hierarchy} manquante`);
  }
});

// Vérifier que TabManager inclut ContactsListFiltered
const tabManagerPath = path.join(__dirname, 'src/components/tabs/TabManagerProduction.js');
const tabManagerContent = fs.readFileSync(tabManagerPath, 'utf8');

if (tabManagerContent.includes('ContactsListFiltered') && tabManagerContent.includes("case 'ContactsListFiltered'")) {
  console.log('✅ ContactsListFiltered intégré dans TabManager');
} else {
  console.log('❌ ContactsListFiltered manquant dans TabManager');
}

console.log('\n🎯 Instructions pour tester manuellement:');
console.log('1. Redémarrez le serveur de développement : npm start');
console.log('2. Ouvrez votre navigateur sur http://localhost:3000');
console.log('3. Naviguez vers Contact > Tags dans le menu');
console.log('4. Vérifiez que vous voyez les 4 sections: Activités, Genres, Réseaux, Mots-clés');
console.log('5. Cliquez sur "Activités" et vérifiez le tableau hiérarchique');
console.log('6. Cherchez des tags avec un nombre > 0 et cliquez dessus');
console.log('7. Vérifiez qu\'un nouvel onglet s\'ouvre avec les contacts filtrés');

console.log('\n✅ Vérification terminée!');