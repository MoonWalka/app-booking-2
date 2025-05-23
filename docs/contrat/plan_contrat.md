# ✅ Plan d’amélioration – Génération de contrats PDF (TourCraft)

## 1. Uniformiser l’édition avec un WYSIWYG moderne
- Remplacer tous les `<textarea>` restants par un éditeur riche (ReactQuill ou Tiptap) dans toutes les sections du contrat (titre, corps, signature, en-tête, pied).
- S'assurer que le collage depuis Google Docs se fait toujours dans un éditeur WYSIWYG.

**Checklist :**
- [x] Recenser tous les composants utilisant encore `<textarea>` pour l'édition de contrat.
    - Fichiers concernés :
        - `src/components/contrats/desktop/sections/ContratTemplateBodySection.js`
        - ~~src/components/contrats/desktop/sections/ContratTemplateTitleSection.js~~
        - `src/components/contrats/desktop/sections/ContratTemplateHeaderSection.js`
        - `src/components/contrats/desktop/sections/ContratTemplateSignatureSection.js`
        - `src/components/contrats/desktop/sections/ContratTemplateFooterSection.js`
- [x] Remplacer chaque `<textarea>` par ReactQuill (ou Tiptap) dans :
    - [x] Corps du contrat
    - [x] Titre
    - [x] Signature
    - [x] En-tête
    - [x] Pied de page
- [x] Tester le collage de contenu riche depuis Google Docs dans chaque section.
- [x] S'assurer que l'insertion de variables dynamiques fonctionne dans chaque éditeur.
- [x] Nettoyer le code et supprimer les imports inutiles liés aux `<textarea>`.

## 2. Ajouter un bouton "Saut de page" dans l'éditeur
- Intégrer un bouton dédié dans la barre d'outils de l'éditeur pour insérer automatiquement un saut de page (`<hr class="page-break">` ou `[SAUT_DE_PAGE]`).
- (Optionnel) Afficher visuellement les sauts de page dans l'éditeur (ligne, icône ou repère).

**Checklist :**
- [x] Ajouter un bouton "Saut de page" dans la barre d'outils de l'éditeur WYSIWYG.
- [x] Configurer ce bouton pour insérer `<hr class="page-break">` ou `[SAUT_DE_PAGE]` à la position du curseur.
- [x] (Optionnel) Ajouter un style visuel dans l'éditeur pour représenter le saut de page (ligne, icône…).
- [x] Tester l'insertion et la suppression de sauts de page dans chaque section.
- [x] Vérifier que le PDF respecte bien les sauts de page insérés.

## 3. Enrichir le CSS d'impression
- Compléter le fichier `contrat-print.css` pour couvrir tous les cas de contenu collé depuis Google Docs :  
  - Espacements, couleurs, polices, images, listes imbriquées, tableaux complexes, etc.
- Tester le rendu avec des modèles variés et ajuster le CSS pour chaque cas problématique.

**Checklist :**
- [x] Lister les cas de contenu Google Docs qui posent problème (espacements, couleurs, images, tableaux…).
- [x] Adapter/compléter le fichier `contrat-print.css` pour chaque cas identifié.
- [x] Ajouter des styles pour :
    - [x] Listes imbriquées
    - [x] Tableaux complexes
    - [x] Images (alignement, taille…)
    - [x] Polices et couleurs personnalisées
- [x] Tester le rendu PDF avec plusieurs modèles collés depuis Google Docs.
- [x] Documenter les limites ou cas non gérés.

## 4. Créer une suite de tests de rendu PDF
- Mettre en place des tests manuels ou automatiques pour valider le rendu PDF avec différents modèles collés depuis Google Docs.
- Documenter les cas limites et les bugs de rendu rencontrés.

**Checklist :**
- [x] Préparer une collection de modèles de contrats variés (simples, complexes, avec images, tableaux…).
- [x] Coller chaque modèle dans l'éditeur et générer le PDF.
- [x] Comparer visuellement le PDF au modèle Google Docs d'origine.
- [x] Noter les bugs ou écarts de rendu.
- [x] (Optionnel) Mettre en place des tests automatisés de rendu PDF (ex : snapshot visuel).
- [x] Créer un rapport de bugs ou d'améliorations CSS à traiter.

## 5. Améliorer la gestion des variables dynamiques
- Ajouter la gestion des variables manquantes (alerte, valeur par défaut).
- Permettre le formatage avancé des variables (dates, montants, etc.).
- (Optionnel) Ajouter une interface pour visualiser toutes les variables disponibles et leur usage dans le template.

**Checklist :**
- [ ] Lister toutes les variables dynamiques utilisées dans les templates.
- [ ] Ajouter une gestion des variables manquantes :
    - [ ] Valeur par défaut
    - [ ] Alerte ou marquage `[VARIABLE MANQUANTE]`
- [ ] Permettre le formatage avancé (dates, montants, etc.).
- [ ] (Optionnel) Créer une interface listant toutes les variables disponibles et leur usage.
- [ ] Tester le rendu PDF avec des variables manquantes ou mal formatées.

## 6. Rédiger une documentation utilisateur claire
- Expliquer :
  - Les bonnes pratiques pour coller du contenu depuis Google Docs.
  - L'utilisation des variables dynamiques.
  - Les limites du rendu PDF et comment les contourner.
  - L'utilisation des sauts de page.

**Checklist :**
- [ ] Rédiger une section "Bonnes pratiques de collage depuis Google Docs".
- [ ] Expliquer l'utilisation des variables dynamiques (syntaxe, exemples).
- [ ] Documenter les limites du rendu PDF et les solutions de contournement.
- [ ] Expliquer comment insérer et utiliser les sauts de page.
- [ ] Mettre la documentation à disposition dans l'interface ou sur le wiki du projet.

---

### 🟢 Points déjà couverts
- Gestion des sauts de page : déjà possible via `[SAUT_DE_PAGE]` ou `<hr class="page-break">` (ne pas réimplémenter).
- Aperçu PDF fidèle : déjà en place via un `<iframe>`.
- Insertion de variables dynamiques : menu contextuel déjà existant.

---

Ce plan est à jour, sans doublons, et prêt à être lancé. Pour chaque étape, valider l'implémentation avant de passer à la suivante.
