#!/usr/bin/env node

/**
 * Script pour corriger automatiquement le problème des structures imbriquées
 * dans useUnifiedContact.js
 * 
 * PROBLÈME: Le hook crée des objets imbriqués (structure: {}, personne: {})
 * SOLUTION: Retourner des données plates avec préfixes
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/hooks/contacts/useUnifiedContact.js');

// Lire le fichier
const content = fs.readFileSync(filePath, 'utf8');

// Pattern pour trouver la création de structure imbriquée
const structurePattern = /contactData = \{[\s\S]*?structure: \{[\s\S]*?\},[\s\S]*?\};/g;
const personnePattern = /contactData = \{[\s\S]*?personne: \{[\s\S]*?\},[\s\S]*?\};/g;

// Nouveau code pour structure (format plat)
const newStructureCode = `contactData = {
            id: rawContactData.id,
            entityType: 'structure',
            // Structure aplatie avec préfixes
            structureRaisonSociale: rawContactData.raisonSociale,
            structureType: rawContactData.type,
            structureEmail: rawContactData.email,
            structureTelephone1: rawContactData.telephone1,
            structureTelephone2: rawContactData.telephone2,
            structureFax: rawContactData.fax,
            structureSiteWeb: rawContactData.siteWeb,
            structureAdresse: rawContactData.adresse,
            structureCodePostal: rawContactData.codePostal,
            structureVille: rawContactData.ville,
            structurePays: rawContactData.pays,
            structureIsClient: rawContactData.isClient,
            structureNotes: rawContactData.notes,
            // Données directes
            tags: rawContactData.tags || [],
            commentaires: rawContactData.commentaires || [],
            personnes: rawContactData.personnes?.map(p => ({
              id: p.id,
              prenom: p.prenom,
              nom: p.nom,
              fonction: p.liaison?.fonction || '',
              email: p.email,
              telephone: p.telephone,
              mobile: p.telephone2,
              mailPerso: p.email,
              adresse: p.adresse,
              codePostal: p.codePostal,
              ville: p.ville,
              pays: p.pays,
              actif: p.liaison?.actif,
              prioritaire: p.liaison?.prioritaire,
              interesse: p.liaison?.interesse
            })) || [],
            createdAt: rawContactData.createdAt,
            updatedAt: rawContactData.updatedAt
          };`;

// Nouveau code pour personne (format plat)
const newPersonneCode = `contactData = {
            id: rawContactData.id,
            entityType: (rawContactData.isPersonneLibre && (!rawContactData.structures || rawContactData.structures.length === 0)) ? 'personne_libre' : 'personne',
            // Personne aplatie directement
            prenom: rawContactData.prenom,
            nom: rawContactData.nom,
            email: rawContactData.email,
            telephone: rawContactData.telephone,
            mobile: rawContactData.telephone2,
            adresse: rawContactData.adresse,
            codePostal: rawContactData.codePostal,
            ville: rawContactData.ville,
            pays: rawContactData.pays,
            notes: rawContactData.notes,
            // Données directes
            tags: rawContactData.tags || [],
            commentaires: rawContactData.commentaires || [],
            structures: rawContactData.structures?.map(s => ({
              id: s.id,
              raisonSociale: s.raisonSociale,
              type: s.type,
              fonction: s.liaison?.fonction || '',
              actif: s.liaison?.actif,
              prioritaire: s.liaison?.prioritaire,
              interesse: s.liaison?.interesse
            })) || [],
            createdAt: rawContactData.createdAt,
            updatedAt: rawContactData.updatedAt
          };`;

// Fonction pour afficher les changements
function showDiff(original, replacement, type) {
  console.log(`\n📝 ${type}:`);
  console.log('❌ AVANT (structure imbriquée):');
  console.log(original.substring(0, 200) + '...');
  console.log('\n✅ APRÈS (structure plate):');
  console.log(replacement.substring(0, 200) + '...');
}

// Trouver et remplacer les patterns
let modifiedContent = content;
let structureMatches = content.match(structurePattern);
let personneMatches = content.match(personnePattern);

if (structureMatches) {
  console.log('🔍 Structure imbriquée trouvée pour les structures');
  showDiff(structureMatches[0], newStructureCode, 'Structure');
  modifiedContent = modifiedContent.replace(structurePattern, newStructureCode);
}

if (personneMatches) {
  console.log('🔍 Structure imbriquée trouvée pour les personnes');
  showDiff(personneMatches[0], newPersonneCode, 'Personne');
  modifiedContent = modifiedContent.replace(personnePattern, newPersonneCode);
}

// Sauvegarder les changements ?
if (structureMatches || personneMatches) {
  console.log('\n⚠️  Les changements suivants seront appliqués:');
  console.log('   - Suppression des objets imbriqués structure: {} et personne: {}');
  console.log('   - Remplacement par des champs plats avec préfixes');
  console.log('   - Compatibilité maintenue avec ContactViewTabs.js');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n✅ Appliquer ces changements ? (o/n) ', (answer) => {
    if (answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui') {
      // Backup
      const backupPath = filePath + '.backup.' + Date.now();
      fs.copyFileSync(filePath, backupPath);
      console.log(`📄 Backup créé: ${backupPath}`);
      
      // Écrire les changements
      fs.writeFileSync(filePath, modifiedContent);
      console.log('✅ Fichier modifié avec succès!');
      console.log('\n🎯 Prochaines étapes:');
      console.log('   1. Tester que ContactViewTabs fonctionne toujours');
      console.log('   2. Exécuter le script fix-nested-contacts.js pour corriger les données Firebase');
      console.log('   3. Vérifier que les nouvelles sauvegardes sont bien plates');
    } else {
      console.log('❌ Modifications annulées');
    }
    rl.close();
    process.exit(0);
  });
} else {
  console.log('✅ Aucune structure imbriquée trouvée dans useUnifiedContact.js');
  console.log('   Le fichier est déjà correct ou a déjà été modifié.');
  process.exit(0);
}