import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { ProductAnalysis } from '../types';
import { productService } from '../services';
import { getDeviceId } from '../services/deviceService';
import {
  NutriScoreBadge,
  NovaGroupBadge,
  NutrientBar,
  HealthBadge,
  LoadingSpinner,
} from '../components';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  route: any;
  navigation: any;
}

const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { barcode, analysisData, localImageUri } = route.params || {};
  const [data, setData] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const headerLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (analysisData) {
      setData(analysisData);
      setLoading(false);
      startAnimations();
    } else if (barcode) {
      fetchAnalysis();
    } else {
      setError('Veri bulunamadı.');
      setLoading(false);
    }
  }, [barcode, analysisData]);

  React.useLayoutEffect(() => {
    if (data) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 16, padding: 8, backgroundColor: Colors.accentOrange + '20', borderRadius: 20 }}
            onPress={() => navigation.navigate('Calorie', { 
              barcode: barcode || data.code || `AI_${Date.now()}`, 
              productName: data.productName,
              enableAdding: true,
              manualData: !barcode ? {
                productName: data.productName,
                fat100g: parseFloat(data.fat || '0'),
                proteins100g: parseFloat(data.proteins || '0'),
                carbohydrates100g: parseFloat(data.carbohydrates || '0'),
                sugars100g: parseFloat(data.sugars || '0'),
                saturatedFat100g: parseFloat(data.saturatedFat || '0'),
                salt100g: parseFloat(data.salt || '0'),
                caloriePercentInfo: {
                  energyKcal100g: parseFloat(data.energyKcal || '0'),
                  fatPercent: 33,
                  proteinPercent: 33,
                  carbPercent: 34
                }
              } : undefined
            })}
          >
            <Text style={{ fontSize: 20 }}>➕</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, data, barcode]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerLineAnim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchAnalysis = async () => {
    console.log(`[Analysis] ${barcode} barkodu için analiz başlatılıyor...`);
    try {
      setLoading(true);
      setError(null);
      const deviceId = await getDeviceId();
      console.log(`[Analysis] DeviceId: ${deviceId}`);
      const result = await productService.getProductAnalysis(barcode, deviceId);
      console.log('[Analysis] Veri başarıyla alındı:', result.productName);
      setData(result);
      
      startAnimations();
    } catch (err: any) {
      setError(
        err.response?.status === 404
          ? 'Ürün bulunamadı. Barkodu kontrol edin.'
          : 'Bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getAllergenIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('süt') || lower.includes('milk') || lower.includes('laktoz')) return '🥛';
    if (lower.includes('yumurta') || lower.includes('egg')) return '🥚';
    if (lower.includes('fıstık') || lower.includes('peanut')) return '🥜';
    if (lower.includes('kuruyemiş') || lower.includes('nut') || lower.includes('fındık')) return '🌰';
    if (lower.includes('soya') || lower.includes('soy')) return '🫘';
    if (lower.includes('buğday') || lower.includes('wheat') || lower.includes('gluten')) return '🌾';
    if (lower.includes('balık') || lower.includes('fish')) return '🐟';
    if (lower.includes('kabuklu') || lower.includes('sea')) return '🦐';
    if (lower.includes('susam') || lower.includes('sesame')) return '🥯';
    if (lower.includes('hardal') || lower.includes('mustard')) return '🥣';
    return '⚠️';
  };

  if (loading) {
    return <LoadingSpinner message="Ürün analiz ediliyor..." />;
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <View style={styles.errorIconWrap}>
          <Text style={styles.errorEmoji}>😔</Text>
        </View>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnalysis}>
          <Text style={styles.retryText}>🔄 Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.textMuted }]}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Hero Section - Ürün Bilgisi */}
          <View style={[styles.heroCard, { backgroundColor: colors.backgroundCard }]}>
            <Animated.View style={[styles.imageSection, { transform: [{ translateY: floatAnim }] }]}>
              {(data.imageFrontUrl || localImageUri) ? (
                <View style={styles.imageGlow}>
                  <Image
                    source={{ uri: data.imageFrontUrl || localImageUri }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundLight }]}>
                  <Text style={styles.imageEmoji}>📦</Text>
                </View>
              )}
            </Animated.View>
            <View style={styles.heroInfo}>
              <View style={[styles.barcodeBadge, { backgroundColor: colors.backgroundLight }]}>
                <Text style={[styles.barcodeText, { color: colors.textMuted }]}>{barcode}</Text>
              </View>
              <Text style={[styles.productTitle, { color: colors.textPrimary }]}>
                {data.productName || 'Bilinmeyen Ürün'}
              </Text>
            </View>
          </View>

          {/* Akıllı Analiz - Premium Spotlight */}
          {data.aiAnalysis && (
            <AiAnalysisCard text={data.aiAnalysis} navigation={navigation} productName={data.productName} />
          )}

          {/* Alerjen Uyarısı - Soft Alert */}
          {data.allergenWarning && data.allergenWarning.hasAllergenWarning && (
            <View style={[styles.alertCard, { borderColor: Colors.accentRed + '30' }]}>
              <View style={styles.alertHeader}>
                <View style={[styles.alertIconWrap, { backgroundColor: Colors.accentRed + '10' }]}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: Colors.accentRed }]}>Alerjen Uyarısı</Text>
                  <Text style={[styles.alertSubtitle, { color: colors.textMuted }]}>
                    Profil kısıtlamalarınızla uyuşmayan içerik
                  </Text>
                </View>
              </View>
              <View style={styles.alertTags}>
                {data.allergenWarning.detectedAllergens.map((allergen, index) => (
                  <View key={index} style={[styles.alertTag, { borderColor: Colors.accentRed + '40', backgroundColor: '#fff' }]}>
                    <Text style={{ fontSize: 14, marginRight: 4 }}>{getAllergenIcon(allergen)}</Text>
                    <Text style={[styles.alertTagText, { color: Colors.accentRed }]}>{allergen}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sağlık & Besin Değerleri Grid */}
          <View style={styles.sectionHeaderWrap}>
            <Animated.View 
              style={[
                styles.titleLine, 
                { 
                  backgroundColor: colors.primary + '20',
                  width: headerLineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                }
              ]} 
            />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Genel Analiz</Text>
            <Animated.View 
              style={[
                styles.titleLine, 
                { 
                  backgroundColor: colors.primary + '20',
                  width: headerLineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                }
              ]} 
            />
          </View>

          <HealthBadge score={data.score} />

          <View style={styles.gridRow}>
            <View style={[styles.gridItem, { backgroundColor: colors.backgroundCard }]}>
              <NutriScoreBadge grade={data.nutritionGrades} />
            </View>
            <View style={[styles.gridItem, { backgroundColor: colors.backgroundCard }]}>
              <NovaGroupBadge group={data.novaGroup} />
            </View>
          </View>

          {/* Besin Seviyeleri - Modern Card */}
          <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>Besin Seviyeleri</Text>
              <Text style={styles.cardHeaderSub}>100g porsiyon için</Text>
            </View>
            <View style={styles.cardContent}>
              <NutrientBar label="Yağ" level={data.fat} />
              <NutrientBar label="Doymuş Yağ" level={data.saturatedFat} />
              <NutrientBar label="Şeker" level={data.sugars} />
              <NutrientBar label="Tuz" level={data.salt} />
            </View>
          </View>

          {/* Katkı Maddeleri - Minimalist */}
          {data.additivesTags && data.additivesTags.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>🔬</Text>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>İçerik Analizi</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: Colors.accentOrange + '15' }]}>
                  <Text style={[styles.countText, { color: Colors.accentOrange }]}>{data.additivesTags.length} Madde</Text>
                </View>
              </View>
              <View style={styles.additivesGrid}>
                {data.additivesTags.map((tag, index) => (
                  <View key={index} style={[styles.additivePill, { borderColor: Colors.accentOrange + '30' }]}>
                    <Text style={[styles.additivePillText, { color: Colors.accentOrange }]}>
                      {tag.replace('en:', '').toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Button - Premium CTA */}
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: Colors.accentOrange }]}
            onPress={() => navigation.navigate('Calorie', { 
              barcode: barcode || data.code || `AI_${Date.now()}`, 
              productName: data.productName,
              manualData: !barcode ? {
                productName: data.productName,
                fat100g: parseFloat(data.fat || '0'),
                proteins100g: parseFloat(data.proteins || '0'),
                carbohydrates100g: parseFloat(data.carbohydrates || '0'),
                sugars100g: parseFloat(data.sugars || '0'),
                saturatedFat100g: parseFloat(data.saturatedFat || '0'),
                salt100g: parseFloat(data.salt || '0'),
                caloriePercentInfo: {
                  energyKcal100g: parseFloat(data.energyKcal || '0'),
                  fatPercent: 33,
                  proteinPercent: 33,
                  carbPercent: 34
                }
              } : undefined
            })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.accentOrange, '#f59e0b']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.ctaIconWrap}>
                <Text style={styles.ctaIcon}>🔥</Text>
              </View>
              <View style={styles.ctaInfo}>
                <Text style={styles.ctaTitle}>Detaylı Besin Değerleri</Text>
                <Text style={styles.ctaSub}>Kalori ve makro besinleri incele</Text>
              </View>
              <Text style={styles.ctaArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Apple tarzı hafif kırık beyaz arka plan
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: Spacing.lg,
    paddingBottom: 40, // Boşluk 80'den 40'a düşürüldü
  },
  // Hero Card Styles
  heroCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md, // Boşluk azaltıldı
    backgroundColor: '#FFFFFF', // Kartı zeminden ayırmak için tam beyaz
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  imageSection: {
    marginBottom: Spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  imageGlow: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.xl,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 64,
  },
  heroInfo: {
    alignItems: 'center',
    width: '100%',
  },
  barcodeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  productTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  // Alert Card Styles
  alertCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.md, // Boşluk azaltıldı
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: FontSize.md,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  alertSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  alertTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alertTag: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    flexDirection: 'row', // Simge ve metni yan yana getirmek için
    alignItems: 'center',
  },
  alertTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  // Grid Styles
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg, // Boşluk artırıldı
  },
  gridItem: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF', // Beyaz arka plan
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  // Common Card Styles
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: '#FFFFFF', // Zeminden ayrışması için
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardHeaderTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardHeaderSub: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  cardContent: {
    gap: Spacing.xs,
  },
  // Section Header Wrap
  sectionHeaderWrap: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md, // Boşluk azaltıldı
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    justifyContent: 'center', // İçeriği ortala
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    textTransform: 'none',
    letterSpacing: -0.5,
    opacity: 0.9,
    textAlign: 'center',
  },
  titleLine: {
    height: 1,
    flex: 1,
    borderRadius: 2,
  },
  // Additives Styles
  additivesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  additivePill: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    maxWidth: '100%',
  },
  additivePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    flexWrap: 'wrap',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
  },
  // CTA Button Styles
  ctaButton: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md, // Alt boşluk azaltıldı
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  ctaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ctaIcon: {
    fontSize: 24,
  },
  ctaInfo: {
    flex: 1,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  ctaSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    marginLeft: Spacing.sm,
  },
  // AI Card Styles
  aiCard: {
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.md, // Boşluk azaltıldı
    overflow: 'hidden',
    elevation: 4,
  },
  aiCardInner: {
    padding: Spacing.xl,
  },
  aiHeader: {
    marginBottom: Spacing.lg,
  },
  aiTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pointsList: {
    gap: Spacing.md,
  },
  pointItem: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  pointIcon: {
    marginRight: 10,
  },
  pointTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pointText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  promptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md, // Boşluk azaltıldı
    paddingTop: Spacing.md, // Boşluk azaltıldı
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  promptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  errorIconWrap: {
    marginBottom: Spacing.lg,
  },
  errorEmoji: {
    fontSize: 64,
  },
  errorText: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.lg,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  backButton: {
    padding: Spacing.md,
  },
  backButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});

// AI Analizi Kartı Bileşeni
const AiAnalysisCard: React.FC<{ text: string; navigation: any; productName: string | null }> = ({ text, navigation, productName }) => {
  const { colors, isDark } = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  // Markdown (**, __ vb.) temizleme fonksiyonu
  const cleanMarkdown = (t: string) => {
    return t.replace(/(\*\*|__|[*_])/g, '').trim();
  };

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        // Hızı artırmak için her adımda 4 karakter birden ekleyelim
        const nextIndex = Math.min(index + 4, text.length);
        setDisplayedText(text.substring(0, nextIndex));
        setIndex(nextIndex);
      }, 5); // Bekleme süresini de 5ms'ye düşürdüm
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  // Metni maddelere ayır ve temizle
  const points = displayedText
    .replace(/\\n/g, '\n')
    .split(/[•\n]/)
    .map((p) => cleanMarkdown(p))
    .filter((p) => p.length > 0);

  const getIconForPoint = (point: string) => {
    const lower = point.toLowerCase();
    if (lower.startsWith('sonuç')) return '🎯';
    if (lower.includes('özet')) return '📝';
    if (lower.includes('nutri-score')) return '📊';
    if (lower.includes('nova') || lower.includes('işlenmişlik')) return '🏭';
    if (lower.includes('besin') || lower.includes('kalori') || lower.includes('değer')) return '⚡';
    if (lower.includes('alerjen') || lower.includes('içerik')) return '⚠️';
    return '✨';
  };

  const prompts = [
    { label: 'Antrenman öncesi?', prompt: `Bu ${productName} antrenman öncesi uygun mu?` },
    { label: 'Diyet tavsiyesi?', prompt: `Bu ${productName} ürününü diyetime nasıl uydururum?` },
    { label: 'Daha sağlıklı ne var?', prompt: `Bu ${productName} yerine ne önerirsin?` },
  ];

  return (
    <View style={styles.aiCard}>
      <LinearGradient
        colors={isDark ? ['#6366f1', '#a855f7'] : ['#e0e7ff', '#f3e8ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiCard}
      >
        <View style={[styles.aiCardInner, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.92)' }]}>
          <View style={styles.aiHeader}>
             <Text style={[styles.aiTitle, { color: colors.textPrimary }]}>✨ Akıllı Beslenme Analizi</Text>
          </View>

          <View style={styles.pointsList}>
            {points.map((point, i) => {
              const isResult = point.toLowerCase().startsWith('sonuç');
              
              // Başlık ve içeriği ayır (Örn: "Ürün Özeti: Harika bir ürün" -> ["Ürün Özeti", "Harika bir ürün"])
              const parts = point.split(':');
              const hasTitle = parts.length > 1;
              const title = hasTitle ? parts[0].trim() : '';
              const content = hasTitle ? parts.slice(1).join(':').trim() : point;

              return (
                <View 
                  key={i} 
                  style={[
                    styles.pointItem, 
                    { 
                      backgroundColor: isResult 
                        ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)')
                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      borderLeftWidth: isResult ? 4 : 0,
                      borderLeftColor: '#6366f1',
                      paddingVertical: isResult ? Spacing.md : Spacing.sm,
                      flexDirection: 'column', // Başlık ve içeriği alt alta veya yan yana daha iyi yönetmek için
                      alignItems: 'flex-start'
                    }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hasTitle ? 4 : 0 }}>
                    <Text style={[styles.pointIcon, { fontSize: isResult ? 20 : 16 }]}>{getIconForPoint(point)}</Text>
                    {hasTitle && (
                      <Text style={[
                        styles.pointTitle, 
                        { 
                          color: isResult ? '#6366f1' : colors.primary,
                          fontWeight: '900',
                          fontSize: isResult ? FontSize.md + 1 : FontSize.sm + 1,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }
                      ]}>
                        {title}
                      </Text>
                    )}
                  </View>
                  
                  <Text style={[
                    styles.pointText, 
                    { 
                      color: colors.textPrimary,
                      fontWeight: isResult ? '700' : '500',
                      fontSize: isResult ? FontSize.md : FontSize.sm,
                      fontStyle: isResult ? 'italic' : 'normal',
                      marginLeft: hasTitle ? 0 : 4,
                      lineHeight: 20
                    }
                  ]}>
                    {content}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.promptContainer}>
            {prompts.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.promptChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                onPress={() => navigation.navigate('Chat', { initialMessage: p.prompt })}
              >
                <Text style={[styles.promptChipText, { color: colors.primary }]}>💬 {p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default AnalysisScreen;
