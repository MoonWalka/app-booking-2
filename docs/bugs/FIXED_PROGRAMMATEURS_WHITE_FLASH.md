# Résolution du bug de flash blanc sur la page Programmateurs

**Date de résolution:** 16 mai 2025  
**Type de bug:** Interface utilisateur  
**Composants affectés:** Page Programmateurs, Layout, DesktopLayout

## Description du problème

Lors de la navigation vers la page des programmateurs via la sidebar, un flash blanc apparaissait brièvement en plein écran (incluant la zone de la sidebar) pendant la phase de chargement, créant une expérience utilisateur désagréable. Ce flash ne durait que quelques millisecondes, mais était très visible et perturbait la navigation dans l'application.

## Cause racine

Deux problèmes distincts ont été identifiés et corrigés:

1. **Indicateur de chargement mal configuré**: Le composant `Spinner` utilisé dans `ProgrammateursList.js` n'utilisait pas l'option `contentOnly={true}`, ce qui faisait qu'il s'affichait en plein écran au lieu de se limiter à la zone de contenu principal.

2. **Gestion des transitions entre routes**: La transition entre les routes n'était pas correctement gérée pour maintenir la sidebar visible pendant que le contenu était rechargé.

## Modifications effectuées

### 1. Optimisation du Spinner dans la liste des programmateurs

**Fichier:** `/src/components/programmateurs/desktop/ProgrammateursList.js`

```javascript
// Avant
if (loading) {
  return <Spinner message="Chargement des programmateurs..." />;
}

// Après
if (loading) {
  return <Spinner message="Chargement des programmateurs..." contentOnly={true} />;
}
```

L'option `contentOnly={true}` limite l'affichage du spinner à la zone de contenu principal à côté de la sidebar au lieu de couvrir toute la page.

### 2. Amélioration des transitions entre les routes

**Fichier:** `/src/components/common/layout/DesktopLayout.js`

Nous avons ajouté un système de gestion des transitions pour maintenir l'interface utilisateur stable pendant les changements de route:

```javascript
// Ajout des imports nécessaires
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

function DesktopLayout({ children }) {
  // ...code existant...
  const location = useLocation();
  
  // État pour suivre si une transition est en cours
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Effet pour gérer les transitions entre les routes
  useEffect(() => {
    // Marquer le début de la transition
    setIsTransitioning(true);
    
    // Réinitialiser après la transition (court délai)
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // 300ms est généralement suffisant pour une transition fluide
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // ...code existant...

  return (
    <div className={layoutStyles.layoutContainer}>
      {/* ...sidebar... */}
      <main className={`${layoutStyles.content} ${isTransitioning ? "router-transition-active" : ""}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
}
```

**Fichier:** `/src/components/layout/Layout.module.css`

Nous avons ajouté des styles CSS pour gérer l'apparence pendant les transitions:

```css
.content {
  /* ...styles existants... */
  transition: opacity var(--tc-transition-duration, 0.3s) ease-in-out;
  position: relative;
}

/* Style pour corriger le problème du flash blanc pendant les transitions */
:global(.router-transition-active) {
  position: relative;
}

:global(.router-transition-active::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--tc-background-color, #f8f9fa);
  z-index: 1;
  pointer-events: none; /* Permet toujours les clics à travers */
}
```

### 3. Correction des références entre les composants

Pour éviter les doublons et assurer une structure correcte:

**Fichier:** `/src/components/common/Layout.js`
- Mise à jour des imports pour pointer vers le bon fichier CSS
- Simplification du rendu pour utiliser uniquement le DesktopLayout avec l'Outlet

## Résultats

Ces modifications ont permis d'éliminer complètement le flash blanc lors de la navigation vers la page des programmateurs. La sidebar reste désormais toujours visible pendant le chargement, et la transition entre les pages est plus fluide, offrant une meilleure expérience utilisateur.

## Tests effectués

- Navigation répétée entre différentes sections de l'application
- Test sur différentes tailles d'écran
- Vérification de l'absence de flash blanc sur la page des programmateurs
- Confirmation que les autres pages fonctionnent correctement

## Impact sur les performances

Ces modifications n'ont pas d'impact négatif sur les performances. Au contraire, elles améliorent la perception de rapidité de l'application en évitant les effets visuels perturbateurs.

## Recommandations supplémentaires

Pour éviter des problèmes similaires à l'avenir:

1. Toujours utiliser l'option `contentOnly={true}` pour les spinners dans les pages principales
2. Standardiser l'approche de gestion des transitions entre les routes
3. Considérer l'ajout d'animations de transition plus élaborées pour améliorer davantage l'expérience utilisateur