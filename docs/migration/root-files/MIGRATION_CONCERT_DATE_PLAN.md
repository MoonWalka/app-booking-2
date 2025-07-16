# Plan de Migration Concert → Date - COMPLET

Date: 2025-07-08
Statut: À EXÉCUTER

## Vue d'ensemble

- **Total occurrences**: 531 dans 120 fichiers
- **Temps estimé**: 2-3 jours
- **Risque**: ÉLEVÉ - Système central de l'application

## Phase 0: Préparation (1 heure)

### 0.1 Backup et Sécurité
- [ ] Backup complet de la base de données Firebase
- [ ] Créer une branche git `migration-concert-date-final`
- [ ] Documenter l'état actuel avec l'audit

### 0.2 Vérification des types
- [ ] Identifier les usages de 'Concert' comme type d'événement (NE PAS MODIFIER)
- [ ] Lister les énumérations contenant 'Concert'
- [ ] Marquer les textes UI mentionnant "concert"

## Phase 1: Collections Firebase (2 heures)

### 1.1 Migration des collections
- [ ] Créer un script de migration Firebase avec mode dry-run
- [ ] Migrer la collection `concerts` → `dates`
- [ ] Mettre à jour les index et règles de sécurité

### 1.2 Fichiers critiques à modifier
```javascript
// Collections à modifier dans ces fichiers:
- src/components/debug/TestWorkflowButton.js
- src/components/debug/OrganizationIdDebug.js
- src/components/debug/ContactsMigrationFinal.js
- src/components/debug/FestitestContactFinder.js
- src/pages/DateCreationPage.js (ligne 571)
```

## Phase 2: Propriétés d'objets (3 heures)

### 2.1 Renommages globaux
- [ ] `concertsAssocies` → `datesAssociees`
- [ ] `concertsIds` → `datesIds`
- [ ] `concertId` → `dateId`

### 2.2 Fichiers prioritaires
```javascript
// Top fichiers avec concertsAssocies:
- src/components/structures/desktop/StructureForm.js
- src/components/contacts/sections/ContactDatesSection.js
- src/components/contacts/mobile/ContactView.js
- src/components/artistes/desktop/ArtisteView.js
```

## Phase 3: Variables et fonctions (4 heures)

### 3.1 Variables dans les boucles
- [ ] `.map((concert` → `.map((date`
- [ ] `.forEach((concert` → `.forEach((date`
- [ ] `const concert =` → `const date =`
- [ ] `let concert =` → `let date =`

### 3.2 Noms de fonctions
- [ ] Fonctions contenant 'concert' dans le nom
- [ ] Paramètres de fonctions
- [ ] Retours de fonctions

## Phase 4: Imports et Hooks (2 heures)

### 4.1 Hooks à migrer
- [ ] `useConcertDetails` → `useDateDetails` (si existe)
- [ ] Hooks utilisant 'concert' dans les queries

### 4.2 Services et utilitaires
- [ ] Services mentionnant 'concert'
- [ ] Fonctions utilitaires

## Phase 5: UI et Textes (2 heures)

### 5.1 Composants UI
- [ ] Titres de sections : "Concerts" → "Dates"
- [ ] Labels de formulaires
- [ ] Messages d'erreur et de succès
- [ ] Tooltips et aide contextuelle

### 5.2 Routes et navigation
- [ ] `/concerts` → `/dates` (si pas déjà fait)
- [ ] Liens de navigation
- [ ] Breadcrumbs

## Phase 6: Tests et Validation (3 heures)

### 6.1 Tests fonctionnels
- [ ] Création d'une nouvelle date
- [ ] Modification d'une date existante
- [ ] Suppression d'une date
- [ ] Association avec artistes/lieux/contacts

### 6.2 Tests d'intégration
- [ ] Génération de contrats
- [ ] Génération de factures
- [ ] Envoi d'emails
- [ ] Export de données

### 6.3 Tests de régression
- [ ] Vérifier que les types d'événements fonctionnent
- [ ] Vérifier les filtres et recherches
- [ ] Vérifier les statistiques

## Script de migration automatique

```bash
#!/bin/bash
# migrate-concert-to-date.sh

# Mode dry-run par défaut
DRY_RUN=${1:-true}

if [ "$DRY_RUN" = "false" ]; then
    echo "⚠️  MODE RÉEL - Les modifications seront appliquées!"
    read -p "Êtes-vous sûr? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "🔍 MODE DRY-RUN - Aucune modification ne sera appliquée"
fi

# Phase 1: Collections
echo "Phase 1: Migration des collections..."
if [ "$DRY_RUN" = "true" ]; then
    grep -rn "collection.*concerts" src/ --include="*.js"
else
    find src -name "*.js" -exec sed -i '' 's/collection.*concerts/collection(db, "dates")/g' {} \;
fi

# Phase 2: Propriétés
echo "Phase 2: Migration des propriétés..."
if [ "$DRY_RUN" = "true" ]; then
    grep -rn "concertsAssocies\|concertsIds" src/ --include="*.js"
else
    find src -name "*.js" -exec sed -i '' 's/concertsAssocies/datesAssociees/g' {} \;
    find src -name "*.js" -exec sed -i '' 's/concertsIds/datesIds/g' {} \;
fi

# Continuer avec les autres phases...
```

## Points d'attention

### ⚠️ NE PAS MODIFIER
1. Les occurrences de 'Concert' comme type d'événement
2. Les valeurs d'énumération : `['Concert', 'Répétition', 'Résidence']`
3. Les textes affichés aux utilisateurs qui parlent de "concert"

### 🔍 À VÉRIFIER MANUELLEMENT
1. Les templates d'email mentionnant "concert"
2. Les PDFs générés (contrats, factures)
3. Les formulaires publics
4. Les intégrations tierces

## Checklist de validation finale

- [ ] Aucune erreur dans la console
- [ ] Tous les tests passent
- [ ] La création de dates fonctionne
- [ ] L'affichage des dates fonctionne
- [ ] Les associations fonctionnent
- [ ] Les contrats se génèrent correctement
- [ ] Les emails s'envoient correctement
- [ ] Le déploiement en production est prêt