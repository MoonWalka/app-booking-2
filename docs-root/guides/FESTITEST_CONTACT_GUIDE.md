# Guide de recherche et création du contact "festitest"

## 🎯 Objectif
Trouver les métadonnées du contact nommé "festitest" dans la base de données Firebase pour les tests de refactoring de l'interface structure/contact.

## 📋 Structure des contacts dans TourCraft

### Collections Firebase
Les contacts peuvent être stockés dans deux types de collections :
- `contacts` : Collection principale (ancienne structure)
- `contacts_org_{entrepriseId}` : Collections organisationnelles (nouvelle structure multi-organisation)

### Champs de métadonnées typiques
```javascript
{
  // Informations de base
  id: "document_id",
  nom: "Nom du contact",
  prenom: "Prénom du contact", 
  nomLowercase: "nom en minuscules",
  prenomLowercase: "prenom en minuscules",
  email: "email@example.com",
  telephone: "+33 1 23 45 67 89",
  
  // Adresse
  adresse: "123 Rue Example",
  codePostal: "75001",
  ville: "Paris",
  pays: "France",
  
  // Métadonnées organisationnelles
  entrepriseId: "org_id",
  
  // Relations bidirectionnelles
  structureId: "structure_id_associée",
  structureNom: "Nom de la structure",
  structureRaisonSociale: "Raison sociale",
  lieuxIds: ["lieu_id_1", "lieu_id_2"], // Array des lieux associés
  concertsIds: ["concert_id_1", "concert_id_2"], // Array des concerts associés
  artistesIds: ["artiste_id_1"], // Array des artistes associés
  
  // Métadonnées festivalières
  nomFestival: "Nom du festival",
  periodeFestivalMois: "juin",
  periodeFestivalComplete: "15-25 juin 2025",
  bouclage: "2025-03-15",
  
  // Classification
  tags: ["tag1", "tag2"],
  source: "Source du contact",
  fonction: "Fonction dans la structure",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Notes
  notes: "Notes libres"
}
```

## 🔍 Méthodes de recherche disponibles

### 1. Via l'interface de debug (Recommandé)
1. Accédez à `/debug-tools` dans l'application
2. Cliquez sur l'onglet "🔍 Recherche Contact Festitest"
3. Le composant recherchera automatiquement le contact dans toutes les collections

### 2. Via la console du navigateur
```javascript
// Charger le script de recherche
const script = document.createElement('script');
script.src = './search-festitest-browser.js';
document.head.appendChild(script);

// Ou exécuter directement la recherche
window.searchFestitest();
```

### 3. Via les outils de développement
Exécutez dans la console :
```javascript
// Import des services Firebase
const { db, collection, query, where, getDocs } = await import('./src/services/firebase-service.js');

// Recherche simple
const q = query(collection(db, 'contacts'), where('nom', '==', 'festitest'));
const snapshot = await getDocs(q);
snapshot.forEach(doc => {
  console.log('Contact trouvé:', doc.id, doc.data());
});
```

## 🛠️ Création du contact de test

Si le contact "festitest" n'existe pas, vous pouvez le créer :

### Via la console du navigateur
```javascript
// Charger le script de création
const script = document.createElement('script');
script.src = './create-festitest-contact.js';
document.head.appendChild(script);

// Créer le contact
await window.createFestitestContactNow();
```

### Via l'interface utilisateur
1. Accédez à `/contacts/nouveau`
2. Remplissez le formulaire avec :
   - **Nom** : festitest
   - **Prénom** : Test
   - **Email** : festitest@example.com
   - **Autres champs** selon vos besoins de test

## 📁 Fichiers créés pour vous aider

1. **`search-contact-festitest.js`** : Script Node.js pour recherche en ligne de commande
2. **`search-festitest-browser.js`** : Script pour exécution dans le navigateur
3. **`src/components/debug/FestitestContactFinder.js`** : Composant React intégré aux outils de debug
4. **`create-festitest-contact.js`** : Script pour créer un contact de test complet

## 🏗️ Structure organisationnelle

L'application utilise un système multi-organisation où :
- Chaque organisation a ses propres collections : `{collection}_org_{entrepriseId}`
- Les contacts peuvent être dans `contacts` (global) ou `contacts_org_123` (organisationnel)
- L'ID d'organisation est stocké dans `entrepriseId`

## 🔄 Relations bidirectionnelles

Les contacts maintiennent des relations avec :
- **Structures** : via `structureId` (1:1)
- **Lieux** : via `lieuxIds` (1:N)
- **Concerts** : via `concertsIds` (1:N)
- **Artistes** : via `artistesIds` (1:N)

## 💡 Conseils pour le refactoring

1. **Vérifiez la cohérence** : Assurez-vous que les relations bidirectionnelles sont correctes
2. **Testez les deux structures** : Collections globales vs organisationnelles
3. **Validez les métadonnées** : Tous les champs attendus sont présents
4. **Testez les migrations** : Anciens formats vs nouveaux formats

## 🚀 Étapes suivantes

1. Utilisez l'outil de debug pour trouver le contact "festitest"
2. Analysez sa structure de métadonnées
3. Utilisez ces informations pour vos tests de refactoring
4. Modifiez le contact via `/contacts/{id}/edit` si nécessaire

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que vous êtes connecté à l'application
2. Vérifiez qu'une organisation est sélectionnée
3. Consultez la console du navigateur pour les erreurs
4. Utilisez les outils de debug intégrés

Bonne chance avec votre refactoring de l'interface structure/contact ! 🎉