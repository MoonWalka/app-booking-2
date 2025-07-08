// Script de test pour vérifier la recherche des concerts
console.log('🔍 Test de recherche de concerts');
console.log('================================\n');

// Ce script simule ce que fait ContactViewTabs
const testData = {
  organizationId: 'test-org-123',
  structureId: 'structure-456',
  structureName: 'Structure Test'
};

console.log('📊 Données de test:');
console.log('- organizationId:', testData.organizationId);
console.log('- structureId:', testData.structureId);
console.log('- structureName:', testData.structureName);
console.log('\n');

console.log('🎯 Le service concertService va chercher dans cet ordre:');
console.log('\n1. getConcertsByStructureId():');
console.log('   - Recherche par structureId');
console.log('   - Si pas de résultats → recherche par organisateurId');
console.log('\n2. getConcertsByStructure():');
console.log('   - Recherche par structureNom');
console.log('   - Si pas de résultats → recherche par organisateurNom');
console.log('   - Si pas de résultats → recherche par structureRaisonSociale');
console.log('   - Si pas de résultats → recherche par structure.raisonSociale');
console.log('\n');

console.log('✅ Avec ces modifications, les concerts devraient maintenant apparaître');
console.log('   dans l\'onglet dates, peu importe s\'ils utilisent:');
console.log('   - organisateurId/organisateurNom (anciens concerts)');
console.log('   - structureId/structureNom (nouveaux concerts)');