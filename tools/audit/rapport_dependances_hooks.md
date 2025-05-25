# 🔍 AUDIT DES DÉPENDANCES ENTRE HOOKS TOURCRAFT
*Généré le: 25/05/2025 à 05:04*

## 📊 RÉSUMÉ EXÉCUTIF
- **Total hooks analysés**: 82
- **Hooks utilisant des génériques**: 32
- **Candidats haute priorité**: 0
- **Candidats moyenne priorité**: 0
- **Dépendances identifiées**: 48

## 🏗️ ANALYSE PAR DOMAINE
### ARTISTES
- **Total hooks**: 7
- **Adoption génériques**: 5/7 (71.4%)
- **Hooks dépréciés**: 0
- **Hooks wrappers**: 0
- **Complexité moyenne**: 34.0
- **Patterns identifiés**:
  - delete: 2 hooks
  - search: 2 hooks
  - list: 2 hooks
  - details: 1 hooks
  - form: 1 hooks

### CONCERTS
- **Total hooks**: 14
- **Adoption génériques**: 3/14 (21.4%)
- **Hooks dépréciés**: 2
- **Hooks wrappers**: 0
- **Complexité moyenne**: 54.7
- **Patterns identifiés**:
  - search: 1 hooks
  - list: 2 hooks
  - details: 1 hooks
  - status: 1 hooks
  - form: 4 hooks
  - delete: 1 hooks

### CONTRATS
- **Total hooks**: 8
- **Adoption génériques**: 2/8 (25.0%)
- **Hooks dépréciés**: 0
- **Hooks wrappers**: 1
- **Complexité moyenne**: 47.9
- **Patterns identifiés**:
  - details: 1 hooks
  - form: 1 hooks

### LIEUX
- **Total hooks**: 7
- **Adoption génériques**: 5/7 (71.4%)
- **Hooks dépréciés**: 1
- **Hooks wrappers**: 0
- **Complexité moyenne**: 24.7
- **Patterns identifiés**:
  - list: 1 hooks
  - search: 2 hooks
  - details: 1 hooks
  - form: 1 hooks
  - delete: 1 hooks

### PROGRAMMATEURS
- **Total hooks**: 10
- **Adoption génériques**: 4/10 (40.0%)
- **Hooks dépréciés**: 3
- **Hooks wrappers**: 0
- **Complexité moyenne**: 31.1
- **Patterns identifiés**:
  - delete: 1 hooks
  - search: 5 hooks
  - form: 2 hooks
  - details: 1 hooks

### STRUCTURES
- **Total hooks**: 4
- **Adoption génériques**: 3/4 (75.0%)
- **Hooks dépréciés**: 0
- **Hooks wrappers**: 0
- **Complexité moyenne**: 32.5
- **Patterns identifiés**:
  - details: 1 hooks
  - form: 1 hooks
  - delete: 1 hooks

## 🎯 CANDIDATS À LA GÉNÉRALISATION
### ⚡ HAUTE PRIORITÉ
*Aucun candidat haute priorité identifié*

### 📊 MOYENNE PRIORITÉ
*Aucun candidat moyenne priorité identifié*

## ✅ HOOKS DÉJÀ MIGRÉS VERS LES GÉNÉRIQUES
- **useConcertDetails** (concerts) - 850 lignes
- **useConcertForm** (concerts) - 295 lignes
- **useConcertDelete** (concerts) - 116 lignes
- **useStructureDetails** (structures) - 177 lignes
- **useStructureForm** (structures) - 211 lignes
- **useDeleteStructure** (structures) - 127 lignes
- **useLieuxFilters** (lieux) - 144 lignes
- **useLieuDetails** (lieux) - 191 lignes
- **useLieuSearch** (lieux) - 107 lignes
- **useLieuForm** (lieux) - 111 lignes
- **useLieuDelete** (lieux) - 121 lignes
- **useDeleteProgrammateur** (programmateurs) - 86 lignes
- **useProgrammateurForm** (programmateurs) - 263 lignes
- **useProgrammateurSearch** (programmateurs) - 248 lignes
- **useProgrammateurDetails** (programmateurs) - 190 lignes
- **useConcertSearch** (search) - 88 lignes
- **useLieuSearch** (search) - 28 lignes
- **useStructureSearch** (search) - 66 lignes
- **useArtisteSearch** (search) - 65 lignes
- **useGenericEntityDetails** (common) - 1038 lignes
- **useGenericEntityDelete** (common) - 277 lignes
- **useGenericEntityForm** (common) - 381 lignes
- **useGenericEntityList** (common) - 320 lignes
- **useGenericEntitySearch** (common) - 295 lignes
- **useContratDetails** (contrats) - 190 lignes
- **useContratForm** (contrats) - 13 lignes
- **useArtisteDetails** (artistes) - 293 lignes
- **useArtisteForm** (artistes) - 195 lignes
- **useArtisteSearch** (artistes) - 130 lignes
- **useDeleteArtiste** (artistes) - 127 lignes
- **useArtistesList** (artistes) - 163 lignes
- **useEntrepriseForm** (parametres) - 146 lignes

## 🔗 DÉPENDANCES CRITIQUES
- **concerts/useConcertDetails**: 4 dépendances
  - concerts/useConcertFormsManagement
  - concerts/useConcertAssociations
  - concerts/useConcertStatus
  - common

## 💡 RECOMMANDATIONS
### 🚨 PRIORITÉ CRITIQUE
- **Taux d'adoption des génériques**: 39.0% (objectif: >80%)
- **Action**: Accélérer la migration vers les hooks génériques
### 📋 PLAN D'ACTION SUGGÉRÉ
1. **Documentation des dépendances**: Créer une cartographie détaillée
2. **Migration progressive**: Commencer par les hooks haute priorité
3. **Standardisation**: Établir des patterns clairs pour chaque type
4. **Tests**: Assurer la couverture des hooks migrés
5. **Formation**: Sensibiliser l'équipe aux hooks génériques
## ✅ ÉVALUATION DE FAISABILITÉ
### 🟢 FAISABILITÉ ÉLEVÉE
- **0 hooks** à migrer (charge raisonnable)
- **32 hooks** déjà migrés (base solide)
- **Estimation**: 2-3 semaines de travail