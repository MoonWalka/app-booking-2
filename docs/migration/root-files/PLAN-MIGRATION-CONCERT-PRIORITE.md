# Plan de Migration "concert" → "date" par Priorité

## Vue d'Ensemble
- **132 fichiers** contiennent des références à "concert"
- **903 occurrences** totales à migrer
- **20 références** directes à la collection Firebase 'concerts'

## Priorité 1 : CRITIQUE - Collection Firebase (5 fichiers)

### 1.1 Création de données
- **src/pages/DateCreationPage.js**
  - Ligne ~234: `// Créer le document date dans la collection concerts`
  - Action: Changer la collection cible de 'concerts' à 'dates'
  - Impact: Toutes les nouvelles dates seront créées dans la bonne collection

### 1.2 Relations bidirectionnelles
- **src/hooks/common/useSafeRelations.js**
  - Multiple références aux relations avec 'concerts'
  - Relations artistes ↔ concerts
  - Relations lieux ↔ concerts
  - Relations structures ↔ concerts
  - Action: Migrer toutes les relations vers 'dates'

### 1.3 Hooks de suppression
- **src/hooks/lieux/useLieuDelete.js**
  - Vérifie les références dans la collection 'concerts'
- **src/hooks/artistes/useDeleteArtiste.js**
  - Vérifie les références dans la collection 'concerts'
- **src/hooks/contrats/useContratDetails.js**
  - Récupère les données depuis 'concerts'

## Priorité 2 : ÉLEVÉE - Variables et Propriétés Fréquentes (10 fichiers)

### 2.1 Fichiers avec le plus d'occurrences
1. **src/hooks/contrats/useContratGenerator.js** (49 occurrences)
   - Commentaires et documentation principalement
   - Variables: concert, concertData
   
2. **src/components/debug/EntityCreationTester.js** (45 occurrences)
   - Outil de test pour la création d'entités
   
3. **src/pages/ContratRedactionPage.js** (39 occurrences)
   - Gestion des contrats liés aux concerts
   
4. **src/components/debug/EntityRelationsDebugger.js** (38 occurrences)
   - Debug des relations entre entités

5. **src/hooks/contacts/useSimpleContactDetails.js** (32 occurrences)
   - Récupération des concerts liés à un contact

## Priorité 3 : MOYENNE - Navigation et Routes (8 occurrences)

### Routes à migrer
- `/concerts` → `/dates` dans :
  - src/components/contacts/mobile/ContactView.js
  - src/components/common/RelationCard.js
  - src/pages/InventairePagesPage.js
  - src/pages/ContratGenerationPage.js
  - src/pages/FormResponsePage.js (2 occurrences)
  - src/App.js (déjà une redirection en place)

## Priorité 4 : BASSE - Propriétés d'Objets (170 occurrences)

### Patterns principaux
- `.concert` (79 occurrences) - Propriété d'objet
- `.concerts` (91 occurrences) - Propriété tableau
- `concertsIds` (68 occurrences) - IDs pour relations
- `concertsAssocies` (48 occurrences) - Concerts associés

## Stratégie de Migration

### Phase 1 : Préparation (1 jour)
1. Créer un script de migration Firebase pour copier 'concerts' → 'dates'
2. Mettre en place un système de double-écriture temporaire
3. Sauvegarder la base de données actuelle

### Phase 2 : Migration Collection (1 jour)
1. Migrer DateCreationPage.js pour créer dans 'dates'
2. Adapter useSafeRelations.js pour gérer les deux collections
3. Mettre à jour les hooks de suppression et de détails

### Phase 3 : Migration Code (3-5 jours)
1. Commencer par les fichiers critiques (Priorité 1)
2. Migrer progressivement les autres fichiers par module
3. Tester chaque module après migration

### Phase 4 : Nettoyage (1 jour)
1. Supprimer le système de double-écriture
2. Nettoyer les redirections temporaires
3. Archiver l'ancienne collection 'concerts'

## Scripts Utiles

### Recherche rapide
```bash
# Trouver toutes les références à la collection
grep -r "collection.*concerts" src --include="*.js"

# Trouver les propriétés .concert
grep -r "\.concert[^s]" src --include="*.js"

# Trouver les routes
grep -r "/concert" src --include="*.js"
```

### Remplacement semi-automatique
```bash
# Remplacer collection('concerts') par collection('dates')
sed -i '' "s/collection('concerts')/collection('dates')/g" fichier.js

# Remplacer .concert par .date (avec précaution)
sed -i '' 's/\.concert\([^s]\)/\.date\1/g' fichier.js
```

## Points de Vigilance

1. **Relations bidirectionnelles** : S'assurer que toutes les références inverses sont mises à jour
2. **Cache et état local** : Vider les caches après migration
3. **Tests** : Tester particulièrement :
   - Création de nouvelles dates
   - Affichage des listes
   - Relations entre entités
   - Génération de contrats
4. **Documentation** : Mettre à jour toute la documentation technique