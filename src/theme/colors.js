export const BACKGROUND_COLORS = {
  1: '#0A1E3F',
  2: '#2C1B3C',
  3: '#4A1833',
  4: '#6B1A1A',
  5: '#7B1A1A',
  6: '#8B1A1A',
  7: '#9B0A0A',
  8: '#AB0000',
  9: '#BB0000',
  10: '#CC0000',
};

export const BUTTON_COLORS = {
  1: '#6d28d9',
  2: '#7c3aed',
  3: '#9333ea',
  4: '#a21caf',
  5: '#be123c',
  6: '#9f1239',
  7: '#7f1d1d',
  8: '#450a0a',
  9: '#1f0505',
  10: '#0f0202',
};

export const getBackgroundColorByLevel = (level) => {
  return BACKGROUND_COLORS[level] || BACKGROUND_COLORS[1];
};

export const getButtonColorByLevel = (level) => {
  return BUTTON_COLORS[level] || BUTTON_COLORS[1];
};

export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  text: {
    primary: '#ffffff',
    secondary: '#94a3b8',
  },
  ui: {
    container: '#40414742',
    overlay: 'rgba(6, 6, 11, 0.4)',
    border: '#3a3a5c',
  },
};
