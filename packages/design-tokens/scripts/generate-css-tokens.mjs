/**
 * Generates the web design-token stylesheet from `src/tokens.ts`.
 *
 *   node scripts/generate-css-tokens.mjs
 *
 * Output: apps/web/src/styles/tokens.generated.css
 *
 * The generated file is consumed by Tailwind CSS v4 through the `@theme` block
 * (which turns every entry into both a utility class and a CSS variable) plus a
 * plain `:root` block for tokens Tailwind has no namespace for.
 *
 * `tokens.ts` is the single source of truth for the website *and* the React
 * Native app, so instead of duplicating values in CSS we compile the token
 * module with the repository's own TypeScript and import the emitted JS. This
 * keeps `npm run dev` and `npm run build` honest and dependency-free.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const repoRoot = resolve(pkgRoot, '../..');

/* ------------------------------------------------- 1. compile tokens.ts --- */

function compileTokens() {
  const tscBin = require.resolve('typescript/bin/tsc');
  const project = resolve(here, 'tsconfig.tokens.json');

  try {
    execFileSync(process.execPath, [tscBin, '-p', project], {
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
    console.error('[tokens] TypeScript failed to compile the token module:\n' + output);
    process.exit(1);
  }

  const emitted = resolve(pkgRoot, '.generated/tokens.js');
  if (!existsSync(emitted)) {
    console.error(`[tokens] expected ${emitted} to exist after compiling tokens.ts`);
    process.exit(1);
  }
  return emitted;
}

const emittedPath = compileTokens();
const tokensModule = await import(`file://${emittedPath}`);

const {
  green,
  amber,
  slate,
  red,
  blue,
  cyan,
  purple,
  paymentBrands,
  semanticColors,
  space,
  layout,
  radius,
  componentRadius,
  fontFamily,
  fontSize,
  lineHeight,
  banglaLineHeight,
  fontWeight,
  shadow,
  breakpoints,
  duration,
  easing,
  zIndex,
} = tokensModule;

/* ------------------------------------------------------------- 2. helpers - */

const GENERIC_FAMILIES = new Set([
  'system-ui',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'ui-monospace',
  'ui-sans-serif',
  'ui-serif',
]);

/** CSS `font-family` lists need quoting for any multi-word family name. */
const fontStack = (families) =>
  families
    .map((family) => (GENERIC_FAMILIES.has(family) || !/[\s"]/.test(family) ? family : `"${family}"`))
    .join(', ');

/** camelCase source keys -> kebab-case custom-property segments. */
const kebab = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const px = (value) => `${value}px`;

/** Renders `[name, value]` pairs as one indented CSS declaration block. */
const lines = (pairs) =>
  pairs
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

const scale = (prefix, values) =>
  Object.entries(values).map(([key, value]) => [`--${prefix}-${kebab(key)}`, String(value)]);

/* ---------------------------------------------------------- 3. @theme block */

const themeParts = [];

themeParts.push(
  [
    '  /* ---- palette scales ---- */',
    // The colour namespace is intentionally NOT reset: the remaining built-in
    // Tailwind colours are still useful for one-off admin-dashboard accents.
    lines([
      ...scale('color-green', green),
      ...scale('color-amber', amber),
      ...scale('color-slate', slate),
    ]),
    '',
    lines([...scale('color-red', red), ...scale('color-blue', blue), ...scale('color-cyan', cyan)]),
    '',
    lines([...scale('color-purple', purple), ...scale('color-bkash', { base: paymentBrands.bkash })]),
    '',
    lines(Object.entries(paymentBrands).map(([key, value]) => [`--color-${kebab(key)}`, value])),
  ].join('\n'),
);

themeParts.push(
  ['  /* ---- semantic colours (use these in components) ---- */', lines(
    Object.entries(semanticColors).map(([key, value]) => [`--color-${kebab(key)}`, value]),
  )].join('\n'),
);

themeParts.push(
  [
    '  /* ---- typography ---- */',
    // Full reset + re-declare keeps the web scale identical to React Native's.
    '  --font-*: initial;',
    lines([
      ['--font-sans', fontStack(fontFamily.sans)],
      ['--font-bangla', fontStack(fontFamily.bangla)],
      ['--font-mono', fontStack(fontFamily.mono)],
    ]),
    '',
    '  --text-*: initial;',
    lines(Object.entries(fontSize).map(([key, value]) => [`--text-${kebab(key)}`, px(value)])),
    '',
    // Paired default line heights. Bangla needs more leading than Latin at the
    // same size (conjuncts and matras sit above and below the baseline).
    lines(
      Object.entries(fontSize).map(([key, value]) => [
        `--text-${kebab(key)}--line-height`,
        String(value <= fontSize['3xl'] ? banglaLineHeight.snug : banglaLineHeight.tight),
      ]),
    ),
    '',
    '  --font-weight-*: initial;',
    lines(scale('font-weight', fontWeight)),
    '',
    '  --leading-*: initial;',
    lines([
      ['--leading-none', String(lineHeight.none)],
      ['--leading-tight', String(banglaLineHeight.tight)],
      ['--leading-snug', String(banglaLineHeight.snug)],
      ['--leading-normal', String(banglaLineHeight.normal)],
      ['--leading-relaxed', String(lineHeight.relaxed)],
    ]),
    '',
    '  --tracking-*: initial;',
    lines([
      ['--tracking-tight', '-0.015em'],
      ['--tracking-normal', '0em'],
      ['--tracking-wide', '0.02em'],
      ['--tracking-wider', '0.05em'],
    ]),
  ].join('\n'),
);

themeParts.push(
  [
    '  /* ---- spacing (4px base, identical to the RN `space` scale) ---- */',
    `  --spacing: ${px(space[1])};`,
  ].join('\n'),
);

themeParts.push(
  [
    '  /* ---- radii ---- */',
    '  --radius-*: initial;',
    lines([
      ...Object.entries(radius).map(([key, value]) => [`--radius-${kebab(key)}`, px(value)]),
      ...Object.entries(componentRadius).map(([key, value]) => [`--radius-${kebab(key)}`, px(value)]),
    ]),
  ].join('\n'),
);

themeParts.push(
  [
    '  /* ---- elevation ---- */',
    '  --shadow-*: initial;',
    lines([
      ['--shadow-none', 'none'],
      ...Object.entries(shadow).map(([key, value]) => [`--shadow-${kebab(key)}`, value.web]),
    ]),
  ].join('\n'),
);

themeParts.push(
  [
    '  /* ---- mobile-first breakpoints ---- */',
    '  --breakpoint-*: initial;',
    lines(Object.entries(breakpoints).map(([key, value]) => [`--breakpoint-${kebab(key)}`, px(value)])),
  ].join('\n'),
);

themeParts.push(
  [
    '  /* ---- motion ---- */',
    '  --ease-*: initial;',
    lines(
      Object.entries(easing).map(([key, value]) => [
        `--ease-${kebab(key)}`,
        `cubic-bezier(${value.join(', ')})`,
      ]),
    ),
    '',
    '  --animate-*: initial;',
    lines([
      ['--animate-fade-in', `fade-in ${duration.base}ms var(--ease-decelerate) both`],
      ['--animate-slide-up', `slide-up ${duration.slow}ms var(--ease-emphasized) both`],
      ['--animate-shimmer', `shimmer 1.6s linear infinite`],
    ]),
  ].join('\n'),
);

/* ----------------------------------------------------------- 4. :root block */

const rootParts = [
  '  /* Layout metrics */',
  lines([
    ['--shobdox-min-touch-target', px(layout.minTouchTarget)],
    ['--shobdox-header-height', px(layout.headerHeight.mobile)],
    ['--shobdox-bottom-nav-height', px(layout.bottomNavHeight)],
    ['--shobdox-gutter', px(layout.gutter.mobile)],
  ]),
  '',
  '  /* Z-index scale */',
  lines(scale('shobdox-z', zIndex)),
  '',
  '  /* Motion durations */',
  lines(Object.entries(duration).map(([key, value]) => [`--shobdox-duration-${kebab(key)}`, `${value}ms`])),
  '',
  '  /* Safe-area fallbacks */',
  lines([
    ['--shobdox-safe-top', 'env(safe-area-inset-top, 0px)'],
    ['--shobdox-safe-bottom', 'env(safe-area-inset-bottom, 0px)'],
    ['--shobdox-safe-left', 'env(safe-area-inset-left, 0px)'],
    ['--shobdox-safe-right', 'env(safe-area-inset-right, 0px)'],
  ]),
];

/* ----------------------------------------------------------------- 5. write */

const banner = `/*
 * AUTO-GENERATED FILE — DO NOT EDIT.
 *
 * Source of truth : packages/design-tokens/src/tokens.ts
 * Regenerate with : npm run tokens
 *                   (also runs automatically before \`npm run dev\` / \`build\`)
 */`;

const css = `${banner}

@theme {
${themeParts.join('\n\n')}
}

:root {
${rootParts.join('\n')}
}

@media (min-width: ${px(breakpoints.md)}) {
  :root {
    --shobdox-header-height: ${px(layout.headerHeight.desktop)};
    --shobdox-gutter: ${px(layout.gutter.tablet)};
  }
}

@media (min-width: ${px(breakpoints.xl)}) {
  :root {
    --shobdox-gutter: ${px(layout.gutter.desktop)};
  }
}
`;

const outFile = resolve(repoRoot, 'apps/web/src/styles/tokens.generated.css');
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, css, 'utf8');

rmSync(resolve(pkgRoot, '.generated'), { recursive: true, force: true });

console.log(
  `[tokens] wrote apps/web/src/styles/tokens.generated.css (${css.split('\n').length} lines)`,
);
