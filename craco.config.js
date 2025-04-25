const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@': path.resolve(__dirname, 'src')
    },
    configure: (webpackConfig, { env }) => {
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
      
      return webpackConfig;
    }
  },
  // Configuration correcte du serveur de développement compatible avec webpack-dev-server
  devServer: {
    hot: true,
    liveReload: false,
    // Utiliser watchFiles au lieu de watchOptions
    watchFiles: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.css'],
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 3000,
      },
      reconnect: 5,
    }
  }
};
