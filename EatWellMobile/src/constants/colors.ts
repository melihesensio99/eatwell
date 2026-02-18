// ==========================================
// EatWellFeelWell - Renk Paleti
// Premium, modern tasarım için renk sistemi
// ==========================================

export const DarkColors = {
  // Ana Renkler
  primary: '#2D7A4F',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  
  // Arka Plan Renkleri
  background: '#0F1923',
  backgroundLight: '#1A2A3A',
  backgroundCard: '#1E3045',
  backgroundGlass: 'rgba(30, 48, 69, 0.85)',
  
  // Metin Renkleri
  textPrimary: '#FFFFFF',
  textSecondary: '#A8B8C8',
  textMuted: '#6B7D8E',
  
  // Vurgu Renkleri
  accent: '#00E676',
  accentOrange: '#FF9800',
  accentRed: '#FF5252',
  accentBlue: '#42A5F5',
  accentPurple: '#AB47BC',
  
  // Nutri-Score Renkleri
  nutriScoreA: '#038141',
  nutriScoreB: '#85BB2F',
  nutriScoreC: '#FECB02',
  nutriScoreD: '#EE8100',
  nutriScoreE: '#E63E11',
  
  // NOVA Grup Renkleri
  novaGroup1: '#4CAF50',
  novaGroup2: '#FFC107',
  novaGroup3: '#FF9800',
  novaGroup4: '#F44336',
  
  // Seviye Renkleri (Düşük/Orta/Yüksek)
  levelLow: '#4CAF50',
  levelModerate: '#FFC107',
  levelHigh: '#F44336',
  
  // Sağlık Durumu
  healthy: '#00E676',
  unhealthy: '#FF5252',
  
  // Arayüz
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.05)',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.5)',
  
  // Gradient
  gradientStart: '#0F2027',
  gradientMiddle: '#203A43',
  gradientEnd: '#2C5364',
};

export const LightColors = {
  // Ana Renkler
  primary: '#2D7A4F',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  
  // Arka Plan Renkleri
  background: '#F5F7FA',
  backgroundLight: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundGlass: 'rgba(255, 255, 255, 0.9)',
  
  // Metin Renkleri
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#A0AEC0',
  
  // Vurgu Renkleri
  accent: '#00C853',
  accentOrange: '#F57C00',
  accentRed: '#E53935',
  accentBlue: '#1E88E5',
  accentPurple: '#8E24AA',
  
  // Nutri-Score Renkleri
  nutriScoreA: '#038141',
  nutriScoreB: '#85BB2F',
  nutriScoreC: '#FECB02',
  nutriScoreD: '#EE8100',
  nutriScoreE: '#E63E11',
  
  // NOVA Grup Renkleri
  novaGroup1: '#4CAF50',
  novaGroup2: '#FFC107',
  novaGroup3: '#FF9800',
  novaGroup4: '#F44336',
  
  // Seviye Renkleri
  levelLow: '#4CAF50',
  levelModerate: '#FFC107',
  levelHigh: '#F44336',
  
  // Sağlık Durumu
  healthy: '#00C853',
  unhealthy: '#E53935',
  
  // Arayüz
  border: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.05)',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.3)',
  
  // Gradient
  gradientStart: '#E8F5E9',
  gradientMiddle: '#C8E6C9',
  gradientEnd: '#A5D6A7',
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
  hero: 40,
};
