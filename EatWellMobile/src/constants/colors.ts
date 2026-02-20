export const DarkColors = {
  // Ana Renkler — FatSecret yeşili
  primary: '#31B24A',
  primaryLight: '#4ACD63',
  primaryDark: '#259924',
  
  // Arka Plan — Koyu ama sıcak tonlar
  background: '#1A1A2E',
  backgroundLight: '#222240',
  backgroundCard: '#2A2A45',
  backgroundGlass: 'rgba(42, 42, 69, 0.85)',
  
  // Metin Renkleri
  textPrimary: '#F5F5F5',
  textSecondary: '#B0B0C3',
  textMuted: '#7A7A95',
  
  // Vurgu Renkleri — FatSecret tarzı canlı
  accent: '#4ACD63',
  accentOrange: '#FF9500',
  accentRed: '#FF3B30',
  accentBlue: '#007AFF',
  accentPurple: '#AF52DE',
  accentYellow: '#FFCC00',
  accentPink: '#FF2D55',
  accentCyan: '#5AC8FA',
  
  // Nutri-Score Renkleri
  nutriScoreA: '#31B24A',
  nutriScoreB: '#85BB2F',
  nutriScoreC: '#FFCC00',
  nutriScoreD: '#FF9500',
  nutriScoreE: '#FF3B30',
  
  // NOVA Grup Renkleri
  novaGroup1: '#31B24A',
  novaGroup2: '#FFCC00',
  novaGroup3: '#FF9500',
  novaGroup4: '#FF3B30',
  
  // Seviye Renkleri
  levelLow: '#31B24A',
  levelModerate: '#FF9500',
  levelHigh: '#FF3B30',
  
  // Sağlık Durumu
  healthy: '#4ACD63',
  unhealthy: '#FF3B30',
  
  // Arayüz
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.05)',
  shadow: 'rgba(0,0,0,0.5)',
  overlay: 'rgba(0,0,0,0.6)',
  
  // Gradient Tonları
  gradientStart: '#1A1A2E',
  gradientMiddle: '#222240',
  gradientEnd: '#2A2A45',

  // Glow Efektleri
  glowPrimary: 'rgba(49, 178, 74, 0.3)',
  glowBlue: 'rgba(0, 122, 255, 0.25)',
  glowPurple: 'rgba(175, 82, 222, 0.25)',
  glowOrange: 'rgba(255, 149, 0, 0.25)',
};

export const LightColors = {
  // Ana Renkler — FatSecret yeşili
  primary: '#259924',
  primaryLight: '#31B24A',
  primaryDark: '#1E7E1E',
  
  // Arka Plan Renkleri — Temiz beyaz
  background: '#F2F2F7',
  backgroundLight: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundGlass: 'rgba(255, 255, 255, 0.95)',
  
  // Metin Renkleri — Koyu ve net
  textPrimary: '#1C1C1E',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  
  // Vurgu Renkleri
  accent: '#259924',
  accentOrange: '#FF9500',
  accentRed: '#FF3B30',
  accentBlue: '#007AFF',
  accentPurple: '#AF52DE',
  accentYellow: '#FFCC00',
  accentPink: '#FF2D55',
  accentCyan: '#5AC8FA',
  
  // Nutri-Score Renkleri
  nutriScoreA: '#259924',
  nutriScoreB: '#7AB532',
  nutriScoreC: '#E6B800',
  nutriScoreD: '#E68A00',
  nutriScoreE: '#E63329',
  
  // NOVA Grup Renkleri
  novaGroup1: '#259924',
  novaGroup2: '#E6B800',
  novaGroup3: '#E68A00',
  novaGroup4: '#E63329',
  
  // Seviye Renkleri
  levelLow: '#259924',
  levelModerate: '#E68A00',
  levelHigh: '#E63329',
  
  // Sağlık Durumu
  healthy: '#259924',
  unhealthy: '#E63329',
  
  // Arayüz
  border: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.05)',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.3)',
  
  // Gradient
  gradientStart: '#F2F2F7',
  gradientMiddle: '#E5E5EA',
  gradientEnd: '#D1D1D6',

  // Glow Efektleri
  glowPrimary: 'rgba(37, 153, 36, 0.15)',
  glowBlue: 'rgba(0, 122, 255, 0.12)',
  glowPurple: 'rgba(175, 82, 222, 0.12)',
  glowOrange: 'rgba(255, 149, 0, 0.12)',
};

// Geriye uyumluluk için varsayılan dark tema
export const Colors = DarkColors;

export type ThemeColors = typeof DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 44,
};

