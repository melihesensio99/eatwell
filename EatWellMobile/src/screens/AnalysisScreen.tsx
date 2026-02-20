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

interface Props {
  route: any;
  navigation: any;
}

const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { barcode } = route.params;
  const [data, setData] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchAnalysis();
  }, [barcode]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const deviceId = await getDeviceId();
      const result = await productService.getProductAnalysis(barcode, deviceId);
      setData(result);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]).start();
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
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Ürün Bilgisi */}
        <View style={[styles.header, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          {data.imageFrontUrl ? (
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: data.imageFrontUrl }}
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={[styles.productImagePlaceholder, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <Text style={styles.productImagePlaceholderText}>📦</Text>
            </View>
          )}
          <View style={[styles.barcodeChip, { backgroundColor: colors.backgroundLight }]}>
            <Text style={[styles.barcodeLabel, { color: colors.textMuted }]}>{barcode}</Text>
          </View>
          <Text style={[styles.productName, { color: colors.textPrimary }]}>
            {data.productName || 'Bilinmeyen Ürün'}
          </Text>
        </View>

        {/* Alerjen Uyarısı */}
        {data.allergenWarning && data.allergenWarning.hasAllergenWarning && (
          <View style={[styles.warningContainer, { backgroundColor: Colors.accentRed + '15', borderColor: Colors.accentRed + '30' }]}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={[styles.warningTitle, { color: Colors.accentRed }]}>Alerjen Uyarısı</Text>
            </View>
            <Text style={[styles.warningText, { color: colors.textPrimary }]}>
              Bu ürün, profilinizde işaretlediğiniz alerjenleri içermektedir:
            </Text>
            <View style={styles.warningTags}>
              {data.allergenWarning.detectedAllergens.map((allergen, index) => (
                <View key={index} style={[styles.warningTag, { backgroundColor: Colors.accentRed }]}>
                   <Text style={styles.warningTagText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sağlık Durumu - Skor */}
        <HealthBadge score={data.score} />

        {/* Nutri-Score & NOVA */}
        <View style={styles.badgesRow}>
          <View style={[styles.badgeContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <NutriScoreBadge grade={data.nutritionGrades} />
          </View>
          <View style={[styles.badgeContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <NovaGroupBadge group={data.novaGroup} />
          </View>
        </View>

        {/* Besin Seviyeleri */}
        <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Besin Seviyeleri</Text>
          </View>
          <NutrientBar label="Yağ" level={data.fat} />
          <NutrientBar label="Doymuş Yağ" level={data.saturatedFat} />
          <NutrientBar label="Şeker" level={data.sugars} />
          <NutrientBar label="Tuz" level={data.salt} />
        </View>

        {/* Katkı Maddeleri */}
        {data.additivesTags && data.additivesTags.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🧪</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Katkı Maddeleri</Text>
            </View>
            <View style={styles.additivesContainer}>
              {data.additivesTags.map((tag, index) => (
                <View key={index} style={styles.additiveChip}>
                  <Text style={styles.additiveText}>
                    {tag.replace('en:', '').toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
            {data.additiveDescriptions && data.additiveDescriptions.length > 0 && (
              <View style={styles.additiveDescriptions}>
                {data.additiveDescriptions.map((desc, i) => (
                  <Text key={i} style={[styles.additiveDescText, { color: colors.textSecondary }]}>
                    • {desc}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Kalori Detayları Butonu */}
        <TouchableOpacity
          style={styles.calorieButton}
          onPress={() =>
            navigation.navigate('Calorie', {
              barcode,
              productName: data.productName,
            })
          }
          activeOpacity={0.85}
        >
          <View style={styles.calorieBtnGlow}>
            <Text style={styles.calorieButtonIcon}>🔥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.calorieButtonText}>Kalori Detayları</Text>
            <Text style={styles.calorieButtonSub}>Besin değerlerini incele</Text>
          </View>
          <Text style={styles.calorieButtonArrow}>→</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
  },
  header: {
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  imageWrap: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'transparent',
  },
  productImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  productImagePlaceholderText: {
    fontSize: 72,
  },
  barcodeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
  },
  barcodeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  badgeContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  additivesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  additiveChip: {
    backgroundColor: Colors.accentOrange + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accentOrange + '25',
  },
  additiveText: {
    color: Colors.accentOrange,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  additiveDescriptions: {
    marginTop: Spacing.md,
  },
  additiveDescText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  calorieButton: {
    backgroundColor: Colors.accentOrange + '12',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentOrange + '30',
    shadowColor: Colors.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  calorieBtnGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentOrange + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  calorieButtonIcon: {
    fontSize: 24,
  },
  calorieButtonText: {
    color: Colors.accentOrange,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  calorieButtonSub: {
    color: Colors.accentOrange,
    fontSize: FontSize.xs,
    fontWeight: '500',
    opacity: 0.7,
    marginTop: 2,
  },
  calorieButtonArrow: {
    color: Colors.accentOrange,
    fontSize: FontSize.xl,
    fontWeight: '700',
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 77, 106, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  backButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  warningContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  warningText: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  warningTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  warningTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  warningTagText: {
    color: '#FFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});

export default AnalysisScreen;
