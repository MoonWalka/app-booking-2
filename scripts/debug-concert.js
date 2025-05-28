// Script simple pour déboguer la structure d'un concert
console.log('🔍 Script de débogage des concerts');

// Simuler la structure d'un concert typique
const concertExample = {
  id: "example-concert-id",
  titre: "Concert Test",
  date: { seconds: 1640995200, nanoseconds: 0 },
  montant: 1500,
  statut: "contact",
  // Champs possibles pour les entités liées :
  lieuId: "lieu-id-123",           // ← Attendu par le hook
  programmateurId: "prog-id-456",  // ← Attendu par le hook
  artisteId: "artiste-id-789",     // ← Attendu par le hook
  structureId: "structure-id-abc", // ← Attendu par le hook
  
  // Ou peut-être d'autres noms ?
  lieu: "lieu-id-123",             // ← Nom alternatif possible
  programmateur: "prog-id-456",    // ← Nom alternatif possible
  artiste: "artiste-id-789",       // ← Nom alternatif possible
  structure: "structure-id-abc",   // ← Nom alternatif possible
  
  // Ou peut-être des objets complets ?
  lieuData: { id: "lieu-id-123", nom: "Salle de concert" },
  programmateurData: { id: "prog-id-456", nom: "Jean Dupont" }
};

console.log('📋 Structure de concert attendue :');
console.log(JSON.stringify(concertExample, null, 2));

console.log('\n🔍 Vérification des champs attendus par le hook :');
console.log(`lieuId: ${concertExample.lieuId ? '✅ Présent' : '❌ Absent'}`);
console.log(`programmateurId: ${concertExample.programmateurId ? '✅ Présent' : '❌ Absent'}`);
console.log(`artisteId: ${concertExample.artisteId ? '✅ Présent' : '❌ Absent'}`);
console.log(`structureId: ${concertExample.structureId ? '✅ Présent' : '❌ Absent'}`);

console.log('\n🔍 Vérification des noms alternatifs :');
console.log(`lieu: ${concertExample.lieu ? '✅ Présent' : '❌ Absent'}`);
console.log(`programmateur: ${concertExample.programmateur ? '✅ Présent' : '❌ Absent'}`);
console.log(`artiste: ${concertExample.artiste ? '✅ Présent' : '❌ Absent'}`);
console.log(`structure: ${concertExample.structure ? '✅ Présent' : '❌ Absent'}`);

console.log('\n✅ Script terminé'); 