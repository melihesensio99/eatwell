export const colors = {
  background: '#FCF9F3', surface: '#FFFFFF', surfaceMuted: '#F0EEE8', ink: '#0B132B', text: '#1C1C18', textMuted: '#64748B', border: '#E2DED6', coral: '#FF6B4A', coralDark: '#F05333', cobalt: '#2563EB', lavender: '#EDE9FE', warning: '#D97706', error: '#BA1A1A', white: '#FFFFFF',
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;
export const typography = {
  display: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 36, lineHeight: 40 }, title: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 24, lineHeight: 30 }, heading: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 18, lineHeight: 24 }, body: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 20 }, label: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 12, lineHeight: 16 },
} as const;
