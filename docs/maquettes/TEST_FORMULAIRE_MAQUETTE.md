# Test Formulaire Contact Maquette - Guide Rapide

## Vérifications d'Affichage

### 1. Navigation vers le Formulaire
✅ **URL de test** : `http://localhost:3000/contacts/qW2CefuRsX7xjUB6MFSW/edit`

**Ce qui doit s'afficher** :
- Header avec dégradé bleu TourCraft
- Titre "Modifier Contact" avec icône
- 3 boutons : Enregistrer (vert), Annuler (gris), Supprimer (rouge)
- Fond de page gris clair

### 2. Sections Visibles
✅ **Sections attendues** (dans l'ordre) :

1. **Informations de contact**
   - Icône personne + titre
   - Formulaire 2 colonnes : Prénom*, Nom*, Email*, Téléphone
   - Champs adresse : Adresse, Code postal, Ville

2. **Structure**
   - Icône bâtiment + titre  
   - Nom structure, Type (dropdown), SIRET, Site web

3. **Rechercher une structure**
   - Fond gris clair
   - Barre recherche + 2 boutons
   - Message info bleu

4. **Ajouter un lieu**
   - Fond gris clair  
   - Barre recherche + 2 boutons
   - Message info bleu

5. **Lieux associés**
   - Message "Aucun lieu associé"

6. **Concerts associés**
   - Tableau ou message "Aucun concert associé"

### 3. Style Visual
✅ **Éléments de style** :

- **Header** : Dégradé bleu (#213547 → #2d4a63)
- **Cartes** : Fond blanc, ombre subtile, bordures arrondies
- **Headers cartes** : Fond gris clair (#f5f7f9)
- **Icônes** : Bootstrap Icons (bi-person-circle, bi-building, etc.)
- **Boutons** : Couleurs TourCraft (vert/gris/rouge)
- **Layout** : Centré, max 1200px

## Tests de Fonctionnalité

### 1. Saisie Formulaire
✅ **Tests de saisie** :
- Taper dans "Prénom" → texte s'affiche
- Taper dans "Email" → validation email en temps réel  
- Sélectionner "Type structure" → dropdown fonctionne
- Tous les champs gardent leur valeur

### 2. Boutons Header
✅ **Tests boutons** :
- **Enregistrer** → Toast de succès + notification
- **Annuler** → Toast d'annulation + redirection
- **Supprimer** → Modal de confirmation

### 3. Recherche Structure
✅ **Test recherche entreprise** :
- Taper 2+ caractères → Recherche API gouvernementale
- Résultats affichés sous la barre de recherche
- Clic sur résultat → Pré-remplissage champs structure

### 4. Recherche Lieu
✅ **Test recherche lieu** :
- Taper 2+ caractères → Recherche base TourCraft
- Résultats avec nom, adresse, capacité
- Clic sur résultat → Association (log console)

## Problèmes Fréquents

### 🔧 Si l'affichage ne correspond pas à la maquette :

1. **Variables CSS manquantes** :
   ```css
   /* Vérifier que l'import fonctionne */
   @import '@styles/base/variables.css';
   ```

2. **Bootstrap Icons non chargées** :
   - Vérifier `public/index.html` contient :
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
   ```

3. **Erreurs JavaScript** :
   - Ouvrir Console (F12) → Vérifier aucune erreur rouge
   - Si erreurs de hooks → Vérifier imports des hooks

### 🔧 Si les fonctionnalités ne marchent pas :

1. **Recherche structure inactive** :
   - Vérifier hook `useCompanySearch` importé
   - Console → Logs API calls

2. **Recherche lieu inactive** :
   - Vérifier hook `useLieuSearch` importé
   - Console → Vérifier `lieuSearch.lieux` contient données

3. **Sauvegarde ne fonctionne pas** :
   - Vérifier hook `useProgrammateurForm` importé
   - Console → Logs de `handleSubmit`

## Comparaison Avant/Après

### ❌ Ancien Formulaire
- Style Bootstrap basique
- Layout vertical simple
- Sections indépendantes
- Pas de recherche intégrée

### ✅ Nouveau Formulaire Maquette
- Design moderne avec dégradés
- Layout cartes avec ombres
- Sections recherche intégrées
- API gouvernementale connectée
- Variables CSS TourCraft
- Responsive mobile/desktop
- Icônes professionnelles

## Validation Réussie ✅

**Le formulaire maquette est opérationnel si** :
- ✅ L'affichage correspond à la maquette visuelle
- ✅ Toutes les sections sont présentes et stylées
- ✅ Les fonctionnalités de base fonctionnent (saisie, sauvegarde)
- ✅ Les recherches API sont fonctionnelles  
- ✅ Responsive design fonctionne sur mobile
- ✅ Aucune erreur console JavaScript/CSS

---

*Guide de test créé le 29 Mai 2025*
*Pour le composant ProgrammateurFormMaquette v1.0* 