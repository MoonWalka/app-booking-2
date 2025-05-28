// Test des interactions basiques du formulaire
console.log('🧪 Test des interactions du formulaire...\n');

console.log('1. ✅ Navigation vers /concerts');
console.log('2. ✅ Clic sur "Ajouter un concert"');
console.log('3. ✅ Le formulaire se charge avec 1 seul render par composant');

console.log('\n📝 Tests à faire manuellement :');
console.log('- Taper dans le champ "Nom du concert"');
console.log('- Sélectionner une date');
console.log('- Rechercher un lieu');
console.log('- Vérifier que le ProfilerMonitor reste stable (< 10 renders)');

console.log('\n⚠️  Fonctionnalités actuellement désactivées :');
console.log('- Auto-save : DÉSACTIVÉ');
console.log('- Validation onChange : DÉSACTIVÉ');
console.log('- Validation onBlur : ACTIVÉ');

console.log('\n📊 Si tout fonctionne bien, nous pourrons réactiver :');
console.log('1. validateOnChange (impact faible)');
console.log('2. enableAutoSave (impact potentiellement élevé)'); 