# Environnement de test CSS - TourCraft

Cet environnement permet de tester les modifications CSS sans affecter l'application principale.

## Démarrage

Pour lancer l'application en mode test CSS :

```bash
npm run start:test-css
```

## Fonctionnalités disponibles

1. **Page de test CSS** : Accessible à l'URL `/test-style`
2. **Indicateurs visuels** :
   - Bannière de mode test en bas de l'écran
   - Surbrillance des éléments avec styles inline
   - Grille visuelle pour aligner les éléments
3. **Outils de correction** :
   - `npm run css:fix` pour standardiser les variables CSS
   - `npm run bootstrap:fix` pour corriger les classes Bootstrap

## Comment utiliser

1. Accédez à `/test-style` pour voir la page de démonstration des composants
2. Utilisez les boutons "Afficher la grille" et "Activer le mode test" pour vérifier les alignements
3. Naviguez dans l'application pour voir les indicateurs visuels sur toutes les pages
4. Effectuez vos corrections CSS
5. Vérifiez les changements en rechargeant l'application

## Restauration

Pour revenir à l'environnement normal, utilisez :

```bash
npm start
```

Une sauvegarde des fichiers modifiés a été créée dans le dossier `dev_mode_backup_20250517_035801`.
