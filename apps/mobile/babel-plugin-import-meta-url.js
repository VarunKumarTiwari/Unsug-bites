// Local Babel plugin: rewrite `import.meta.url` → `self.location.href`.
//
// Why: maplibre-gl (web map) uses `import.meta.url` to resolve its worker blob
// URL. babel-preset-expo doesn't transform it for the Metro web target, so the
// raw `import.meta` reaches the browser and throws "Cannot use 'import.meta'
// outside a module". The npm `babel-plugin-transform-import-meta` only emits
// Node's `__filename` (even in ES6 mode) → "ReferenceError: __filename" in the
// browser/worker. `self.location.href` is correct in both the main thread and a
// web worker, which is exactly what maplibre needs. ponytail: 10-line local
// plugin beats a dependency that can't target the browser.
module.exports = function importMetaUrlToSelfLocation({ types: t }) {
  return {
    name: 'import-meta-url-to-self-location',
    visitor: {
      MetaProperty(path) {
        // Match `import.meta` and replace the enclosing `import.meta.url`.
        if (path.node.meta.name !== 'import' || path.node.property.name !== 'meta') return;
        const parent = path.parentPath;
        if (parent.isMemberExpression() && parent.node.property.name === 'url') {
          parent.replaceWithSourceString('self.location.href');
        }
      },
    },
  };
};
