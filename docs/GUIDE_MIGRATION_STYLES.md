# Guide de Migration vers le Système de Design Unifié

## 🎯 Objectif
Migrer progressivement tous les composants vers le nouveau système de design unifié basé sur les design tokens CSS.

## 📋 Checklist de migration par composant

### 1. Remplacer Bootstrap
```css
/* ❌ Avant - Classes Bootstrap */
<div className="btn btn-primary">

/* ✅ Après - CSS Module avec design tokens */
<button className={styles.button}>
```

### 2. Remplacer les styles inline
```jsx
/* ❌ Avant - Style inline */
<div style={{ padding: '16px', color: '#333' }}>

/* ✅ Après - CSS Module */
<div className={styles.container}>
```

### 3. Utiliser les variables CSS
```css
/* ❌ Avant - Valeurs hardcodées */
.button {
  padding: 8px 16px;
  color: #007bff;
  border-radius: 4px;
}

/* ✅ Après - Design tokens */
.button {
  padding: var(--spacing-2) var(--spacing-4);
  color: var(--color-primary);
  border-radius: var(--border-radius-base);
}
```

## 🔄 Correspondances Bootstrap → Design Tokens

### Couleurs
| Bootstrap | Design Token |
|-----------|--------------|
| `btn-primary` | `--color-primary` |
| `btn-secondary` | `--color-secondary` |
| `btn-danger` | `--color-danger` |
| `btn-success` | `--color-success` |
| `text-muted` | `--color-text-muted` |
| `bg-light` | `--color-gray-100` |

### Espacements
| Bootstrap | Design Token |
|-----------|--------------|
| `p-1` | `padding: var(--spacing-1)` |
| `p-2` | `padding: var(--spacing-2)` |
| `m-3` | `margin: var(--spacing-3)` |
| `px-4` | `padding: 0 var(--spacing-4)` |

### Layout
| Bootstrap | CSS Module |
|-----------|------------|
| `container` | `.container { max-width: var(--container-lg) }` |
| `row` | `.row { display: flex; gap: var(--spacing-4) }` |
| `col-md-6` | `.column { flex: 1 }` ou CSS Grid |

## 📝 Exemples de migration

### Exemple 1 : Bouton
```jsx
// ❌ Avant
<button className="btn btn-primary btn-sm">
  Cliquez ici
</button>

// ✅ Après
<button className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}>
  Cliquez ici
</button>
```

```css
/* styles.module.css */
.button {
  padding: var(--button-padding-y) var(--button-padding-x);
  font-size: var(--button-font-size);
  border-radius: var(--button-border-radius);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.buttonPrimary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.buttonSmall {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-sm);
}
```

### Exemple 2 : Card
```jsx
// ❌ Avant
<div className="card shadow-sm">
  <div className="card-body">
    <h5 className="card-title">Titre</h5>
    <p className="card-text text-muted">Description</p>
  </div>
</div>

// ✅ Après
<div className={styles.card}>
  <h3 className={styles.cardTitle}>Titre</h3>
  <p className={styles.cardText}>Description</p>
</div>
```

### Exemple 3 : Formulaire
```jsx
// ❌ Avant
<div className="form-group">
  <label>Email</label>
  <input type="email" className="form-control" />
</div>

// ✅ Après
<div className={styles.formGroup}>
  <label className={styles.label}>Email</label>
  <input type="email" className={styles.input} />
</div>
```

## 🚀 Processus de migration recommandé

### 1. Pour un nouveau composant
- Utilisez directement le nouveau système
- Référencez `ExampleUnifiedStyles.js` comme modèle
- N'importez pas Bootstrap

### 2. Pour un composant existant
1. Créez un fichier `.module.css` s'il n'existe pas
2. Identifiez toutes les classes Bootstrap utilisées
3. Créez les équivalents en CSS modules
4. Remplacez progressivement les classes
5. Testez le rendu visuel
6. Supprimez les imports Bootstrap

### 3. Pour les composants desktop/mobile
1. Créez un seul composant responsive
2. Utilisez les media queries CSS
3. Supprimez les versions dupliquées

## 📏 Règles importantes

1. **Toujours utiliser les design tokens** pour :
   - Couleurs
   - Espacements
   - Tailles de police
   - Bordures
   - Ombres

2. **Éviter** :
   - Les valeurs hardcodées (px, couleurs hex)
   - Les styles inline
   - Les classes Bootstrap
   - La duplication de styles

3. **Privilégier** :
   - CSS Modules
   - Composition de classes
   - Variables CSS
   - Media queries pour le responsive

## 🔍 Vérification

Après migration d'un composant, vérifiez :
- [ ] Aucune classe Bootstrap restante
- [ ] Aucun style inline
- [ ] Toutes les valeurs utilisent des design tokens
- [ ] Le composant est responsive
- [ ] Les états (hover, focus, active) fonctionnent
- [ ] L'accessibilité est maintenue

## 📚 Ressources

- Design tokens : `/src/styles/design-tokens.css`
- Exemple : `/src/components/ui/ExampleUnifiedStyles.js`
- Composants UI standards : `/src/components/ui/`