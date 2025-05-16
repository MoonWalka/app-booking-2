# [ARCHIVÉ] # Guide de Migration de useIsMobile vers useResponsive

*Document archivé le: 16 May 2025*
*Ce document a été archivé car il concerne une initiative terminée ou n'est plus à jour.*


*Document créé le: 5 mai 2025*
*Dernière mise à jour: 6 mai 2025*

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

5. **Maintenabilité accrue** :
   - API unifiée et cohérente
   - Meilleure documentée
   - Standardisation des approches responsive

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

## Exemples concrets des migrations réalisées dans TourCraft

### Migration de ContratGenerator.js

#### Avant :

```javascript
// src/components/contrats/ContratGenerator.js
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import DesktopContratGenerator from './desktop/ContratGenerator';

function ContratGenerator(props) {
  const isMobile = useIsMobile();
  
  return <DesktopContratGenerator {...props} />;
}
```

#### Après :

```javascript
// src/components/contrats/ContratGenerator.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';
import DesktopContratGenerator from './desktop/ContratGenerator';

function ContratGenerator(props) {
  const { isMobile } = useResponsive();
  
  return <DesktopContratGenerator {...props} />;
}
```

### Migration de ContratTemplateEditor.js

#### Avant :

```javascript
// src/components/contrats/ContratTemplateEditor.js
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import DesktopContratTemplateEditor from './desktop/ContratTemplateEditor';

function ContratTemplateEditor(props) {
  const { isModal, ...otherProps } = props;
  const isMobile = useIsMobile();
  
  return (
    <DesktopContratTemplateEditor 
      {...otherProps} 
      isModalContext={isModal === true}
    />
  );
}
```

#### Après :

```javascript
// src/components/contrats/ContratTemplateEditor.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';
import DesktopContratTemplateEditor from './desktop/ContratTemplateEditor';

function ContratTemplateEditor(props) {
  const { isModal, ...otherProps } = props;
  const { isMobile } = useResponsive();
  
  return (
    <DesktopContratTemplateEditor 
      {...otherProps} 
      isModalContext={isModal === true}
    />
  );
}
```

### Migration des composants façades - Mise à jour du 6 mai 2025

Plusieurs composants façades qui utilisaient encore l'ancien hook `useResponsiveComponent` ont été mis à jour pour utiliser `useResponsive().getResponsiveComponent`. Cette migration assure la cohérence du code et élimine les avertissements de dépréciation dans la console.

#### Composants mis à jour:

1. **Modules d'artistes**:
   - `ArtistesList.js`
   - `ArtisteDetail.jsx`
   - `ArtisteForm.js` / `ArtisteForm.jsx`

2. **Modules de structures**:
   - `StructuresList.js`
   - `StructureDetails.js`

3. **Modules de lieux**:
   - `LieuxList.js`
   - `LieuForm.js`

4. **Modules divers**:
   - `FormValidationInterface.js`
   - `ConcertsList.js`
   - Commentaires mis à jour dans `Layout.js`

#### Exemple de migration:

##### Avant:

```javascript
// src/components/lieux/LieuxList.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';
import Spinner from '@/components/common/Spinner';

function LieuxList(props) {
  // Create a custom fallback with our standardized Spinner component
  const customFallback = <Spinner message="Chargement de la liste des lieux..." contentOnly={true} />;
  
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuxList',
    mobilePath: 'lieux/mobile/LieuxList',
    fallback: customFallback
  });
  
  return <ResponsiveComponent {...props} />;
}
```

##### Après:

```javascript
// src/components/lieux/LieuxList.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';
import Spinner from '@/components/common/Spinner';

function LieuxList(props) {
  // Create a custom fallback with our standardized Spinner component
  const customFallback = <Spinner message="Chargement de la liste des lieux..." contentOnly={true} />;
  
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuxList',
    mobilePath: 'lieux/mobile/LieuxList',
    fallback: customFallback
  });
  
  return <ResponsiveComponent {...props} />;
}
```

#### Approches utilisées:

1. **Approche avec destructuration (recommandée)**: 
   ```javascript
   const { getResponsiveComponent } = useResponsive();
   const ResponsiveComponent = getResponsiveComponent({ ... });
   ```

2. **Approche alternative**:
   ```javascript
   const responsive = useResponsive();
   const ResponsiveComponent = responsive.getResponsiveComponent({ ... });
   ```

Les deux approches sont valides, mais la première est plus concise et aligne le code sur le style préféré du projet.

## Options de Configuration

Le hook `useResponsive` accepte un objet de configuration avec les options suivantes :

| Option | Type | Par défaut | Description |
|--------|------|------------|-------------|
| `breakpoint` | number | 768 | Seuil en pixels pour considérer un affichage mobile |
| `forceDesktop` | boolean | false | Force l'affichage desktop même sur mobile |

## API complète de useResponsive

Le hook retourne un objet avec les propriétés et méthodes suivantes :

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `isMobile` | boolean | Indique si l'écran actuel est considéré comme mobile |
| `dimensions` | object | Objet contenant la largeur (`width`) et la hauteur (`height`) de la fenêtre |
| `updateDimensions` | function | Force la mise à jour des dimensions et du statut mobile |
| `checkIsMobile` | function | Vérifie si une largeur donnée est considérée comme mobile |
| `getResponsiveComponent` | function | Charge dynamiquement le composant mobile ou desktop approprié |

## Plan de Transition

Pour faciliter la migration, nous suivons un plan de transition en trois phases :

1. **Phase immédiate (d'ici le 7 mai 2025) ✅** :
   - Migration des composants qui utilisent encore activement `useIsMobile`
   - Création de ce guide de migration
   - Mise à jour des tests unitaires

2. **Phase intermédiaire (8-15 mai 2025) 🔄** :
   - `useIsMobile.js` sera transformé en simple wrapper autour de `useResponsive`
   - Surveillance des journaux d'erreur pour détecter des utilisations non documentées
   - Ajout de warnings dans la console pour encourager la migration

3. **Phase finale (après le 15 mai 2025) 📝** :
   - Suppression complète de `useIsMobile.js`
   - Mise à jour de toute la documentation qui pourrait encore y faire référence
   - Suppression des avertissements obsolètes dans le code

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

**Solution :** Utiliser React.lazy directement avec un contexte explicite :

```javascript
const ContextualComponent = React.lazy(() => import('./path/to/Component'));

function MyComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <MyContext.Provider value={contextValue}>
      <React.Suspense fallback={<Spinner />}>
        {isMobile ? <MobileView /> : <ContextualComponent />}
      </React.Suspense>
    </MyContext.Provider>
  );
}
```

## Conclusion

La migration vers `useResponsive` permettra une meilleure cohérence dans notre codebase, des performances accrues et une meilleure expérience développeur. N'hésitez pas à consulter l'équipe responsable de la migration si vous avez des questions spécifiques.

Si vous rencontrez des obstacles ou des cas d'utilisation non couverts par ce guide, veuillez les signaler à l'équipe Documentation pour que nous puissions enrichir ce document.

---

*Document préparé par l'équipe Documentation*
*Pour toute question: documentation@tourcraft.com*