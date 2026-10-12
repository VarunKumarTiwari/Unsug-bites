module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // maplibre-gl (web map) ships modern syntax that babel-preset-expo doesn't
      // transform on its own: static class blocks and import.meta.url. Both are
      // required for the web bundle to build and run without a blank-screen crash.
      '@babel/plugin-transform-class-static-block',
      // Rewrites import.meta.url → self.location.href (browser/worker-safe).
      // See babel-plugin-import-meta-url.js for why the npm plugin doesn't work.
      './babel-plugin-import-meta-url.js',
      'react-native-reanimated/plugin',
    ],
  };
};
