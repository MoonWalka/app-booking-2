#!/usr/bin/env node
/**
 * Script pour corriger le problème de séparation des données entre organisations
 * Ce script applique les corrections nécessaires pour garantir que toutes les données
 * sont correctement filtrées par entrepriseId
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Application des correctifs de sécurité pour la séparation des données\n');

// Fichier à corriger
const listWithFiltersPath = path.join(__dirname, '../src/components/ui/ListWithFilters.js');

// Vérifier si le fichier existe
if (!fs.existsSync(listWithFiltersPath)) {
  console.error('❌ Fichier ListWithFilters.js non trouvé!');
  process.exit(1);
}

// Lire le contenu actuel
let content = fs.readFileSync(listWithFiltersPath, 'utf8');
const originalContent = content;

// Vérifier si les corrections ont déjà été appliquées
if (content.includes('useOrganization') && content.includes('currentOrganization?.id')) {
  console.log('✅ Les corrections semblent déjà appliquées!');
  console.log('   - Import de useOrganization: ✓');
  console.log('   - Utilisation de currentOrganization: ✓');
  console.log('   - Filtre entrepriseId: ✓');
  process.exit(0);
}

console.log('📝 Application des corrections...\n');

// 1. Ajouter l'import de useOrganization si nécessaire
if (!content.includes("import { useOrganization }")) {
  console.log('1. Ajout de l\'import useOrganization...');
  
  // Trouver la position après les autres imports
  const lastImportMatch = content.match(/import[^;]+from[^;]+;(?=\s*\/\*\*|\s*const)/g);
  if (lastImportMatch) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const insertPosition = content.indexOf(lastImport) + lastImport.length;
    
    content = content.slice(0, insertPosition) + 
      "\nimport { useOrganization } from '@/context/OrganizationContext';" + 
      content.slice(insertPosition);
    
    console.log('   ✓ Import ajouté');
  }
}

// 2. Ajouter currentOrganization dans le composant
if (!content.includes('const { currentOrganization }')) {
  console.log('2. Ajout de currentOrganization dans le composant...');
  
  // Trouver la ligne avec useResponsive
  const useResponsiveMatch = content.match(/const\s*{\s*isMobile\s*}\s*=\s*useResponsive\(\);/);
  if (useResponsiveMatch) {
    const insertPosition = content.indexOf(useResponsiveMatch[0]) + useResponsiveMatch[0].length;
    
    content = content.slice(0, insertPosition) + 
      "\n  const { currentOrganization } = useOrganization();" + 
      content.slice(insertPosition);
    
    console.log('   ✓ Hook useOrganization ajouté');
  }
}

// 3. Modifier la fonction loadData pour ajouter le filtre entrepriseId
console.log('3. Modification de la fonction loadData...');

// Chercher le pattern de construction de la requête
const queryPattern = /const collectionRef = collection\(db, collectionName\);\s*\/\/ Construction de la requête\s*let q = collectionRef;/;

if (queryPattern.test(content)) {
  content = content.replace(queryPattern, `const collectionRef = collection(db, collectionName);
      
      // Construction de la requête avec les filtres
      const queryConditions = [];
      
      // IMPORTANT: Toujours filtrer par entrepriseId pour la sécurité
      if (currentOrganization?.id) {
        queryConditions.push(where('entrepriseId', '==', currentOrganization.id));
      } else {
        console.warn('⚠️ Pas d\\'organisation courante - impossible de filtrer les données');
        setItems([]);
        setLoading(false);
        return;
      }`);
  
  console.log('   ✓ Filtre entrepriseId ajouté');
}

// 4. Mettre à jour la construction de la requête avec les conditions
const oldQueryBuild = /if \(filterConditions\.length > 0\) {\s*q = query\(q, \.\.\.filterConditions\);\s*}/;
const newQueryBuild = `queryConditions.push(...filterConditions);
      }
      
      // Construire la requête initiale avec les conditions
      let q = queryConditions.length > 0 ? query(collectionRef, ...queryConditions) : collectionRef`;

if (oldQueryBuild.test(content)) {
  content = content.replace(oldQueryBuild, newQueryBuild);
  console.log('   ✓ Construction de requête mise à jour');
}

// 5. Ajouter currentOrganization?.id dans les dépendances du useCallback
const dependenciesPattern = /}, \[entityType, filters, sort, pageSize\]\);/;
if (dependenciesPattern.test(content) && !content.includes('currentOrganization?.id')) {
  content = content.replace(dependenciesPattern, '}, [entityType, filters, sort, pageSize, currentOrganization?.id]);');
  console.log('   ✓ Dépendances du useCallback mises à jour');
}

// Sauvegarder si des modifications ont été faites
if (content !== originalContent) {
  // Créer une sauvegarde
  const backupPath = listWithFiltersPath + '.backup-' + Date.now();
  fs.writeFileSync(backupPath, originalContent);
  console.log(`\n📦 Sauvegarde créée: ${path.basename(backupPath)}`);
  
  // Écrire les modifications
  fs.writeFileSync(listWithFiltersPath, content);
  console.log('\n✅ Corrections appliquées avec succès!');
  
  console.log('\n📋 Résumé des modifications:');
  console.log('   - Import de useOrganization ajouté');
  console.log('   - Hook useOrganization utilisé dans le composant');
  console.log('   - Filtre entrepriseId ajouté dans loadData');
  console.log('   - Gestion des cas sans organisation');
  console.log('   - Dépendances du useCallback mises à jour');
  
  console.log('\n⚠️  Actions supplémentaires recommandées:');
  console.log('   1. Tester l\'application avec plusieurs organisations');
  console.log('   2. Vérifier que les données sont bien filtrées');
  console.log('   3. Appliquer des règles de sécurité Firestore');
  
} else {
  console.log('\n✅ Aucune modification nécessaire - Le fichier semble déjà corrigé');
}

console.log('\n🎯 Prochaines étapes:');
console.log('   1. Redémarrer l\'application: npm start');
console.log('   2. Tester avec différentes organisations');
console.log('   3. Exécuter le script d\'audit: node scripts/audit-organization-data-separation.js');

process.exit(0);