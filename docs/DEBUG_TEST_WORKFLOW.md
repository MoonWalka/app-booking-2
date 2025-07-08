# Guide de débogage - Workflow de test

## Modifications effectuées

J'ai ajouté plusieurs éléments de débogage dans le système de test pour identifier pourquoi les dates créées par le test n'apparaissent pas dans l'onglet dates.

### 1. Logs de débogage ajoutés

Dans `TestWorkflowButton.js`, j'ai ajouté :
- Log de l'entrepriseId utilisé lors de la création
- Log détaillé des données du concert créé
- Vérification immédiate après création pour voir si la date est visible dans la requête

### 2. Champs manquants ajoutés

J'ai identifié et ajouté des champs qui étaient potentiellement manquants :
- `lieuNom` : Le nom du lieu (utilisé dans l'affichage)
- `lieuVille` : La ville du lieu (utilisé dans l'affichage)

## Comment tester

1. **Ouvrez la console du navigateur** (F12 > Console)

2. **Créez un workflow de test** en cliquant sur le bouton "Test" dans la page de création de date

3. **Observez les logs dans la console** :
   - 🧪 Création du workflow de test...
   - 🏢 EntrepriseId utilisé: [ID]
   - ✅ Artiste créé: [ID]
   - ✅ Programmateur créé: [ID]
   - ✅ Lieu créé: [ID]
   - ✅ Concert créé: [ID]
   - 📊 Données du concert créé : { ... }
   - 🔍 Vérification de la visibilité de la date...
   - ✅ Date de test trouvée dans la requête ! OU ❌ Date de test NON trouvée

## Points à vérifier

1. **L'entrepriseId est-il correct ?**
   - Vérifiez que l'ID affiché dans les logs correspond à votre organisation actuelle

2. **Y a-t-il une erreur d'index ?**
   - Si vous voyez une erreur mentionnant "index", cela signifie qu'il manque un index composite dans Firestore
   - L'index requis est : `entrepriseId (ASC) + date (DESC)`

3. **La date est-elle au bon format ?**
   - Le format attendu est : `YYYY-MM-DD` (ex: "2025-02-03")

4. **La vérification trouve-t-elle la date ?**
   - Si oui (✅), le problème vient de l'affichage dans l'interface
   - Si non (❌), le problème vient de la création ou du filtrage

## Solutions possibles

### Si c'est un problème d'index :
1. Allez dans la console Firebase
2. Section Firestore > Index
3. Créez un index composite :
   - Collection : `concerts`
   - Champs : `entrepriseId (Ascendant)` + `date (Descendant)`

### Si la date n'est pas trouvée :
- Vérifiez manuellement dans Firestore que le document a bien été créé
- Vérifiez que tous les champs requis sont présents

## Prochaines étapes

Une fois que vous avez testé, partagez-moi :
1. Les logs de la console
2. Si la vérification trouve la date ou non
3. Toute erreur qui apparaît

Cela me permettra d'identifier précisément le problème et de le corriger.