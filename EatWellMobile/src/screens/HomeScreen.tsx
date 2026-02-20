import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { API_CONFIG } from '../constants/api';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(150, cardAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    )).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
    }
  };

  const executeSearch = async () => {
    if (!searchText.trim() || searchText.trim().length < 2) return;

    setIsSearching(true);
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT_SEARCH}`,
        { params: { query: searchText.trim(), page: 1, pageSize: 5 }, timeout: API_CONFIG.TIMEOUT }
      );
      setSearchResults(res.data.products || []);
    } catch (err) {
      console.log('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (code: string) => {
    setSearchResults([]);
    setSearchText('');
    navigation.navigate('Analysis', { barcode: code });
  };

  const actionButtons = [
    {
      icon: '📷',
      title: 'Barkod Tara',
      subtitle: 'Kamera ile oku',
      gradient: [colors.accentOrange],
      borderColor: colors.accentOrange + '40',
      glowColor: colors.glowOrange || 'rgba(255,140,66,0.25)',
      onPress: () => navigation.navigate('BarcodeScanner'),
    },
    {
      icon: '📅',
      title: 'Günlük Özet',
      subtitle: 'Bugünün takibi',
      gradient: [colors.accentBlue],
      borderColor: colors.accentBlue + '40',
      glowColor: colors.glowBlue || 'rgba(56,189,248,0.25)',
      onPress: () => navigation.navigate('DailySummary'),
    },
    {
      icon: '🥜',
      title: 'Alerjenler',
      subtitle: 'Alerjen Seçimi',
      gradient: [colors.accentPurple],
      borderColor: colors.accentPurple + '40',
      glowColor: colors.glowPurple || 'rgba(192,132,252,0.25)',
      onPress: () => navigation.navigate('AllergenSettings'),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Dekoratif arka plan ışınları */}
      <View style={styles.bgDecoration}>
        <Animated.View style={[styles.bgOrb, styles.bgOrb1, { opacity: glowAnim }]} />
        <Animated.View style={[styles.bgOrb, styles.bgOrb2, { opacity: glowAnim }]} />
      </View>

      {/* AI Asistan — Sol üst köşe */}
      <TouchableOpacity 
        style={[styles.aiButton, { backgroundColor: colors.backgroundCard, borderColor: colors.accentCyan + '40' }]} 
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={styles.aiButtonText}>🤖</Text>
      </TouchableOpacity>
      {/* Tema Değiştirme */}
      <TouchableOpacity 
        style={[styles.themeToggle, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]} 
        onPress={toggleTheme}
      >
        <Text style={styles.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo / Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoGlow}>
            <Text style={styles.emoji}>🥗</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Eat</Text>
            <Text style={[styles.titleGreen, { color: colors.primary }]}>Well</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.titleSmall, { color: colors.textMuted }]}>Feel</Text>
            <Text style={[styles.titleSmallGreen, { color: colors.accent }]}>Well</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sağlıklı beslenmenin akıllı yolu
          </Text>
        </View>

        {/* Ürün arama alanı */}
        <View style={styles.inputSection}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Ürün adı girin..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={handleTextChange}
              onSubmitEditing={executeSearch}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <TouchableOpacity onPress={executeSearch}>
                <Text style={[styles.inputIcon, { marginRight: 0, marginLeft: Spacing.sm }]}>🔍</Text>
              </TouchableOpacity>
            )}
          </View>

          {searchResults.length > 0 && (
            <View style={[styles.searchDropdown, { backgroundColor: colors.backgroundCard, borderColor: colors.border, maxHeight: 220 }]}>
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={item.code || index}
                  style={[styles.searchItem, index < searchResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
                  onPress={() => handleSelectProduct(item.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.searchItemInfo}>
                    <Text style={[styles.searchItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={[styles.searchItemBrand, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.brands || 'Marka bilinmiyor'}
                      {item.caloriesPer100g ? ` · ${Math.round(item.caloriesPer100g)} kcal/100g` : ''}
                    </Text>
                  </View>
                  {item.nutritionGrade && (
                    <View style={[styles.searchItemGrade, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.searchItemGradeText, { color: colors.primary }]}>
                        {item.nutritionGrade.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Aksiyon Butonları — 3'lü grid */}
        <View style={styles.actionGrid}>
          {actionButtons.map((btn, index) => (
            <Animated.View 
              key={index} 
              style={{ 
                flex: 1, 
                opacity: cardAnims[index],
                transform: [{ 
                  translateY: cardAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }],
              }}
            >
              <TouchableOpacity
                style={[styles.actionCard, { 
                  backgroundColor: colors.backgroundCard, 
                  borderColor: btn.borderColor,
                  shadowColor: btn.gradient[0],
                }]}
                onPress={btn.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: btn.glowColor }]}>
                  <Text style={styles.actionIcon}>{btn.icon}</Text>
                </View>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{btn.title}</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>{btn.subtitle}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>



      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgOrb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(0, 214, 143, 0.06)',
    top: -80,
    right: -80,
  },
  bgOrb2: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    bottom: -60,
    left: -60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoGlow: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0, 214, 143, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 143, 0.15)',
  },
  emoji: {
    fontSize: 48,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  titleGreen: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  titleSmall: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    letterSpacing: 4,
    marginTop: -6,
  },
  titleSmallGreen: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    letterSpacing: 4,
    marginTop: -6,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    letterSpacing: 0.3,
  },
  inputSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 58,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  analyzeButtonIcon: {
    fontSize: 18,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  analyzeButtonArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  searchDropdown: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  searchItemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  searchItemName: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  searchItemBrand: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  searchItemGrade: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  searchItemGradeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  actionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickCodes: {
    alignItems: 'center',
  },
  quickCodesTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  quickCodesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickCodeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  quickCodeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
   aiButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiButtonText: {
    fontSize: 20,
  },
  themeToggle: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  themeToggleText: {
    fontSize: 20,
  },
});

export default HomeScreen;
