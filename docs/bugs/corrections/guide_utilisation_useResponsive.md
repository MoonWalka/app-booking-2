# Guide d'utilisation du Hook useResponsive

Date: 8 mai 2025  
Auteur: GitHub Copilot

## Introduction

Le hook `useResponsive` a été amélioré pour résoudre les problèmes de stabilité lors du chargement dynamique des composants responsifs. Ce guide présente les bonnes pratiques à suivre pour garantir des performances optimales et éviter les problèmes courants.

## Fonctionnalités clés

Le hook `useResponsive` offre désormais :

1. **Un système de cache intelligent** pour les composants chargés dynamiquement
2. **Un mécanisme de retry automatique** (avec backoff exponentiel) en cas d'erreur de chargement
3. **Une gestion plus fluide des transitions** entre les modes desktop et mobile
4. **Une mémorisation optimisée** pour éviter les rechargements inutiles
5. **Un composant d'erreur amélioré** avec possibilité de réessayer sans recharger la page

## Utilisation recommandée

### 1. Initialisation du hook

```javascript
import { useResponsive } from '@/hooks/common';

function MonComposant() {
  // Options disponibles : breakpoint, forceDesktop, transitionDelay
  const responsive = useResponsive({
    // Point de rupture en pixels (défaut: 768)
    breakpoint: 768,
    // Forcer l'affichage desktop (défaut: false)
    forceDesktop: false,
    // Délai pour les transitions en millisecondes (défaut: 150)
    transitionDelay: 150
  });
  
  // ...
}
```

### 2. Chargement dynamique d'un composant responsif

```javascript
import React, { useMemo } from 'react';
import { useResponsive } from '@/hooks/common';

function MonComposantConteneur() {
  const responsive = useResponsive();
  
  // BONNE PRATIQUE: Utiliser useMemo avec les bonnes dépendances
  const MonComposantDynamique = useMemo(() => {
    return responsive.getResponsiveComponent({
      desktopPath: 'monModule/desktop/MonComposant',
      mobilePath: 'monModule/mobile/MonComposant',
      // Composant de chargement personnalisé (optionnel)
      fallback: <MonComposantDeChargement />,
      // Nombre maximal de tentatives en cas d'erreur (défaut: 3)
      maxRetries: 3
    });
  }, [responsive.isMobile, responsive.getResponsiveComponent]);
  
  // Utilisation du composant
  return <MonComposantDynamique prop1="valeur1" prop2="valeur2" />;
}

// BONNE PRATIQUE: Mémoiser le composant conteneur
export default React.memo(MonComposantConteneur);
```

### 3. Gestion des hooks de données

```javascript
function EntiteDetails() {
  const { id } = useParams();
  const responsive = useResponsive();
  
  // BONNE PRATIQUE: Initialiser le hook de détails au niveau racine
  const detailsHook = useEntiteDetails(id);
  
  const EntiteView = useMemo(() => {
    return responsive.getResponsiveComponent({
      desktopPath: 'entites/desktop/EntiteView',
      mobilePath: 'entites/mobile/EntiteView'
    });
  }, [responsive.isMobile, responsive.getResponsiveComponent]);
  
  // BONNE PRATIQUE: Passer le hook complet aux composants enfants
  return <EntiteView id={id} detailsHook={detailsHook} />;
}
```

## Patterns à éviter

### 1. Création dynamique sans mémorisation

❌ **À ÉVITER**:
```javascript
function MonComposant() {
  const responsive = useResponsive();
  
  // À chaque rendu, un nouveau composant est créé
  const DynamicComponent = responsive.getResponsiveComponent({...});
  
  return <DynamicComponent />;
}
```

✅ **PRÉFÉRER**:
```javascript
function MonComposant() {
  const responsive = useResponsive();
  
  // Le composant n'est créé que lorsque isMobile change
  const DynamicComponent = useMemo(() => {
    return responsive.getResponsiveComponent({...});
  }, [responsive.isMobile, responsive.getResponsiveComponent]);
  
  return <DynamicComponent />;
}
```

### 2. Wrapper components excessifs

❌ **À ÉVITER**:
```javascript
// Trop de wrappers qui augmentent la complexité
const StableContainer = ({ id }) => {
  const MyComponent = responsive.getResponsiveComponent({...});
  return <MyComponent id={id} />;
};

function EntiteDetails() {
  return <StableContainer id={id} />;
}
```

✅ **PRÉFÉRER**:
```javascript
function EntiteDetails() {
  const DynamicComponent = useMemo(() => 
    responsive.getResponsiveComponent({...}), 
    [responsive.isMobile, responsive.getResponsiveComponent]
  );
  
  return <DynamicComponent id={id} />;
}
```

### 3. Logs de débogage excessifs

❌ **À ÉVITER**:
```javascript
console.log('[DEBUG-PROBLEME]', 'Montage du composant', instanceId);
console.log('[DIAGNOSTIC]', 'État actuel:', state);
```

✅ **PRÉFÉRER**:
```javascript
// Logs formatés et concis avec préfixe [INFO]
console.log('[INFO]', 'Montage du composant pour ID:', id);
```

## Fonctionnalités avancées

### 1. Nettoyage du cache

```javascript
// Pour vider le cache de composants (utile en développement)
responsive.clearComponentCache();
```

### 2. Réagir aux changements de dimensions

```javascript
// Écouter les changements de dimensions
useEffect(() => {
  console.log('Dimensions modifiées:', responsive.dimensions);
}, [responsive.dimensions]);
```

### 3. Utilisation avec les media queries CSS

```javascript
// Combiner avec les media queries pour une expérience encore plus fluide
const containerStyle = {
  transition: 'all 0.3s ease',
  padding: responsive.isMobile ? '8px' : '16px',
};
```

## Débogage

En cas de problème lors du chargement d'un composant dynamique, le hook affichera désormais :

1. Des logs clairs indiquant la tentative en cours et le délai avant le prochain essai
2. Un composant d'erreur explicite avec :
   - Le chemin du composant qui a échoué au chargement
   - Un bouton pour réessayer sans recharger la page
   - Un bouton pour recharger la page complète si nécessaire

## Conclusion

Ces améliorations du hook `useResponsive` et l'adoption de ces bonnes pratiques devraient considérablement améliorer la stabilité de l'application lors des transitions entre les modes desktop et mobile. Les composants responsifs seront chargés de manière plus efficace et plus fiable, avec une meilleure gestion des erreurs et une expérience utilisateur améliorée.

Pensez à utiliser systématiquement `useMemo` pour les composants chargés dynamiquement et `React.memo` pour les composants conteneurs afin d'optimiser les performances.