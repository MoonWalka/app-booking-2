const fs = require('fs');
const path = require('path');

// Lire les dépendances circulaires
const circularDeps = fs.readFileSync('./circular_deps_analysis/circular_deps.txt', 'utf8')
  .split('\n')
  .filter(Boolean);

// Analyser chaque chaîne de dépendance
const analyses = circularDeps.map(depChain => {
  // Extraire les fichiers impliqués
  const files = depChain.split(' -> ');
  
  // Analyser le type de dépendance circulaire
  let type = 'Indéterminé';
  let solution = '';
  
  // Vérifier si les fichiers existent
  const fileContents = files.map(file => {
    try {
      return fs.readFileSync(file, 'utf8');
    } catch (e) {
      return null;
    }
  });
  
  // Analyse des composants React
  const isReactComponent = files.some(file => 
    file.includes('/components/') && 
    (file.endsWith('.jsx') || fileContents.some(content => content && content.includes('React')))
  );
  
  // Analyse des services
  const isService = files.some(file => 
    file.includes('/services/') || 
    fileContents.some(content => content && content.includes('export const') && content.includes('Service'))
  );
  
  // Analyse des contextes
  const isContext = files.some(file => 
    file.includes('Context') || 
    fileContents.some(content => content && content.includes('createContext'))
  );
  
  // Déterminer le type et proposer des solutions
  if (isReactComponent) {
    type = 'Composants React';
    solution = `
1. **Injection de props**: Passez les composants en tant que props plutôt que de les importer directement
   \`\`\`jsx
   // Au lieu de
   import { ComponentB } from './FileB';
   export const ComponentA = () => <div><ComponentB /></div>;
   
   // Utilisez
   export const ComponentA = ({ ComponentB }) => <div><ComponentB /></div>;
   \`\`\`

2. **Composant d'ordre supérieur (HOC)**: Créez un HOC qui injecte les dépendances
   \`\`\`jsx
   export const withDependencies = (Component) => {
     return (props) => {
       // Injecter les dépendances nécessaires
       return <Component {...props} dependency={...} />;
     };
   };
   \`\`\`

3. **Module commun**: Extrayez la logique commune dans un module partagé
   \`\`\`jsx
   // shared.js
   export const useSharedLogic = () => {
     // Logique commune...
     return { data, actions };
   };
   \`\`\`
`;
  } else if (isService) {
    type = 'Services';
    solution = `
1. **Fusionner les services**: Combinez les services en conflit en un seul module
   \`\`\`javascript
   // combinedService.js
   export const serviceA = { ... };
   export const serviceB = { ... };
   
   // Fonctions internes partagées
   function sharedFunction() { ... }
   \`\`\`

2. **Import dynamique**: Utilisez des imports dynamiques pour éviter les dépendances statiques
   \`\`\`javascript
   export const serviceA = {
     method: async () => {
       const { serviceB } = await import('./serviceB');
       return serviceB.method();
     }
   };
   \`\`\`

3. **Injection de dépendances**: Passez les dépendances comme paramètres
   \`\`\`javascript
   export const createServiceA = (serviceB) => ({
     method: () => serviceB.method()
   });
   \`\`\`
`;
  } else if (isContext) {
    type = 'Contextes React';
    solution = `
1. **Contexte unifié**: Créez un contexte parent qui contient toutes les données nécessaires
   \`\`\`jsx
   // AppContext.js
   export const AppContext = createContext();
   export const AppProvider = ({ children }) => {
     // Initialiser toutes les données nécessaires
     return (
       <AppContext.Provider value={{ auth: {...}, user: {...} }}>
         {children}
       </AppContext.Provider>
     );
   };
   \`\`\`

2. **Hiérarchie de contextes**: Établissez une hiérarchie claire des contextes
   \`\`\`jsx
   // RootContext -> AuthContext -> UserContext
   // Chaque niveau ne dépend que des niveaux supérieurs
   \`\`\`
`;
  } else {
    type = 'Dépendance générique';
    solution = `
1. **Restructuration**: Réorganisez votre code pour éliminer les dépendances circulaires

2. **Module partagé**: Extrayez la logique commune dans un module partagé
   \`\`\`javascript
   // shared.js
   export const sharedFunctions = { ... };
   \`\`\`

3. **Dynamic imports**: Utilisez des imports dynamiques pour briser les cycles
   \`\`\`javascript
   export const myFunction = async () => {
     const module = await import('./otherModule');
     return module.someFunction();
   };
   \`\`\`
`;
  }
  
  return {
    depChain,
    files,
    type,
    solution
  };
});

// Générer un rapport
let report = '# Analyse des dépendances circulaires\n\n';

analyses.forEach((analysis, index) => {
  report += `## Cycle ${index + 1}: ${analysis.type}\n\n`;
  report += `**Dépendance circulaire:**\n\`\`\`\n${analysis.depChain}\n\`\`\`\n\n`;
  report += `**Fichiers impliqués:**\n`;
  analysis.files.forEach(file => {
    report += `- ${file}\n`;
  });
  report += `\n**Solutions recommandées:**\n${analysis.solution}\n\n`;
});

report += `## Conclusion\n\n`;
report += `Pour résoudre ces dépendances circulaires:\n\n`;
report += `1. Commencez par la solution la moins invasive (injection de props, imports dynamiques)\n`;
report += `2. Si cela ne suffit pas, restructurez en créant des modules partagés\n`;
report += `3. Dans les cas extrêmes, envisagez une refactorisation plus importante\n\n`;
report += `Après chaque modification, vérifiez si les dépendances circulaires ont été résolues en exécutant:\n\`\`\`bash\nmadge --circular src/\n\`\`\`\n`;

fs.writeFileSync('./circular_deps_analysis/solutions.md', report);
console.log('Analyse terminée. Voir solutions.md pour les recommandations détaillées.');
