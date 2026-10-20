/**
 * Bachat FinTech Minimalist Color Tokens
 * Tailored for Shrestha Services Executive Financial Suite
 */

const tintColorLight = '#059669'; // Emerald
const tintColorDark = '#10B981'; // Bright Emerald

export const Palette = {
  // Deep Slate / Zinc Dark Theme Canvas
  canvasDark: '#080C15',
  cardDark: '#111726',
  cardDarkHover: '#182136',
  borderDark: '#1E293B',
  borderDarkLight: '#2D3A54',

  // Light Theme Canvas
  canvasLight: '#F8FAFC',
  cardLight: '#FFFFFF',
  cardLightHover: '#F1F5F9',
  borderLight: '#E2E8F0',

  // Financial Semantics
  emerald: '#10B981',
  emeraldMuted: 'rgba(16, 185, 129, 0.12)',
  emeraldDark: '#059669',

  indigo: '#6366F1',
  indigoMuted: 'rgba(99, 102, 241, 0.12)',

  amber: '#F59E0B',
  amberMuted: 'rgba(245, 158, 11, 0.12)',

  rose: '#EF4444',
  roseMuted: 'rgba(239, 68, 68, 0.14)',

  // Typography
  textPrimaryDark: '#F8FAFC',
  textSecondaryDark: '#94A3B8',
  textMutedDark: '#64748B',

  textPrimaryLight: '#0F172A',
  textSecondaryLight: '#475569',
  textMutedLight: '#94A3B8',
};

export default {
  light: {
    text: Palette.textPrimaryLight,
    textSecondary: Palette.textSecondaryLight,
    textMuted: Palette.textMutedLight,
    background: Palette.canvasLight,
    card: Palette.cardLight,
    cardHover: Palette.cardLightHover,
    border: Palette.borderLight,
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    income: Palette.emeraldDark,
    expense: Palette.rose,
    pending: Palette.amber,
    overdue: Palette.rose,
  },
  dark: {
    text: Palette.textPrimaryDark,
    textSecondary: Palette.textSecondaryDark,
    textMuted: Palette.textMutedDark,
    background: Palette.canvasDark,
    card: Palette.cardDark,
    cardHover: Palette.cardDarkHover,
    border: Palette.borderDark,
    tint: tintColorDark,
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    income: Palette.emerald,
    expense: Palette.rose,
    pending: Palette.amber,
    overdue: Palette.rose,
  },
};
