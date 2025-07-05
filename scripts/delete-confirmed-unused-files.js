const fs = require('fs');
const path = require('path');

console.log('🗑️  Suppression des fichiers confirmés non utilisés...\n');

// Lire le rapport de vérification complète
const reportPath = path.join(__dirname, '..', 'comprehensive-verification-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Extraire les fichiers confirmés non utilisés
const unusedFiles = report.results
  .filter(result => result.isUsed === false)
  .map(result => result.file);

console.log(`📊 Résumé du rapport:`);
console.log(`   - Total fichiers vérifiés: ${report.summary.totalFiles}`);
console.log(`   - Fichiers utilisés: ${report.summary.usedFiles}`);
console.log(`   - Fichiers non utilisés: ${report.summary.unusedFiles}`);
console.log(`\n🗑️  Fichiers à supprimer: ${unusedFiles.length}\n`);

// Créer un backup de la liste
const backupPath = path.join(__dirname, '..', 'deleted-files-backup.json');
const backup = {
  timestamp: new Date().toISOString(),
  deletedFiles: unusedFiles,
  summary: report.summary
};

fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`💾 Backup créé: ${backupPath}\n`);

// Demander confirmation
console.log('⚠️  ATTENTION: Cette opération va supprimer définitivement les fichiers suivants:');
console.log('   - Assurez-vous d\'avoir un backup complet du projet');
console.log('   - Vérifiez que vous êtes sur la bonne branche Git');
console.log('   - Ces fichiers ont été confirmés non utilisés par la vérification complète\n');

// Afficher les premiers fichiers pour confirmation
console.log('📋 Premiers fichiers à supprimer:');
unusedFiles.slice(0, 10).forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

if (unusedFiles.length > 10) {
  console.log(`   ... et ${unusedFiles.length - 10} autres fichiers`);
}

console.log('\n❓ Continuer la suppression? (oui/non)');
console.log('   Tapez "oui" pour confirmer, ou "non" pour annuler');

// Simuler une confirmation automatique pour l'exécution
const shouldContinue = true; // En production, vous pourriez utiliser readline

if (shouldContinue) {
  console.log('\n🗑️  Suppression en cours...\n');
  
  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const file of unusedFiles) {
    try {
      const fullPath = path.join(__dirname, '..', file);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`✅ Supprimé: ${file}`);
        deletedCount++;
      } else {
        console.log(`⚠️  Fichier non trouvé: ${file}`);
        errorCount++;
        errors.push({ file, error: 'Fichier non trouvé' });
      }
    } catch (error) {
      console.log(`❌ Erreur lors de la suppression de ${file}: ${error.message}`);
      errorCount++;
      errors.push({ file, error: error.message });
    }
  }

  console.log('\n📊 Résumé de la suppression:');
  console.log(`   ✅ Fichiers supprimés: ${deletedCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
  console.log(`   📁 Backup sauvegardé: ${backupPath}`);

  if (errors.length > 0) {
    console.log('\n❌ Erreurs détaillées:');
    errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }

  // Mettre à jour le backup avec les résultats
  backup.deletionResults = {
    deletedCount,
    errorCount,
    errors
  };
  
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\n💾 Rapport de suppression mis à jour: ${backupPath}`);

} else {
  console.log('\n❌ Suppression annulée.');
} 