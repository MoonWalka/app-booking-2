# Audit Migration Concert → Date

## Résumé Exécutif

⚠️ **MIGRATION INCOMPLÈTE** - La migration de "concert" vers "date" n'est complète qu'à environ **30%**. Une vérification exhaustive révèle qu'il reste **104 fichiers** contenant **555 occurrences** du terme "concert".

## État Réel de la Migration

### 1. Fichiers les plus impactés (Top 10) - APRÈS VÉRIFICATION
1. `ContratInfoCard.js` - 18 occurrences
2. `ContratDetailsPage.js` - 16 occurrences
3. `contractVariables.js` - 16 occurrences (variables de template)
4. `ContratGeneratorNew.js` - 16 occurrences
5. `BrevoTemplateCreator.js` - 15 occurrences
6. `StructureForm.js` - 13 occurrences
7. `ContratPDFWrapper.js` - 13 occurrences
8. `LieuxListSearchFilter.js` - 12 occurrences
9. `StructureView.js` - 11 occurrences
10. `DateLieuDebug.js` - 11 occurrences

### 2. Types de références trouvées
- **Variables de template** : `concert_titre`, `concert_date`, `concert_montant`, etc.
- **Props de composants** : `({ concert, lieu })` 
- **États React** : `const [concert, setDate] = useState(null)`
- **Commentaires et logs** : Nombreuses références dans les logs de debug
- **Variables locales** : Dans les hooks et services

### 3. Zones du code affectées

#### A. Variables de template contrat (contractVariables.js)
- `concert_titre` → devrait être `date_titre`
- `concert_date` → devrait être `date_date`
- `concert_montant` → devrait être `date_montant`
- `concert_montant_lettres` → devrait être `date_montant_lettres`
- Ces variables sont utilisées dans les templates de contrat et les emails

#### B. Composants de contrat
- `ContratInfoCard.js` - Utilise props `concert` pour l'affichage
- `ContratDetailsPage.js` - Gère l'état `concert`
- `ContratGeneratorNew.js` - Génère des contrats avec données `concert`
- `ContratPDFWrapper.js` - Génère les PDF avec variables `concert`

#### C. Services et hooks
- `brevoTemplateService.js` - Ligne 753: `nom: 'Festival Rock Démo 2025'` dans getDemoData()
- Nombreux hooks utilisent encore `concert` comme paramètre ou variable

#### D. Outils de debug
- `BrevoTemplateCreator.js` - 15 occurrences
- `DateLieuDebug.js` - 11 occurrences
- Plusieurs autres outils de debug avec références

### 4. Actions Requises pour Finaliser la Migration

#### Phase 1: Variables de template (contractVariables.js)
1. Migrer toutes les variables `concert_*` vers `date_*`
2. Mettre à jour les remplacements dans les fonctions de preview
3. Assurer la rétrocompatibilité temporaire si nécessaire

#### Phase 2: Composants principaux (18 fichiers critiques)
1. `ContratInfoCard.js` - Changer props `concert` → `date`
2. `ContratDetailsPage.js` - État et références
3. `ContratGeneratorNew.js` - Logique de génération
4. Les 15 autres fichiers avec >10 occurrences

#### Phase 3: Services et hooks
1. Mettre à jour tous les paramètres de fonction
2. Renommer les variables locales
3. Adapter les commentaires et logs

#### Phase 4: Nettoyage final
1. Outils de debug (peuvent rester temporairement)
2. Tests unitaires
3. Documentation

## Recommandations

1. **Prioriser** les variables de template dans `contractVariables.js` car elles impactent directement les contrats générés
2. **Migrer par lots** : Commencer par les 10 fichiers avec le plus d'occurrences
3. **Conserver temporairement** la rétrocompatibilité pour les variables de template
4. **Tester** systématiquement la génération de contrats après chaque modification

## Scripts utiles

```bash
# Compter les occurrences
rg -c "concert" --type js | awk -F: '{sum+=$2} END {print sum}'

# Trouver les collections Firebase
rg "collection.*concerts" --type js

# Identifier les variables
rg "\bconcert\b" --type js -C 2
```

## Clarification Importante

**"Concert" vs "concert"** : Il faut distinguer :
- **Collection "concerts"** → à migrer vers "dates" ✓
- **Type "Concert"** → à conserver comme type d'événement valide (avec Résidence, Répétition, etc.)

## Checklist de Migration

### ✅ Phase 0: Analyse et préparation
- [x] Audit complet des occurrences
- [x] Distinction concert (collection) vs Concert (type)
- [ ] Backup de la base de données

### ✅ Phase 1: Corrections critiques (Collection concerts → dates) - TERMINÉE
- [x] `DateCreationPage.js` - Ligne 571 : collection "concerts" → "dates" ✓
- [x] `useSafeRelations.js` - Toutes les références à la collection ✓
- [x] `useDeleteArtiste.js` - Vérification des dépendances ✓
- [x] `useLieuDelete.js` - Vérification des dépendances ✓
- [x] `useContratDetails.js` - Collection de référence ✓

### ✅ Phase 2: Variables et propriétés - TERMINÉE
- [x] Variables `concert` → `date` (quand il s'agit d'une date) ✓
- [x] Arrays `concerts` → `dates` ✓
- [x] Relations `concertsIds` → `datesIds` ✓
- [x] Associations `concertsAssocies` → `datesAssociees` ✓
- [x] Paramètres de fonctions ✓
- [x] Commentaires et documentation ✓

### ✅ Phase 3: Composants et hooks - TERMINÉE
- [x] `useContratGenerator.js` - 49 occurrences ✓
- [x] `ContratRedactionPage.js` - 39 occurrences ✓
- [x] `useSimpleContactDetails.js` - 32 occurrences ✓
- [x] `GenericDetailView.js` - 30 occurrences ✓
- [x] `FactureGeneratorPage.js` - 27 occurrences ✓
- [x] Services email (`emailService.js`, `brevoTemplateService.js`) ✓

### 🟢 Phase 4: Firebase et routes - EN COURS
- [x] Script de migration des données Firebase ✓
  - Créé: `scripts/firebase-migrate-concerts-to-dates.js`
  - Mode dry-run disponible
- [ ] Routes `/concerts` → `/dates`
- [ ] Permissions et règles de sécurité
- [ ] Redirections pour compatibilité

### 🔵 Phase 5: Tests et validation
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests manuels des workflows
- [ ] Validation des emails
- [ ] Validation des PDF générés

### ⚫ Phase 6: Nettoyage
- [ ] Fichiers de debug et test
- [ ] Scripts de migration temporaires
- [ ] Documentation obsolète
- [ ] Suppression de l'ancienne collection

## État de la Migration - 8 Juillet 2025

### ✅ Travail Accompli

1. **Phase 1 - Corrections critiques** : 100% terminée
   - Collection Firebase migrée dans le code
   - Relations bidirectionnelles mises à jour
   - Hooks de suppression adaptés

2. **Phase 2 - Variables et propriétés** : 100% terminée
   - Toutes les variables `concert` → `date`
   - Propriétés `concertsIds` → `datesIds`
   - Documentation mise à jour

3. **Phase 3 - Composants principaux** : 100% terminée
   - 6 fichiers majeurs migrés
   - Plus de 200 occurrences corrigées

4. **Phase 4 - Migration des 6 fichiers de production** : 100% terminée
   - PreContratGenerator.js (32 occurrences) ✓
   - ContactDatesSection.js (31 occurrences) ✓
   - useSimpleContactDetails.js (29 occurrences) ✓
   - ArtisteView.js mobile (27 occurrences) ✓
   - FormResponsePage.js (20 occurrences) ✓
   - ArtisteView.js desktop (20 occurrences) ✓

5. **Scripts créés** :
   - `scripts/migrate-concert-to-date-final.js` - Migration automatique du code
   - `scripts/firebase-migrate-concerts-to-dates.js` - Migration des données Firebase
   - `migrate-concert-date-dryrun.sh` - Script de migration avec mode dry-run

### ⚠️ Actions Restantes

1. **Exécuter la migration Firebase** :
   ```bash
   # Test en mode dry-run
   node scripts/firebase-migrate-concerts-to-dates.js --dry-run
   
   # Migration réelle
   node scripts/firebase-migrate-concerts-to-dates.js
   ```

2. **Mettre à jour les routes** dans le routeur React

3. **Adapter les règles de sécurité Firebase**

4. **Tester l'application complètement**

5. **Supprimer l'ancienne collection "concerts"** après validation

### 📊 Statistiques de Migration

- **Fichiers modifiés** : 21+
- **Occurrences remplacées** : ~559+ (159 occurrences dans les 6 fichiers de production)
- **Collections impactées** : concerts → dates
- **Relations mises à jour** : concertsIds → datesIds, concertsAssocies → datesAssociees
- **Fichiers de test supprimés** : 9 (réduisant significativement le nombre d'occurrences)

## Conclusion - 8 Juillet 2025 - ÉTAT RÉEL

⚠️ **MIGRATION INCOMPLÈTE** 

### Résumé de l'état actuel :

1. **Travail effectué** :
   - 6 fichiers de production migrés (159 occurrences) ✓
   - 9 fichiers de test/debug supprimés ✓
   - Script de migration créé ✓
   
2. **Travail restant** :
   - **104 fichiers** contenant encore "concert"
   - **555 occurrences** au total
   - Variables de template critiques dans `contractVariables.js`
   - Props et états dans les composants de contrat

### Estimation :
- **Progression réelle** : ~30% complété
- **Temps estimé pour finaliser** : 1-2 jours de travail
- **Priorité** : Variables de template et composants de contrat

### Prochaines étapes critiques :
1. Migrer `contractVariables.js` (impact direct sur les contrats)
2. Mettre à jour les 10 fichiers avec le plus d'occurrences
3. Tester la génération de contrats après chaque batch
4. Finaliser avec les fichiers restants