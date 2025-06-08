# Architecture CSS de TourCraft

*Date de création : 17 mai 2025*  
*Dernière mise à jour : 25 mai 2025 - Navigation enrichie (Phase 3)*

---

## 🔗 **NAVIGATION & DOCUMENTS COMPLÉMENTAIRES**

Ce document fait partie de l'**écosystème documentaire CSS TourCraft**. Pour une compréhension complète :

### 📋 **Documents CSS Connexes**
- **📄 [Guide Standardisation CSS](/docs/css/GUIDE_STANDARDISATION_CSS.md)** ✅ **RÉFÉRENCE PRINCIPALE**
  - *Standards CSS complets, variables --tc-, CSS Modules*
  - **Relation** : Ce document fournit l'architecture, le guide fournit l'implémentation
  
- **📄 [Résumé Refactorisation CSS](/docs/css/RESUME_REFACTORISATION_CSS.md)** 📈 **HISTORIQUE**
  - *Historique des accomplissements et métriques de progression*
  - **Relation** : Ce document explique l'architecture actuelle, le résumé explique comment on y est arrivé

### 🎯 **Navigation Recommandée**
1. **Commencer ici** pour comprendre les **principes architecturaux**
2. Consulter le **Guide Standardisation CSS** pour l'**implémentation pratique**
3. Référencer le **Résumé Refactorisation** pour le **contexte historique**

### 📋 **Autres Références**
- **📄 [Guide Standards Conventions](/docs/standards/GUIDE_STANDARDS_CONVENTIONS.md)** - Standards généraux (référence le guide CSS)
- **📄 [Index Analyses & Audits](/docs/analyses/ANALYSES_AUDITS.md)** - Navigation centrale de la documentation

---

## Architecture et standardisation CSS

Le système CSS de TourCraft est fondé sur une architecture à plusieurs niveaux qui sépare clairement les **valeurs** (variables) et leur **application** (classes réutilisables). Cette séparation améliore la maintenabilité et garantit la cohérence visuelle à travers l'application.

## Structure des fichiers

```
src/styles/
├── base/
│   ├── colors.css        # Définition des couleurs (variables avec préfixe --tc-)
│   ├── variables.css     # Définition de toutes les variables globales
│   ├── typography.css    # Application des variables typographiques
│   ├── reset.css         # Reset CSS global
│   └── index.css         # Point d'entrée important qui importe tous les fichiers ci-dessus
├── components/           # Styles spécifiques aux composants
├── mixins/               # Mixins CSS réutilisables
└── pages/                # Styles spécifiques aux pages
```

## Principe fondamental : Séparation entre définition et application

Notre architecture CSS repose sur un principe fondamental : **la séparation entre la définition des valeurs (variables) et leur application (classes)**.

### 1. Définition des valeurs (variables.css, colors.css)

Ces fichiers définissent les valeurs brutes à utiliser dans l'application, comme :
- Tailles de police
- Poids de police
- Couleurs
- Espacements
- etc.

**Les variables CSS suivent une convention de nommage standardisée avec le préfixe `--tc-`.**

**Exemple :**
```css
/* Dans variables.css */
:root {
  --tc-font-size-lg: 1.25rem;
  --tc-font-weight-bold: 700;
  --tc-line-height-base: 1.5;
}
```

### 2. Application des valeurs (typography.css)

Ce fichier définit comment les variables sont appliquées dans l'application, sous forme de classes CSS réutilisables qui encapsulent un ensemble cohérent de styles.

**Exemple :**
```css
/* Dans typography.css */
.tc-h3 {
  font-size: var(--tc-font-size-lg);
  font-weight: var(--tc-font-weight-bold);
  line-height: var(--tc-line-height-base);
  margin-bottom: 0.6rem;
  color: var(--tc-dark-color);
}
```

## Avantages de cette approche

1. **Centralisation des valeurs** : Toutes les valeurs sont définies à un seul endroit, ce qui facilite leur mise à jour
2. **Cohérence visuelle** : L'utilisation des mêmes variables partout garantit l'homogénéité de l'interface
3. **Facilité de maintenance** : On peut modifier toutes les occurrences d'un style en changeant une seule variable
4. **Sémantique renforcée** : Les classes décrivent leur fonction, pas juste leur apparence

## Comment utiliser ce système

### A. Import des styles

L'import des styles dans les composants peut utiliser l'une des deux méthodes suivantes, qui sont toutes deux acceptables selon la configuration du projet (jsconfig.json) :

```jsx
// Option 1 : Import avec alias @/ (pointe vers src/)
import '@/styles/index.css';
// OU
import '@/styles/base/index.css';

// Option 2 : Import avec alias @styles/ (pointe directement vers src/styles/)
import '@styles/base/index.css';
```

Les deux formats sont acceptables et cohérents avec la configuration des alias du projet.

### B. Utilisation des classes standardisées

Au lieu d'utiliser des styles en ligne répétitifs, utilisez les classes standardisées :

```jsx
// À éviter ❌
<h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>Titre</h3>

// À privilégier ✅
<h3 className="tc-section-title">Titre</h3>
```

## Maintenance et évolution

1. Utilisez le script `prefix_css_vars.py` pour standardiser les variables CSS avec le préfixe `--tc-`
2. Utilisez le script `standardize_breakpoints.py` pour standardiser les points de rupture
3. Lors de la création de nouveaux composants, suivez toujours cette architecture

## Points de rupture (Breakpoints) standardisés

Nous utilisons des points de rupture standardisés dans tout le projet, définis comme variables CSS :

| Nom | Variable | Valeur | Utilisation |
|-----|----------|--------|-------------|
| XS | `--tc-breakpoint-xs` | 576px | Smartphones |
| SM | `--tc-breakpoint-sm` | 768px | Tablettes |
| MD | `--tc-breakpoint-md` | 992px | Petits écrans |
| LG | `--tc-breakpoint-lg` | 1200px | Grands écrans |
| XL | `--tc-breakpoint-xl` | 1400px | Très grands écrans |

---

## Référence rapide des classes typographiques

### Titres
- `.tc-h1`, `.tc-h2`, `.tc-h3`, `.tc-h4`, `.tc-h5`, `.tc-h6`

### Tailles de texte
- `.tc-text-xs`, `.tc-text-sm`, `.tc-text-md`, `.tc-text-lg`, `.tc-text-xl`, `.tc-text-xxl`

### Poids de texte
- `.tc-font-normal`, `.tc-font-medium`, `.tc-font-semibold`, `.tc-font-bold`

### Couleurs de texte
- `.tc-text-default`, `.tc-text-primary`, `.tc-text-secondary`, `.tc-text-muted`
- `.tc-text-success`, `.tc-text-warning`, `.tc-text-danger`, `.tc-text-info`

### Alignements
- `.tc-text-left`, `.tc-text-center`, `.tc-text-right`, `.tc-text-justify`

### Styles spécifiques
- `.tc-section-title` - Pour les titres de section
- `.tc-card-title` - Pour les titres de carte
- `.tc-form-label` - Pour les étiquettes de formulaire
- `.tc-error-text` - Pour les messages d'erreur
- `.tc-help-text` - Pour les messages d'aide

---

Ce document est complémentaire au [Guide de Standardisation CSS](/docs/css/GUIDE_STANDARDISATION_CSS.md) qui contient des informations supplémentaires sur l'utilisation des variables CSS, les bonnes pratiques et les composants standardisés.

### 🔗 **Liens Utiles**
- **Implémentation pratique** : [Guide Standardisation CSS](/docs/css/GUIDE_STANDARDISATION_CSS.md)
- **Historique du projet** : [Résumé Refactorisation CSS](/docs/css/RESUME_REFACTORISATION_CSS.md)
- **Standards généraux** : [Guide Standards Conventions](/docs/standards/GUIDE_STANDARDS_CONVENTIONS.md)
- **Navigation centrale** : [Index Analyses & Audits](/docs/analyses/ANALYSES_AUDITS.md)