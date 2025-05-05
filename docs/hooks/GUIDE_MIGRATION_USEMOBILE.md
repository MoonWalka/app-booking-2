# Guide de Migration de useIsMobile vers useResponsive

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

Ce guide explique comment migrer du hook déprécié `useIsMobile` vers le hook unifié `useResponsive` qui offre des fonctionnalités plus avancées et une meilleure performance.

## Contexte

Le hook `useIsMobile` est en cours de dépréciation au profit du hook plus complet `useResponsive` qui a déjà été implémenté dans `/src/hooks/common/useResponsive.js`. Ce nouveau hook combine les fonctionnalités de `useIsMobile` et `useResponsiveComponent` tout en offrant des options plus flexibles et des fonctionnalités supplémentaires.

## Avantages de useResponsive

Le hook `useResponsive` offre plusieurs avantages par rapport à `useIsMobile` :

1. **Options de configuration avancées** :
   - Breakpoint personnalisable
   - Option pour forcer le mode desktop quelle que soit la taille d'écran

2. **API plus riche** :
   - Dimensions précises de l'écran (`width` et `height`)
   - Fonctions utilitaires pour la vérification responsive
   - Détection dynamique des changements de taille d'écran

3. **Chargement dynamique de composants** :
   - Chargement conditionnel de composants mobiles ou desktop
   - Gestion des erreurs et fallbacks
   - Suspense intégré pour les transitions fluides

4. **Performance améliorée** :
   - Utilisation de useCallback et useMemo pour optimiser les rendus
   - Debounce intégré pour limiter les appels lors des redimensionnements

## Exemples de Migration

### Cas simple : Remplacement direct

#### Avant :

```javascript
import { useIsMobile } from '@/hooks/useIsMobile';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? 'mobile-container' : 'desktop-container'}>
      {isMobile ? 'Vue mobile' : 'Vue desktop'}
    </div>
  );
}
```

#### Après :

```javascript
import { useResponsive } from '@/hooks/common';

function MyComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <div className={isMobile ? 'mobile-container' : 'desktop-container'}>
      {isMobile ? 'Vue mobile' : 'Vue desktop'}
    </div>
  );
}
```

### Cas avancé : Utilisation des dimensions précises

#### Avant :

```javascript
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';

function MyComponent() {
  const isMobile = useIsMobile();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div>
      <p>Est mobile : {isMobile ? 'Oui' : 'Non'}</p>
      <p>Largeur de l'écran : {windowWidth}px</p>
    </div>
  );
}
```

#### Après :

```javascript
import { useResponsive } from '@/hooks/common';

function MyComponent() {
  const { isMobile, dimensions } = useResponsive();
  
  return (
    <div>
      <p>Est mobile : {isMobile ? 'Oui' : 'Non'}</p>
      <p>Largeur de l'écran : {dimensions.width}px</p>
      <p>Hauteur de l'écran : {dimensions.height}px</p>
    </div>
  );
}
```

### Cas complexe : Chargement dynamique de composants

#### Avant (sans chargement dynamique) :

```javascript
import { useIsMobile } from '@/hooks/useIsMobile';
import DesktopView from './Desktop/DesktopView';
import MobileView from './Mobile/MobileView';

function MyComponent(props) {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileView {...props} /> : <DesktopView {...props} />;
}
```

#### Après (avec chargement dynamique) :

```javascript
import { useResponsive } from '@/hooks/common';

function MyComponent(props) {
  const { getResponsiveComponent } = useResponsive();
  
  const ResponsiveView = getResponsiveComponent({
    desktopPath: 'path/to/DesktopView',
    mobilePath: 'path/to/MobileView',
    fallback: <div>Chargement en cours...</div> // Optionnel
  });
  
  return <ResponsiveView {...props} />;
}
```

### Cas spécial : Force Desktop Mode

```javascript
import { useResponsive } from '@/hooks/common';

function MyAdminComponent() {
  // Force le mode desktop même sur mobile pour l'interface admin
  const { isMobile } = useResponsive({ forceDesktop: true });
  
  // isMobile sera toujours false grâce à forceDesktop: true
  return (
    <div className="admin-interface">
      <AdminPanel />
    </div>
  );
}
```

## Exemple concret : Migration de ContratGenerator.js

### Avant :

```javascript
import { useIsMobile } from '@/hooks/useIsMobile';

const ContratGenerator = ({ concertId }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`contrat-generator ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile ? (
        <div className="mobile-warning">
          La génération de contrats est optimisée pour ordinateur
        </div>
      ) : null}
      <h2>Générateur de contrat</h2>
      {/* Contenu du générateur */}
    </div>
  );
};
```

### Après :

```javascript
import { useResponsive } from '@/hooks/common';

const ContratGenerator = ({ concertId }) => {
  const { isMobile, dimensions } = useResponsive();
  
  // Utilisation des dimensions pour adapter l'interface
  const isSmallScreen = dimensions.width < 500;
  
  return (
    <div className={`contrat-generator ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile ? (
        <div className="mobile-warning">
          La génération de contrats est optimisée pour ordinateur
        </div>
      ) : null}
      <h2>Générateur de contrat</h2>
      {/* Adaptation du contenu selon la taille exacte */}
      {isSmallScreen ? (
        <SimplifiedContratForm concertId={concertId} />
      ) : (
        <FullContratForm concertId={concertId} />
      )}
    </div>
  );
};
```

## Options de Configuration

Le hook `useResponsive` accepte un objet de configuration avec les options suivantes :

| Option | Type | Par défaut | Description |
|--------|------|------------|-------------|
| `breakpoint` | number | 768 | Seuil en pixels pour considérer un affichage mobile |
| `forceDesktop` | boolean | false | Force l'affichage desktop même sur mobile |

## API complète de useResponsive

Le hook `useResponsive` retourne un objet avec les propriétés suivantes :

| Propriété | Type | Description |
|-----------|------|-------------|
| `isMobile` | boolean | Indique si l'affichage est en mode mobile |
| `isDesktop` | boolean | Indique si l'affichage est en mode desktop (inverse de `isMobile`) |
| `dimensions` | object | Dimensions de l'écran (`{ width: number, height: number }`) |
| `updateDimensions` | function | Fonction pour mettre à jour manuellement les dimensions |
| `checkIsMobile` | function | Fonction pour vérifier si une largeur donnée est considérée comme mobile |
| `getResponsiveComponent` | function | Fonction pour créer un composant dynamiquement chargé selon le mode |
| `screenWidth` | number | Raccourci pour `dimensions.width` |
| `screenHeight` | number | Raccourci pour `dimensions.height` |

## Plan de Transition

Pour faciliter la migration, nous suivons un plan de transition en trois phases :

1. **Phase immédiate (d'ici le 7 mai 2025)** :
   - Migration des composants qui utilisent encore activement `useIsMobile`
   - Création de ce guide de migration
   - Mise à jour des tests unitaires

2. **Phase intermédiaire (8-15 mai 2025)** :
   - `useIsMobile.js` sera transformé en simple wrapper autour de `useResponsive`
   - Surveillance des journaux d'erreur pour détecter des utilisations non documentées
   - Ajout de warnings dans la console pour encourager la migration

3. **Phase finale (après le 15 mai 2025)** :
   - Suppression complète de `useIsMobile.js`
   - Mise à jour de toute la documentation qui pourrait encore y faire référence

## Cas particuliers et solutions

### Problème : Besoin de forcer le mode desktop

**Solution :** Utiliser l'option `forceDesktop` de `useResponsive` :

```javascript
const { isMobile } = useResponsive({ forceDesktop: true });
```

### Problème : Breakpoint personnalisé

**Solution :** Utiliser l'option `breakpoint` de `useResponsive` :

```javascript
const { isMobile } = useResponsive({ breakpoint: 1024 }); // Considère mobile en dessous de 1024px
```

### Problème : Besoin d'accéder au context dans un composant chargé dynamiquement

**Solution :** Encapsuler avec les providers nécessaires :

```javascript
const ResponsiveView = getResponsiveComponent({
  desktopPath: 'path/to/DesktopView',
  mobilePath: 'path/to/MobileView'
});

return (
  <MyContext.Provider value={contextValue}>
    <ResponsiveView {...props} />
  </MyContext.Provider>
);
```

## Conclusion

La migration de `useIsMobile` vers `useResponsive` offre de nombreux avantages en termes de fonctionnalités et de performances. En suivant ce guide, vous pourrez facilement adapter vos composants pour tirer parti de ces améliorations tout en maintenant la compatibilité avec le code existant.

Pour toute question ou assistance supplémentaire, contactez l'équipe de développement frontend.

---

*Document préparé par l'équipe Documentation*
*Pour toute question: documentation@tourcraft.com*