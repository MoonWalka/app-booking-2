const path = require('path');

module.exports = {
  // Répertoires où Jest cherchera les modules
  roots: ['<rootDir>/src'],
  
  // Les extensions de fichier que Jest doit considérer
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  
  // Les répertoires à ignorer
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  
  // Mappage des modules pour résoudre les imports commençant par @/
  moduleNameMapper: {
    // Alias standard - correction du regex pour s'assurer qu'il fonctionne correctement
    '^@/(.*)$': '<rootDir>/src/$1',
    // Alias spécifiques (pour compatibilité avec le code existant)
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    // Pour les imports de style (optionnel)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // L'environnement de test
  testEnvironment: 'jsdom',
  
  // Configuration pour le setup de test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // La couverture du code (optionnel)
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],
  
  // Transformations (si nécessaire)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // Configuration des modules
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Ajouter les emplacements de résolution des modules pour faciliter la résolution des imports
  modulePaths: [path.resolve(__dirname, 'src')],
  
  // Assurer que Jest trouve correctement les modules
  moduleDirectories: ['node_modules', 'src']
}