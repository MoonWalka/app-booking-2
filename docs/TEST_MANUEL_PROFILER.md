# Test manuel du React Profiler

## 1. Vérifier que le ProfilerMonitor est visible

1. Lancez l'application en mode développement
2. Regardez en bas à droite de l'écran - vous devriez voir le ProfilerMonitor
3. Si vous ne le voyez pas, vérifiez que `NODE_ENV=development`

## 2. Test dans la console du navigateur

Ouvrez la console (F12) et exécutez ces commandes :

```javascript
// 1. Vérifier que les variables globales existent
console.log('PROFILER_STATS existe ?', typeof window.PROFILER_STATS);
console.log('recordProfilerData existe ?', typeof window.recordProfilerData);

// 2. Tester manuellement l'enregistrement
if (window.recordProfilerData) {
  window.recordProfilerData('Test-Component', 'mount', 10.5);
  window.recordProfilerData('Test-Component', 'update', 15.2);
  window.recordProfilerData('Test-Component', 'update', 12.8);
  console.log('Données enregistrées:', window.PROFILER_STATS);
}

// 3. Vérifier les données dans le ProfilerMonitor
// Le composant "Test-Component" devrait apparaître dans le monitor
```

## 3. Navigation vers le formulaire

1. Allez sur `/concerts`
2. Cliquez sur "Ajouter un concert"
3. Dans la console, vérifiez les logs avec `🎭 Profiler`

## 4. Vérifier les composants chargés

Dans la console :

```javascript
// Voir tous les composants React chargés (avec React DevTools)
// Onglet Components > Rechercher "ConcertForm"

// Vérifier quel composant est réellement utilisé
console.log(document.querySelector('.concert-form-desktop'));
console.log(document.querySelector('[class*="ConcertForm"]'));
```

## 5. Problèmes courants et solutions

### Le ProfilerMonitor est vide

**Causes possibles :**
1. Le composant `ConcertForm` n'utilise pas les Profilers
2. L'import de `recordProfilerData` échoue
3. Le mauvais composant est chargé (mobile vs desktop)

**Solution rapide :**
Testez manuellement dans la console :
```javascript
// Simuler des données
for(let i = 0; i < 50; i++) {
  window.recordProfilerData('ConcertForm-Test', 'update', Math.random() * 100);
}
// Le monitor devrait se mettre à jour
```

### Les logs Profiler n'apparaissent pas

**Vérifiez :**
1. Que vous êtes bien sur la page d'édition de concert
2. Que le fond bleu apparaît (confirme que c'est le bon composant)
3. Les filtres de la console (ne pas filtrer les logs)

## 6. Analyse rapide des re-renders

Une fois sur la page d'édition, tapez dans la console :

```javascript
// Compter les logs de rendu
const logs = console.logs || [];
const renderLogs = logs.filter(log => log.includes('ConcertFormDesktop RENDER'));
console.log(`Nombre de rendus détectés: ${renderLogs.length}`);
```

## 7. Export des données

Pour exporter les données du ProfilerMonitor :
1. Cliquez sur le bouton 💾 dans le ProfilerMonitor
2. Ou dans la console : 
```javascript
const data = {
  timestamp: new Date().toISOString(),
  stats: window.PROFILER_STATS
};
console.log(JSON.stringify(data, null, 2));
``` 