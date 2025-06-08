# Rapport de correction : Variable [SAUT_DE_PAGE] dans les modèles de contrat

## Date : 07/01/2025

## Problème identifié

La variable `[SAUT_DE_PAGE]` mentionnée dans le guide utilisateur s'affichait littéralement dans les PDFs générés au lieu de créer un véritable saut de page.

### Cause du problème

1. La fonction `replaceVariables` dans `ContratPDFWrapper.js` ne traitait que les variables de données (nom, adresse, etc.) mais pas la balise spéciale `[SAUT_DE_PAGE]`
2. `[SAUT_DE_PAGE]` n'était pas transformé en élément HTML avec la classe CSS appropriée

## Solution implémentée

### 1. Modification de la fonction `replaceVariables` (ContratPDFWrapper.js)

Ajout du traitement spécifique pour `[SAUT_DE_PAGE]` après le remplacement des variables normales :

```javascript
// Traiter spécifiquement les sauts de page
// Remplacer [SAUT_DE_PAGE] par une balise HTML de saut de page
processedContent = processedContent.replace(
  /\[SAUT_DE_PAGE\]/gi,
  '<div class="page-break" style="page-break-after: always; height: 0; margin: 0; padding: 0;"></div>'
);
```

### 2. Ajout des styles CSS pour `.page-break`

#### Dans ContratPDFWrapper.js (pour l'aperçu HTML) :

```css
/* Support des sauts de page */
.contrat-print-mode .page-break {
  page-break-after: always;
  break-after: page;
  height: 0;
  margin: 0;
  padding: 0;
  visibility: hidden;
}

/* Pour l'aperçu web - afficher une ligne visuelle */
@media screen {
  .contrat-print-mode .page-break {
    border-top: 2px dashed #ccc;
    margin: 20px 0;
    padding-top: 20px;
    visibility: visible;
    position: relative;
  }
  
  .contrat-print-mode .page-break::before {
    content: "--- Saut de page ---";
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 0 10px;
    color: #999;
    font-size: 12px;
    font-style: italic;
  }
}
```

#### Dans functions/index.js (pour la génération PDF) :

```css
.page-break {
  page-break-after: always;
  break-after: page; /* Version moderne de page-break-after */
  display: block;
  height: 0;
  margin: 0;
  padding: 0;
  visibility: hidden;
}
```

## Fichiers modifiés

1. `/src/components/pdf/ContratPDFWrapper.js`
   - Fonction `replaceVariables` : Ajout du traitement de `[SAUT_DE_PAGE]`
   - Styles CSS : Ajout des styles pour `.page-break` dans les deux instances du HTML généré

2. `/functions/index.js`
   - Styles CSS : Amélioration des styles pour `.page-break` dans la génération PDF

## Résultat attendu

- Dans les modèles de contrat, l'utilisateur peut insérer `[SAUT_DE_PAGE]` là où il souhaite forcer un saut de page
- Dans l'aperçu web, une ligne pointillée avec le texte "--- Saut de page ---" indique visuellement l'emplacement du saut
- Dans le PDF généré, un véritable saut de page est créé à cet endroit

## Test recommandé

1. Créer ou éditer un modèle de contrat
2. Insérer `[SAUT_DE_PAGE]` entre deux sections
3. Vérifier l'aperçu : une ligne pointillée doit apparaître
4. Générer le PDF : un saut de page doit séparer les sections

## Notes

- La balise `[SAUT_DE_PAGE]` est insensible à la casse grâce à l'utilisation du flag `gi` dans la regex
- La solution est rétrocompatible avec les modèles existants
- Le guide utilisateur (UserGuide.js) mentionne correctement l'utilisation de `[SAUT_DE_PAGE]`