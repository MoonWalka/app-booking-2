# Rapport de Nettoyage des Fichiers
Date : 6 Janvier 2025

## Résumé

Votre projet contient de nombreux fichiers obsolètes ou non utilisés qui peuvent être supprimés pour améliorer la maintenabilité.

## 1. Suppressions Prioritaires (357+ MB)

### Dossier minimal/ (357 MB)
```bash
rm -rf minimal/
```
Ce dossier contient un projet Node.js complet avec node_modules qui n'a rien à faire ici.

### Backups obsolètes
```bash
rm -rf tools/logs/backup/
rm src/styles/base/colors-original-backup-20250531-151010.css
```

## 2. Scripts de Migration à Archiver

Ces scripts ont été utilisés pour des migrations ponctuelles et peuvent être archivés :

```bash
mkdir -p ../archives/migration-scripts
mv src/scripts/migration-concerts-dates-browser.js ../archives/migration-scripts/
mv src/scripts/migrateToMultiOrg.js ../archives/migration-scripts/
mv src/scripts/migrateParametresToOrganization.js ../archives/migration-scripts/
mv src/utils/migrationHelper.js ../archives/migration-scripts/
mv src/utils/fixArtistesOrganizationIds.js ../archives/migration-scripts/
```

## 3. Services de Test Non Utilisés

Les services de test peuvent être supprimés si vous n'utilisez pas TestDataButton :

```bash
# Vérifier d'abord si TestDataButton est utilisé
grep -r "TestDataButton" src/

# Si non utilisé, supprimer :
rm src/services/testDataService.js
rm src/services/testDataServiceSimple.js
rm src/components/debug/TestDataButton.js
```

## 4. Fichiers CSS Non Utilisés

Il y a de nombreux fichiers .module.css qui ne sont pas importés. Voici un script pour les identifier :

```bash
# Créer une liste des CSS non utilisés
for css in $(find src -name "*.module.css"); do
  basename_css=$(basename "$css")
  if ! grep -r "$basename_css" src --include="*.js" --include="*.jsx" -q; then
    echo "$css"
  fi
done > unused-css-files.txt
```

## 5. Composants de Debug à Réviser

Certains composants de debug sont peut-être obsolètes :
- FestitestContactFinder.js
- SophieMadetMigration.js  
- CleanOldContractContent.js

## 6. Tests Non Exécutés

```bash
# Vérifier si les tests sont configurés
ls src/__tests__/
ls src/components/parametres/__tests__/
ls src/services/__tests__/
```

## 7. Utilitaires Non Importés

Ces fichiers utils ne sont importés nulle part :
- datesDiagnostic.js
- debugTagsComments.js
- FirebaseInterceptor.js
- numberToWords.js
- cryptoUtils.js

```bash
# Vérifier avant suppression
grep -r "datesDiagnostic" src/
grep -r "debugTagsComments" src/
grep -r "FirebaseInterceptor" src/
grep -r "numberToWords" src/
grep -r "cryptoUtils" src/
```

## Actions Recommandées

### Immédiat (gain : ~360 MB)
1. ✅ Supprimer `minimal/`
2. ✅ Supprimer les backups dans `tools/logs/backup/`
3. ✅ Supprimer le CSS de backup

### Court terme
1. 📁 Archiver les scripts de migration
2. 🧹 Nettoyer les services de test non utilisés
3. 🎨 Supprimer les CSS non importés

### Moyen terme
1. 🔍 Réviser les composants de debug
2. 🧪 Décider du sort des tests non exécutés
3. 🔧 Nettoyer les utilitaires non utilisés

## Script de Nettoyage Rapide

```bash
#!/bin/bash
# Sauvegarde d'abord !
echo "⚠️  Assurez-vous d'avoir un backup complet !"
read -p "Continuer ? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Suppression du gros dossier
  echo "🗑️  Suppression de minimal/..."
  rm -rf minimal/
  
  # Suppression des backups
  echo "🗑️  Suppression des backups..."
  rm -rf tools/logs/backup/
  rm -f src/styles/base/colors-original-backup-*.css
  
  echo "✅ Nettoyage terminé !"
  echo "💾 Espace libéré : ~360 MB"
fi
```

## Conclusion

Le nettoyage de ces fichiers vous permettra de :
- 📉 Réduire la taille du projet de ~360 MB
- 🚀 Accélérer les builds et déploiements
- 🧹 Améliorer la maintenabilité
- 📚 Clarifier la structure du projet

Commencez par les suppressions prioritaires qui sont sans risque, puis procédez progressivement pour les autres éléments.