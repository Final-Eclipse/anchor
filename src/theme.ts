/**
 * Shared visual language. Import from here instead of hardcoding colors, so four
 * people building four screens don't produce four different-looking apps.
 *
 * Two palettes on purpose:
 *
 *   decoy  — deliberately bland. It should look like a stock notes app nobody
 *            would look at twice. Boring is the feature.
 *   app    — the real interface, once she's through the unlock.
 */

export const decoy = {
  bg: '#ffffff',
  surface: '#f7f7f7',
  text: '#1c1c1e',
  subtle: '#8e8e93',
  line: '#e5e5ea',
  accent: '#d4a017',
};

export const app = {
  bg: '#131b19',
  surface: '#1a2321',
  surfaceLift: '#22302c',
  text: '#ece8e0',
  subtle: '#a6b0ab',
  line: '#313e3a',
  accent: '#7fb0a3',
  gold: '#d2ac6b',
  danger: '#d28c86',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export const type = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22 },
  small: { fontSize: 13 },
  label: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600' as const },
};
