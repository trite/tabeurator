module.exports = function override(config, env) {
  // Do not use the production build in watch mode
  if (env === 'development') {
    config.optimization.minimize = false;
  }

  return config;
};