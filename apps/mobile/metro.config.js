const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Metro needs the workspace root in watchFolders to correctly resolve hoisted node_modules
// and anchor the project root when traversing npm workspaces.
config.watchFolders = [
  workspaceRoot,
  path.resolve(workspaceRoot, 'packages/contracts'),
  path.resolve(workspaceRoot, 'packages/ui'),
];

// Tell Metro where to find hoisted node_modules (npm workspaces hoist everything to root).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// @supabase/supabase-js does an optional `import("@opentelemetry/api")` for
// telemetry we don't use; Metro can't resolve the un-installed optional dep.
// Stub it to an empty module so bundling succeeds. ponytail: install the real
// otel package only if we ever want Supabase tracing.
const emptyModule = require.resolve('./metro-empty.js');
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  return (originalResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
