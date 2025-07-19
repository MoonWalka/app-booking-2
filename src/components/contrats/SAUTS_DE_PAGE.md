# Guide des sauts de page dans les contrats

## Comment insérer des sauts de page

### Dans l'éditeur Quill
Pour insérer un saut de page dans votre contrat, vous pouvez :

1. **Méthode HTML** : Basculer en mode HTML et ajouter :
   ```html
   <div class="page-break"></div>
   ```
   ou
   ```html
   <div class="saut-de-page"></div>
   ```

2. **Entre les sections** : Placez le saut de page entre deux sections importantes :
   ```html
   <p>Fin de la section 1...</p>
   <div class="page-break"></div>
   <h2>Section 2 : Conditions générales</h2>
   ```

## Classes CSS disponibles

- `.page-break` ou `.saut-de-page` : Force un saut de page après l'élément
- `.page-break-before` : Force un saut de page avant l'élément
- `.avoid-break` : Empêche un saut de page dans l'élément (utile pour garder des paragraphes ensemble)

## Comportement automatique

Le système gère automatiquement :
- Les titres restent avec leur contenu (pas de titre orphelin)
- Les paragraphes évitent d'être coupés (minimum 3 lignes ensemble)
- Les images et tableaux ne sont pas coupés
- Format A4 avec marges de 2cm

## Exemple de contrat avec sauts de page

```html
<h1>CONTRAT DE PRESTATION</h1>
<p>Entre les soussignés...</p>

<!-- Saut de page après la première page -->
<div class="page-break"></div>

<h2>Article 1 : Objet</h2>
<p>Le présent contrat a pour objet...</p>

<!-- Garder cette section ensemble -->
<div class="avoid-break">
  <h3>1.1 Description détaillée</h3>
  <p>La prestation comprend...</p>
  <ul>
    <li>Point 1</li>
    <li>Point 2</li>
  </ul>
</div>

<!-- Nouveau saut avant les signatures -->
<div class="page-break"></div>

<h2>Signatures</h2>
<p>Fait à Paris, le...</p>
```

## Test d'impression

Pour vérifier vos sauts de page :
1. Cliquez sur "Enregistrer et afficher"
2. Dans l'aperçu, cliquez sur "Imprimer"
3. Vérifiez l'aperçu avant impression
4. Les sauts de page apparaîtront correctement dans l'aperçu d'impression