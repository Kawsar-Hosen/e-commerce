/**
 * Metro configuration for the SHOBDOX monorepo.
 *
 * The app consumes the workspace packages (`@shobdox/*`) as raw TypeScript
 * source rather than built output, so Metro has to be told about the monorepo
 * layout in four places — each one explained below.
 */
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole workspace: the shared packages live outside this project
//    directory, and Metro only picks up file changes from watched folders.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from this app first, then from the hoisted root store, so
//    symlinked workspace packages keep working with pnpm's isolated layout.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. `@shobdox/*` are symlinks into `packages/*`; Metro must follow them
//    instead of treating the real path as being outside the project.
config.resolver.unstable_enableSymlinks = true;

// 4. The packages expose `./src/*.ts` through their `exports` map, so package
//    exports must be honoured when resolving their entry points.
config.resolver.unstable_enablePackageExports = true;

// expo-router discovers the `app/` directory through `require.context`.
config.transformer.unstable_allowRequireContext = true;

/**
 * `@/…` alias support.
 *
 * Metro does not read tsconfig `paths`. The app uses relative imports so this is
 * only a safety net for editor-generated imports, but keeping it here means the
 * alias in tsconfig.json behaves identically at runtime.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(
      context,
      path.join(projectRoot, moduleName.slice(2)),
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
