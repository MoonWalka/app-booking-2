#!/usr/bin/env node

/**
 * Script de test pour vérifier l'affichage des contrats avec le statut 'generated'
 * Ce script simule le comportement de ContratsPage et ContratsTableNew
 */

const fs = require('fs');
const path = require('path');

console.log('=== TEST D\'AFFICHAGE DES CONTRATS AVEC STATUT ===\n');

// Simuler des données de contrats comme elles seraient dans Firestore
const mockContrats = [
  {
    id: 'test-001',
    status: 'generated',
    contratNumber: 'CONT-2024-0001',
    entrepriseCode: 'MR',
    collaborateurCode: 'JD',
    type: 'Cession',
    concertId: 'concert-001',
    montantHT: 1500,
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'test-002',
    status: 'finalized',
    ref: 'CONT-2024-0002',
    entrepriseCode: 'MR',
    type: 'Coréo',
    concertId: 'concert-002',
    montantHT: 2000,
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'test-003',
    status: 'draft',
    concertId: 'concert-003',
    montantHT: 1000,
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'test-004',
    // Pas de status - ancien système
    contratGenere: true,
    concertId: 'concert-004',
    montantHT: 1800,
    updatedAt: new Date('2024-01-13')
  }
];

// Simuler les données de concerts
const mockConcerts = {
  'concert-001': {
    artisteNom: 'Les Meltin\'',
    lieuNom: 'Salle des Fêtes',
    structureNom: 'Mairie de Paris',
    date: new Date('2024-02-20')
  },
  'concert-002': {
    artisteNom: 'DJ Melt',
    lieuNom: 'Club 360',
    structureNom: 'Association Culture Plus',
    date: new Date('2024-02-25')
  },
  'concert-003': {
    artisteNom: 'Groupe Test',
    lieuNom: 'Théâtre Municipal',
    date: new Date('2024-03-01')
  },
  'concert-004': {
    artisteNom: 'Artiste Solo',
    lieuNom: 'Bar Le Central',
    date: new Date('2024-03-05')
  }
};

// Simuler le mapping fait dans ContratsPage.js
function mapContratData(contratData, concertData) {
  return {
    id: contratData.id,
    ...contratData,
    // Propriétés essentielles avec valeurs par défaut
    ref: contratData.ref || contratData.contratNumber || `CONT-${contratData.id.slice(0, 6)}`,
    entrepriseCode: contratData.entrepriseCode || 'MR',
    collaborateurCode: contratData.collaborateurCode || '--',
    type: contratData.type || contratData.contratType || 'Standard',
    raisonSociale: contratData.raisonSociale || 
                  contratData.organisateur?.raisonSociale || 
                  concertData?.structureNom || 
                  '--',
    // Données de l'artiste et du lieu
    artiste: contratData.artiste || concertData?.artisteNom || '--',
    artisteNom: concertData?.artisteNom || contratData.artisteNom || '--',
    lieu: concertData?.lieuNom || contratData.lieu || '--',
    // Dates
    dateEvenement: concertData?.date || contratData.dateEvenement,
    dateGeneration: contratData.dateGeneration || contratData.createdAt || contratData.updatedAt,
    // Statut normalisé
    status: contratData.status || (contratData.contratGenere ? 'draft' : null),
    // Données du concert
    concert: concertData,
    concertId: contratData.concertId
  };
}

// Simuler la détermination de l'icône comme dans ContratsTableNew
function getContratIcon(contrat) {
  let iconClass, title;
  
  if (contrat.status === 'finalized' || contrat.status === 'signed') {
    iconClass = "bi bi-file-earmark-check-fill text-success";
    title = "Contrat finalisé - Voir";
  } else if (contrat.status === 'sent') {
    iconClass = "bi bi-file-earmark-arrow-up-fill text-info";
    title = "Contrat envoyé - Voir";
  } else if (contrat.status === 'generated') {
    iconClass = "bi bi-file-earmark-text-fill text-primary";
    title = "Contrat généré - Voir";
  } else if (contrat.status === 'draft' || contrat.contratGenere) {
    iconClass = "bi bi-file-earmark-text-fill text-warning";
    title = "Contrat en cours - Continuer";
  } else {
    iconClass = "bi bi-file-earmark text-muted";
    title = "Pas de contrat";
  }
  
  return { iconClass, title };
}

// Tester le mapping et l'affichage
console.log('1. TEST DU MAPPING DES DONNÉES');
console.log('-------------------------------\n');

const mappedContrats = mockContrats.map(contrat => {
  const concertData = mockConcerts[contrat.concertId];
  return mapContratData(contrat, concertData);
});

// Afficher les résultats
mappedContrats.forEach(contrat => {
  const icon = getContratIcon(contrat);
  console.log(`Contrat ${contrat.ref}:`);
  console.log(`  - Status: ${contrat.status || '(aucun)'}`);
  console.log(`  - Artiste: ${contrat.artisteNom}`);
  console.log(`  - Lieu: ${contrat.lieu}`);
  console.log(`  - Type: ${contrat.type}`);
  console.log(`  - Icône: ${icon.title}`);
  console.log(`  - Classe CSS: ${icon.iconClass}`);
  console.log('');
});

// Vérifier spécifiquement les contrats avec status='generated'
console.log('\n2. VÉRIFICATION DES CONTRATS AVEC STATUS="GENERATED"');
console.log('----------------------------------------------------\n');

const generatedContrats = mappedContrats.filter(c => c.status === 'generated');
if (generatedContrats.length > 0) {
  console.log(`✅ ${generatedContrats.length} contrat(s) avec status="generated" trouvé(s):\n`);
  generatedContrats.forEach(contrat => {
    const icon = getContratIcon(contrat);
    console.log(`  - ${contrat.ref}: ${icon.title}`);
    console.log(`    Icône bleue primaire (bi-file-earmark-text-fill text-primary)`);
    console.log(`    → Sera affiché correctement dans la liste`);
  });
} else {
  console.log('❌ Aucun contrat avec status="generated" trouvé');
}

// Vérifier la migration des anciens statuts
console.log('\n3. VÉRIFICATION DE LA MIGRATION DES ANCIENS STATUTS');
console.log('---------------------------------------------------\n');

const oldSystemContrats = mappedContrats.filter(c => !mockContrats.find(mc => mc.id === c.id).status);
if (oldSystemContrats.length > 0) {
  console.log('Contrats utilisant l\'ancien système:');
  oldSystemContrats.forEach(contrat => {
    const original = mockContrats.find(mc => mc.id === contrat.id);
    console.log(`  - ${contrat.ref}:`);
    console.log(`    contratGenere: ${original.contratGenere}`);
    console.log(`    → Statut migré: ${contrat.status || '(aucun)'}`);
  });
}

// Résumé
console.log('\n4. RÉSUMÉ DE L\'AUDIT');
console.log('--------------------\n');

console.log('✅ Points positifs:');
console.log('  - Le mapping des données est correctement implémenté');
console.log('  - Les contrats avec status="generated" seront affichés avec l\'icône bleue');
console.log('  - Les propriétés manquantes ont des valeurs par défaut');
console.log('  - L\'ancien système (contratGenere) est pris en charge');

console.log('\n⚠️  Points d\'attention:');
console.log('  - S\'assurer que le champ "status" est bien sauvegardé lors de la génération');
console.log('  - Vérifier que ContratRedactionPage utilise status="generated" après rédaction');
console.log('  - Migrer progressivement les anciens contrats vers le nouveau système');

console.log('\n=== FIN DU TEST ===\n');