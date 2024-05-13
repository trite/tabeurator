module.exports = function override(config, env) {
  // Don't minify in development
  if (env === 'development') {
    config.optimization.minimize = false;
  }

  return config;
};