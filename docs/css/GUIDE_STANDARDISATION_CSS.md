# Guide de standardisation CSS - TourCraft

*Date de création : 12 mai 2025*
*Dernière mise à jour : 12 mai 2025 - Ajout de la section sur les composants Card standardisés*

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

### 7. Composants Card standardisés

Dans le cadre de notre effort de standardisation, nous avons mis en place un composant Card réutilisable et cohérent qui doit être utilisé dans toute l'application. Ce composant remplace les implémentations personnalisées précédemment utilisées.

#### Composant Card standardisé

Le composant Card standardisé est situé dans `src/components/ui/Card.js` et offre une API cohérente avec de nombreuses options :

```jsx
// Exemple d'utilisation du composant Card standardisé
import Card from '@/components/ui/Card';

const MyComponent = () => {
  return (
    <Card
      title="Titre de la carte"
      icon={<i className="bi bi-star"></i>}
      className="ma-classe-personnalisee"
      isEditing={false}
      isHoverable={true}
      variant="primary" // Options: primary, success, warning, danger
      headerActions={<button>Action</button>}
      footerContent={<div>Pied de page</div>}
      onClick={handleClick}
    >
      Contenu de la carte
    </Card>
  );
};
```

#### Sous-composants disponibles

Le composant Card expose également les sous-composants Bootstrap pour une API cohérente :

```jsx
<Card.Body>Corps personnalisé</Card.Body>
<Card.Title>Titre personnalisé</Card.Title>
<Card.Text>Texte personnalisé</Card.Text>
<Card.Header>En-tête personnalisé</Card.Header>
<Card.Footer>Pied de page personnalisé</Card.Footer>
```

#### Migration des composants existants

Un audit a identifié 115 composants avec une confiance élevée (70-100%) qui utilisent des styles de carte et devraient être migrés vers le composant Card standardisé. La migration consiste à :

1. Importer le composant Card standardisé
2. Remplacer les éléments DIV avec classe `formCard` ou similaire par le composant Card
3. Déplacer le titre et l'icône dans les props du composant Card
4. Supprimer les DIV d'en-tête et de corps personnalisés
5. Maintenir la structure interne du contenu

Exemple de migration :

```jsx
// AVANT
<div className={styles.formCard}>
  <div className={styles.cardHeader}>
    <div className={styles.cardIcon}>
      <i className="bi bi-person"></i>
    </div>
    <h3 className={styles.cardTitle}>Titre</h3>
  </div>
  <div className={styles.cardBody}>
    Contenu de la carte
  </div>
</div>

// APRÈS
<Card
  title="Titre"
  icon={<i className="bi bi-person"></i>}
  className={styles.monComposant}
>
  Contenu de la carte
</Card>
```

#### Avantages de l'utilisation du composant Card standardisé

- Interface utilisateur cohérente dans toute l'application
- Meilleure maintenabilité avec style centralisé
- Fonctionnalités améliorées (variants, actions d'en-tête, contenu de pied de page)
- Réduction de la duplication de code

#### Checklist pour la migration des Card

- [ ] Tous les composants personnalisés de type carte identifiés dans le rapport sont migrés
- [ ] Les styles spécifiques aux composants sont conservés via la prop className
- [ ] Les fonctionnalités existantes sont maintenues après la migration
- [ ] Les tests sont mis à jour pour refléter la nouvelle structure du composant

---

Pour toute question ou suggestion concernant ce guide, contactez l'équipe CSS de TourCraft.