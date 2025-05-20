const path = require('path');

module.exports = {
  babel: {
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': path.resolve(__dirname, 'src'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@hooks': path.resolve(__dirname, 'src/hooks'),
          '@context': path.resolve(__dirname, 'src/context'),
          '@utils': path.resolve(__dirname, 'src/utils'),
          '@styles': path.resolve(__dirname, 'src/styles'),
          '@services': path.resolve(__dirname, 'src/services'),
          '@pages': path.resolve(__dirname, 'src/pages'),
          '@ui': path.resolve(__dirname, 'src/components/ui')
        }
      }]
    ]
  },
  webpack: {
    alias: {
      // Les alias suivants sont dépréciés et seront progressivement remplacés par @/
      // À terme, seul @/ sera conservé comme standard d'imports
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      // Alias standard à utiliser pour tous les nouveaux imports
      '@': path.resolve(__dirname, 'src')
    },
    configure: (webpackConfig, { env }) => {
      // Ensure chunks are served from /static/js/ to match dev server static paths
      webpackConfig.output.publicPath = '/';
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "path": false,
        "fs": false,
        "os": false
      };
      
      // Ajouter l'extension .css à resolve.extensions
      if (!webpackConfig.resolve.extensions) {
        webpackConfig.resolve.extensions = [];
      }
      if (!webpackConfig.resolve.extensions.includes('.css')) {
        webpackConfig.resolve.extensions.push('.css');
      }
      
      // Désactiver React Refresh en production
      if (env === 'production') {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => !plugin.constructor.name.includes('ReactRefreshPlugin')
        );
      }
      
      // Activer les sourcemaps pour le développement
      webpackConfig.devtool = env === 'production' ? false : 'source-map';
      
      return webpackConfig;
    }
  },
  // Configuration Jest pour les tests
  jest: {
    configure: {
      // Les répertoires où Jest cherchera les modules
      roots: ['<rootDir>/src'],
      
      // Les extensions de fichier que Jest doit considérer
      testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
      
      // Les répertoires à ignorer
      testPathIgnorePatterns: ['/node_modules/', '/build/'],
      
      // Mappage des modules pour résoudre les imports avec alias
      moduleNameMapper: {
        // Alias standard
        '^@/(.*)$': '<rootDir>/src/$1',
        // Alias spécifiques
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@context/(.*)$': '<rootDir>/src/context/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@styles/(.*)$': '<rootDir>/src/styles/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        // Pour les imports de style
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
      
      // L'environnement de test
      testEnvironment: 'jsdom',
      
      // Configuration pour le setup de test
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      
      // La couverture du code
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.js',
        '!src/reportWebVitals.js',
        '!src/setupTests.js'
      ],
      
      // Transformations
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
      },
      
      // Configuration des modules
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
      
      // Option pour résoudre les modules avec alias
      moduleDirectories: ['node_modules', 'src']
    }
  }
};
