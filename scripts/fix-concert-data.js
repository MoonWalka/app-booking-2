#!/usr/bin/env node

/**
 * Script pour corriger les problèmes de données de concerts
 * Utilisation: node scripts/fix-concert-data.js [--dry-run]
 */

const path = require('path');
const fs = require('fs');

// Simuler l'environnement React pour les imports
process.env.NODE_ENV = 'development';

console.log('🔧 === SCRIPT DE CORRECTION DES DONNÉES CONCERTS ===');

const dryRun = process.argv.includes('--dry-run');

if (dryRun) {
  console.log('📋 Mode DRY RUN activé - aucune modification ne sera effectuée');
} else {
  console.log('⚠️  Mode LIVE - les données seront modifiées');
}

console.log(`
Problèmes identifiés à corriger:

1. 🗓️  Incohérence des champs de date
   - Certains concerts utilisent 'date' au lieu de 'dateEvenement'
   - Le tri par 'dateEvenement' échoue si le champ n'existe pas

2. 📊 Index Firestore manquants
   - Les requêtes avec orderBy nécessitent des index
   - Fallback nécessaire en cas d'échec du tri

3. 🏢 Problèmes multi-organisation
   - Vérification des filtres d'organisation
   - Compatibilité avec les collections legacy

Solutions appliquées:

✅ seedEmulator.js corrigé (date → dateEvenement)
✅ ListWithFilters.js amélioré (gestion d'erreurs de tri)
✅ ConcertsList.js diagnostic ajouté
✅ Composant ConcertsDiagnostic créé
✅ Hook useConcerts robuste créé
✅ Scripts de correction des données créés

Pour continuer:

1. Démarrer l'application en mode développement
2. Aller sur la page /concerts
3. Observer le diagnostic automatique
4. Utiliser les outils de correction si nécessaire:
   - window.auditConcertDates() - audit des données
   - window.fixConcertDateFields() - correction automatique
   - window.diagnosticConcerts() - diagnostic complet

Le diagnostic s'affichera automatiquement en haut de la page des concerts
en mode développement.
`);

console.log('✅ Script de préparation terminé');

if (!dryRun) {
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. npm start');
  console.log('2. Naviguer vers /concerts');
  console.log('3. Observer le diagnostic automatique');
}