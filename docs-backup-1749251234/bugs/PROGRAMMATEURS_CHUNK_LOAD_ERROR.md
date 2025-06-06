# Problème de chargement des chunks Programmateurs

## Symptômes

- Erreurs `ChunkLoadError` lors du chargement de `programmateurs-desktop-ProgrammateursList.chunk.js`.
- Tentatives de retry automatiques (1/4, 2/4, …) échouent.
- Fallback Suspense persistant sans affichage du composant.
- Erreur réseau sur WebSocket (HMR) : `ws://localhost:3000/ws` non connecté.

## Causes possibles

1. **Chunks non générés ou mal publiés** : le build n’inclut pas la version desktop ou le chemin public (`publicPath`) est incorrect.
2. **Configuration du serveur de développement** : CRACO/webpack-dev-server ne sert pas les fichiers `.chunk.js` à la racine attendue.
3. **WebSocket HMR** : la connexion WebSocket personnalisée (`ws://localhost:3000/ws`) est inaccessible, causant des interruptions dans le rechargement à chaud.

## Solutions et vérifications

1. Vérifier que le dossier `build/static/js/` contient bien les chunks nommés `programmateurs-desktop-ProgrammateursList.chunk.js` après `npm run build`.
2. S’assurer que la propriété `publicPath` dans `craco.config.js` (ou `webpack.config.js`) pointe vers `/static/js/` :
   ```js
   webpackConfig.output.publicPath = '/';
   ```
3. Pour le développement, retirer ou ajuster le `webSocketURL` si HMR n’est pas nécessaire :
   ```js
   devServer.client.webSocketURL = 'auto';
   ```
4. Recharger complètement l’application (CTRL+F5) et vider le cache du navigateur.
5. Désactiver temporairement le lazy-loading desktop : importer directement `ProgrammateursList` pour isoler l’erreur.

---
*Ce document est généré automatiquement suite à l’observation des logs de la console sur la page Programmateur.*