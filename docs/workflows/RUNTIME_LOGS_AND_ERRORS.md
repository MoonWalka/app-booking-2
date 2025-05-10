# Gestion des Logs et Erreurs de Runtime

Ce document décrit les réglages et bonnes pratiques pour traiter :
- Les connexions WebSocket HMR (webpack-dev-server)
- Le chargement des sourcemaps en développement
- La gestion des Lazy/ChunkLoadError via ErrorBoundary
- Les warnings React Router Future Flags
- Le filtrage des niveaux de logs via `LOG_LEVEL`

---

## 1. Hot Module Replacement (HMR)

Le serveur de développement utilise webpack-dev-server pour HMR. Pour éviter l’erreur :

```text
WebSocket connection to 'ws://localhost:3000/ws' failed
```

- Dans `craco.config.js`, section `devServer.client.webSocketURL`, utiliser un string :

```js
client: {
  webSocketURL: 'ws://localhost:3000/ws',
  reconnect: 5,
}
```

- Vérifier que `hot: true` et `liveReload: false` sont définis.

---

## 2. Sourcemaps en Développement

Pour pouvoir déboguer efficacement et charger les `.map` :

- Activer les sourcemaps dans la config Webpack (via CRACO) :

```js
webpackConfig.devtool = env === 'production' ? false : 'source-map';
```

- Servir les fichiers `.js.map` depuis le build local ou via le serveur de développement.

---

## 3. Gestion des Erreurs de Lazy Loading

Les `ChunkLoadError` peuvent survenir lors du code-splitting.

- Un `ErrorBoundary` global est déjà en place dans `App.js` :
  - Tente jusqu’à 2 rechargements automatiques
  - Affiche un message et un bouton "Réessayer"

- Exemple de structure :

```jsx
<ErrorBoundary>
  <Router>
    {/* ...routes avec <Suspense> ... */}
  </Router>
</ErrorBoundary>
```

---

## 4. React Router Future Flags

Pour supprimer les warnings :

```js
window.REACT_ROUTER_FUTURE = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
```

Ces flags peuvent être positionnés avant l’instanciation du Router (dans `App.js`).

---

## 5. Filtrage des Logs

Les logs de développement (`console.log`, `console.debug`) peuvent être bruyants.

- Utiliser une variable d’environnement `LOG_LEVEL` :

  - `error` : affiche uniquement les erreurs
  - `warn` : affiche erreurs + warnings
  - `info` : ajoute les infos
  - `debug` : affiche tout (défaut en développement)

- Exemple d’utilisation dans `src/utils/logger.js` :

```js
const levelOrder = ['error','warn','info','debug'];
const currentLevel = process.env.LOG_LEVEL || 'debug';

export function debug(...args) {
  if (levelOrder.indexOf(currentLevel) >= levelOrder.indexOf('debug')) {
    console.debug(...args);
  }
}
// idem pour info, warn, error
```

- Remplacer les `console.log` critiques par ce logger.

---

## 6. Vérification et Suivi

- Exécuter un build local et vérifier l’absence d’erreur de sourcemap et de WebSocket.
- Surveiller les logs via `npm run detect-deprecated-hooks --verbose` pour s’assurer qu’aucun appel direct à un hook déprécié n’apparaît.
- Intégrer ces contrôles dans la CI (GitHub Actions) avec un job `audit:runtime-logs`.
