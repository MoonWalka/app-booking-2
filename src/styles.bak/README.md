# Système CSS de TourCraft

Ce document explique l'architecture CSS de l'application TourCraft et comment utiliser correctement le système de variables centralisées.

## Architecture des fichiers

```
styles/
│
├── base/
│   ├── colors.css       # Définition de toutes les couleurs
│   ├── reset.css        # Reset CSS global
│   └── variables.css    # Variables CSS globales
│
├── components/          # Styles spécifiques aux composants
│
├── pages/               # Styles spécifiques aux pages
│
├── theme.css            # Application des variables au thème
└── index.css            # Point d'entrée qui importe tous les fichiers
```

## Variables CSS centralisées

Pour assurer une cohérence visuelle dans toute l'application, nous avons centralisé toutes les variables CSS dans des fichiers dédiés:

### 1. Couleurs (`colors.css`)

Toutes les couleurs de l'application sont définies dans `base/colors.css`. Ce fichier:
- Définit les couleurs de base (primaire, secondaire, etc.)
- Définit les variations de couleurs (clair, foncé, RGB)
- Définit les couleurs fonctionnelles (succès, erreur, avertissement)
- Définit les couleurs spécifiques aux composants

### 2. Variables globales (`variables.css`)

Toutes les autres variables globales sont définies dans `base/variables.css`. Ce fichier:
- Définit les variables de typographie
- Définit les espacements et marges
- Définit les ombres et rayons de bordure
- Définit les transitions et animations
- Définit les z-index

## Comment utiliser les variables

### ✅ Bonnes pratiques

1. **Toujours utiliser les variables CSS**
   ```css
   /* BON */
   color: var(--primary-color);
   background-color: var(--card-bg);
   ```

2. **Pour les effets de transparence, utiliser les versions RGB**
   ```css
   /* BON */
   box-shadow: 0 0 10px rgba(var(--primary-color-rgb), 0.2);
   ```

3. **Pour les variables spécifiques à un composant, faire référence aux variables globales**
   ```css
   /* BON */
   .mon-composant {
     --composant-couleur: var(--primary-light);
     color: var(--composant-couleur);
   }
   ```

4. **Pour ajouter une nouvelle variable, la définir dans le fichier approprié**
   - Nouvelle couleur → `colors.css`
   - Nouvelle variable de mise en page/espacement → `variables.css`

### ❌ Mauvaises pratiques

1. **Ne jamais utiliser de valeurs en dur**
   ```css
   /* MAUVAIS */
   color: #2c3e50;
   background-color: white;
   ```

2. **Ne pas redéfinir les variables globales dans des fichiers spécifiques**
   ```css
   /* MAUVAIS */
   :root {
     --primary-color: #3498db;
   }
   ```

3. **Ne pas créer de variables redondantes**
   ```css
   /* MAUVAIS */
   .mon-composant {
     --couleur-texte: #2c3e50; /* Utiliser var(--text-color) à la place */
   }
   ```

## Ordre d'importation des variables

L'ordre d'importation est important pour permettre aux variables de faire référence à d'autres variables:

1. `reset.css` - Reset des styles par défaut du navigateur
2. `colors.css` - Définition des couleurs de base
3. `variables.css` - Variables globales qui peuvent faire référence aux couleurs

## Déboguer les problèmes de variables CSS

Si vous rencontrez des problèmes avec les variables CSS:

1. Vérifiez l'inspecteur d'éléments du navigateur pour voir quelles valeurs sont appliquées
2. Assurez-vous que le fichier définissant la variable est bien importé
3. Vérifiez l'ordre d'importation dans `index.css`
4. Utilisez des valeurs de fallback en cas de besoin: `var(--ma-variable, valeur-par-defaut)`

## Ajouter de nouvelles variables

Pour ajouter une nouvelle variable:

1. Identifiez le fichier approprié (`colors.css` ou `variables.css`)
2. Ajoutez la variable avec une documentation sur son utilisation
3. Utilisez un nom cohérent avec les conventions existantes
4. Ajoutez un commentaire expliquant à quoi sert la variable

## Maintenance

- Réviser périodiquement les variables non utilisées
- Lors de l'ajout de nouvelles fonctionnalités, réutiliser les variables existantes quand c'est possible
- Documenter toute nouvelle variable ajoutée