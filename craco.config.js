module.exports = {
  // Configuration minimale sans alias
  webpack: {
    configure: (webpackConfig) => {
      // Polyfills minimaux si nécessaire
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "path": false,
        "fs": false,
        "os": false
      };
      return webpackConfig;
    }
  }
};
