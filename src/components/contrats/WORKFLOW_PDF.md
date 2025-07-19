# Workflow de génération PDF des contrats

## Vue d'ensemble

Le système génère maintenant de vrais PDF avec pagination réelle au lieu d'un simple aperçu HTML.

## Comment ça marche

### 1. Édition (colonne gauche)
- L'utilisateur édite le contrat dans l'éditeur
- Peut insérer des sauts de page via le bouton "Saut de page"
- Les sauts apparaissent visuellement dans l'éditeur

### 2. Génération du PDF
- Cliquer sur "Enregistrer et afficher" pour :
  1. Sauvegarder le contrat
  2. Remplacer les variables
  3. Générer automatiquement le PDF via Puppeteer

### 3. Aperçu PDF (colonne droite)
- Affiche le vrai PDF généré avec :
  - Pages A4 réelles
  - Sauts de page fonctionnels
  - Mise en page professionnelle
- Bouton 🔄 pour régénérer le PDF si besoin

## Avantages

✅ **Vraie pagination** : Les sauts de page créent de vraies nouvelles pages
✅ **WYSIWYG** : Ce que vous voyez dans le PDF est exactement ce qui sera imprimé
✅ **Performance** : PDF généré uniquement à la demande (pas à chaque frappe)
✅ **Intégration native** : L'iframe affiche le PDF avec les contrôles natifs du navigateur

## Détails techniques

### Génération du PDF
```javascript
// 1. HTML enrichi avec styles CSS pour l'impression
const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      .page-break { page-break-after: always; }
      /* ... autres styles ... */
    </style>
  </head>
  <body>${contenu}</body>
  </html>
`;

// 2. Appel à la fonction Cloud
const response = await fetch('/generatePdf', {
  method: 'POST',
  body: JSON.stringify({ html: fullHtml })
});

// 3. Création d'une URL blob pour l'affichage
const pdfBlob = await response.blob();
const pdfUrl = URL.createObjectURL(pdfBlob);
```

### Sauts de page
- Dans l'éditeur : `<div class="page-break"></div>`
- Dans le PDF : Nouvelle page A4
- CSS : `page-break-after: always`

## Workflow utilisateur

1. 🖊️ Éditer le contrat
2. 📄 Insérer des sauts de page si nécessaire
3. 💾 Cliquer "Enregistrer et afficher"
4. ⏳ Attendre la génération (quelques secondes)
5. 👀 Voir le PDF avec vraies pages
6. 🖨️ Imprimer ou 💾 télécharger directement depuis l'iframe