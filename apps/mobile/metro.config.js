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

module.exports = config;
