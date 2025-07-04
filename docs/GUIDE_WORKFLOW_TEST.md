# Guide du Système de Test Automatisé

## 🎯 Objectif

Ce système permet de tester rapidement le workflow complet de l'application sans avoir à saisir manuellement toutes les données à chaque fois.

## ✨ Fonctionnalités

### 1. Bouton "Test" sur la page de création de concert

**Emplacement**: En haut à droite de la page "Nouvelle Date de Concert"

**Actions disponibles**:
- **Créer workflow complet** : Génère automatiquement :
  - Un artiste fictif avec projet
  - Un programmateur (structure) fictif
  - Un lieu fictif
  - Un concert liant toutes ces entités
  - Un token de formulaire pour accéder au formulaire public
  
- **Nettoyer données test** : Supprime toutes les données marquées avec `isTest: true`

### 2. Bouton "Données de test" sur le formulaire public

**Emplacement**: En haut à droite du formulaire public (`/formulaire/[token]`)

**Action**: Remplit automatiquement tous les champs du formulaire avec des données fictives réalistes :
- Informations de structure (SIRET, adresse, etc.)
- Informations du signataire
- Numéro de TVA intracommunautaire

## 🚀 Workflow de test complet

1. **Créer le workflow de test**
   - Aller sur la page de création de concert
   - Cliquer sur le bouton "Test" → "Créer workflow complet"
   - Une notification apparaît avec le lien vers le formulaire

2. **Accéder au formulaire**
   - Cliquer sur le lien dans la notification
   - Ou copier l'URL du formulaire : `/formulaire/[token]`

3. **Remplir automatiquement le formulaire**
   - Sur la page du formulaire, cliquer sur "Données de test"
   - Tous les champs se remplissent automatiquement

4. **Soumettre le formulaire**
   - Vérifier/ajuster les données si nécessaire
   - Cliquer sur "Soumettre"

5. **Valider les données**
   - Accéder à l'interface de validation
   - Tester le processus de validation champ par champ

6. **Nettoyer après les tests**
   - Retourner sur la page de création de concert
   - Cliquer sur "Test" → "Nettoyer données test"

## 🏷️ Identification des données de test

Toutes les données de test sont marquées avec :
- Un préfixe `[TEST]` dans les noms
- Un flag `isTest: true` dans la base de données
- Des tags incluant `"test"`

## ⚠️ Notes importantes

- **Environnement**: Les boutons de test n'apparaissent qu'en mode développement
- **Sécurité**: Ne jamais déployer en production avec `NODE_ENV=development`
- **Nettoyage**: Toujours nettoyer les données de test après utilisation

## 📝 Données générées

### Artiste
- Nom fictif
- Genre musical
- Projet avec dates
- Contact et biographie

### Programmateur (Structure)
- Raison sociale avec préfixe [TEST]
- SIRET valide (14 chiffres)
- Numéro TVA
- Adresse complète
- Contact principal avec fonction

### Lieu
- Nom de salle fictif
- Adresse complète
- Capacité et équipements
- Coordonnées GPS

### Concert
- Date dans le futur
- Associations avec artiste, lieu et programmateur
- Cachet et conditions financières
- Token unique pour le formulaire

## 🔧 Configuration

Le service utilise Faker.js configuré en français pour générer des données réalistes :
- Adresses françaises
- Numéros de téléphone français
- SIRET et TVA au format français

## 💡 Conseils d'utilisation

1. **Tests répétés** : Créez plusieurs workflows pour tester différents scénarios
2. **Personnalisation** : Les données générées peuvent être modifiées avant soumission
3. **Nettoyage régulier** : Nettoyez les données de test pour éviter l'encombrement
4. **Vérification** : Les données de test apparaissent dans les listes avec le préfixe [TEST]