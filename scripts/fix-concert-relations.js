// Script pour corriger les relations manquantes dans les concerts
console.log('🔧 Script de correction des relations de concerts');

// Simuler la correction des concerts
const concertsToFix = [
  {
    id: "concert-1",
    titre: "Concert Test 1",
    // Problème : pas de lieuId ni programmateurId
    // Solution : ajouter ces champs
    lieuNom: "Salle de concert",
    programmateurNom: "Jean Dupont"
  },
  {
    id: "concert-2", 
    titre: "Concert Test 2",
    // Problème : champs avec d'autres noms
    lieu: "lieu-id-123",  // ← Devrait être lieuId
    programmateur: "prog-id-456"  // ← Devrait être programmateurId
  }
];

console.log('📋 Concerts à corriger :');
concertsToFix.forEach(concert => {
  console.log(`\n🎵 ${concert.titre} (${concert.id})`);
  
  // Vérifier les champs manquants
  const missingFields = [];
  if (!concert.lieuId && !concert.lieu) missingFields.push('lieuId');
  if (!concert.programmateurId && !concert.programmateur) missingFields.push('programmateurId');
  
  if (missingFields.length > 0) {
    console.log(`   ❌ Champs manquants: ${missingFields.join(', ')}`);
  } else {
    console.log(`   ✅ Relations OK`);
  }
  
  // Proposer des corrections
  if (concert.lieu && !concert.lieuId) {
    console.log(`   🔧 Correction: lieu → lieuId`);
  }
  if (concert.programmateur && !concert.programmateurId) {
    console.log(`   🔧 Correction: programmateur → programmateurId`);
  }
});

console.log('\n✅ Analyse terminée');
console.log('\n💡 Solutions possibles :');
console.log('1. Migrer les champs lieu → lieuId et programmateur → programmateurId');
console.log('2. Créer les entités manquantes et assigner les IDs');
console.log('3. Mettre à jour la configuration du hook pour supporter les anciens noms'); 