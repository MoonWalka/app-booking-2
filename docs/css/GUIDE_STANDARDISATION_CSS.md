# Guide de standardisation CSS - TourCraft

*Date de création : 12 mai 2025*

## Variables et points de rupture standardisés

Ce guide présente les standards à suivre pour l'utilisation des variables CSS et des points de rupture (breakpoints) dans le projet TourCraft.

### 1. Variables CSS standardisées

Toutes les variables CSS sont définies dans `/src/styles/base/variables.css` et doivent utiliser le préfixe `--tc-`.

#### Utilisation des variables

```css
/* Correct */
.myComponent {
  color: var(--tc-primary-color);
  margin: var(--tc-spacing-md);
  font-size: var(--tc-font-size-lg);
}

/* Incorrect - valeurs codées en dur */
.myComponent {
  color: #2c3e50;
  margin: 16px;
  font-size: 1.2rem;
}
```

#### Fallbacks pour la rétrocompatibilité

Pour assurer la compatibilité avec les anciens navigateurs, utilisez toujours des fallbacks :

```css
.myComponent {
  color: var(--tc-primary-color, #2c3e50);
  margin: var(--tc-spacing-md, 16px);
  font-size: var(--tc-font-size-lg, 1.2rem);
}
```

### 2. Points de rupture (Breakpoints)

Nous avons standardisé les points de rupture dans tout le projet :

| Nom | Variable | Valeur | Utilisation |
|-----|----------|--------|-------------|
| XS | `--tc-breakpoint-xs` | 576px | Smartphones |
| SM | `--tc-breakpoint-sm` | 768px | Tablettes |
| MD | `--tc-breakpoint-md` | 992px | Petits écrans |
| LG | `--tc-breakpoint-lg` | 1200px | Grands écrans |
| XL | `--tc-breakpoint-xl` | 1400px | Très grands écrans |

#### Utilisation dans les media queries

```css
/* Correct - Utilise les variables standardisées */
@media (max-width: var(--tc-breakpoint-sm, 768px)) {
  .myComponent {
    flex-direction: column;
  }
}

/* Incorrect - Utilise des valeurs codées en dur */
@media (max-width: 768px) {
  .myComponent {
    flex-direction: column;
  }
}
```

### 3. Classes utilitaires pour les points de rupture

Nous avons créé des classes utilitaires pour les points de rupture dans `/src/styles/mixins/breakpoints.css`. Pour les utiliser :

1. Importez le fichier dans votre module CSS :
```css
@import '../../styles/mixins/breakpoints.css';
```

2. Utilisez les classes dans votre JSX :
```jsx
<div className={`${styles.container} xs:flex-col sm:w-full md:flex-row`}>
  Contenu responsive
</div>
```

### 4. Outils de standardisation automatique

Utilisez ces scripts pour standardiser automatiquement votre code CSS :

#### Standardiser les variables CSS
```bash
python prefix_css_vars.py chemin/vers/fichier.module.css
```

#### Standardiser les points de rupture
```bash
python standardize_breakpoints.py --mobile  # Pour les composants mobiles
python standardize_breakpoints.py --desktop # Pour les composants desktop
python standardize_breakpoints.py --all     # Pour tous les fichiers CSS
```

### 5. Bonnes pratiques à suivre

1. **Évitez les valeurs codées en dur** - utilisez toujours les variables CSS définies
2. **Utilisez une approche mobile-first** - commencez par le mobile puis ajoutez des styles pour les écrans plus grands
3. **Respectez les points de rupture standards** - n'inventez pas de nouveaux breakpoints
4. **Utilisez les classes utilitaires** - pour les besoins responsives simples
5. **Documentez les cas particuliers** - avec des commentaires explicatifs

### 6. Checklist de validation

Avant de soumettre votre code, vérifiez que :

- [ ] Toutes les valeurs de couleur utilisent des variables CSS
- [ ] Tous les espacements utilisent des variables CSS
- [ ] Les tailles de police utilisent des variables CSS
- [ ] Les points de rupture utilisent les variables standardisées
- [ ] Les fichiers CSS mobiles et desktop ont des styles cohérents

---

Pour toute question ou suggestion concernant ce guide, contactez l'équipe CSS de TourCraft.