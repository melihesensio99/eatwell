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

  useEffect(() => {
    fetchAnalysis();
  }, [barcode]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productService.getProductAnalysis(barcode);
      setData(result);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnalysis}>
          <Text style={styles.retryText}>🔄 Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Ürün Bilgisi */}
        <View style={styles.header}>
          {data.imageFrontUrl ? (
            <Image
              source={{ uri: data.imageFrontUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImagePlaceholderText}>📦</Text>
            </View>
          )}
          <Text style={styles.barcodeLabel}>Barkod: {barcode}</Text>
          <Text style={styles.productName}>{data.productName || 'Bilinmeyen Ürün'}</Text>
        </View>

        {/* Sağlık Durumu - Skor */}
        <HealthBadge score={data.score} />

        {/* Nutri-Score & NOVA */}
        <View style={styles.badgesRow}>
          <View style={styles.badgeContainer}>
            <NutriScoreBadge grade={data.nutritionGrades} />
          </View>
          <View style={styles.badgeContainer}>
            <NovaGroupBadge group={data.novaGroup} />
          </View>
        </View>

        {/* Besin Seviyeleri */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Besin Seviyeleri</Text>
          <NutrientBar label="Yağ" level={data.fat} />
          <NutrientBar label="Doymuş Yağ" level={data.saturatedFat} />
          <NutrientBar label="Şeker" level={data.sugars} />
          <NutrientBar label="Tuz" level={data.salt} />
        </View>

        {/* Katkı Maddeleri */}
        {data.additivesTags && data.additivesTags.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🧪 Katkı Maddeleri</Text>
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
                  <Text key={i} style={styles.additiveDescText}>
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
              // enableAdding is NOT passed here, so it will be undefined (false)
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.calorieButtonIcon}>🔥</Text>
          <Text style={styles.calorieButtonText}>Kalori Detaylarını Gör</Text>
          <Text style={styles.calorieButtonArrow}>→</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImage: {
    width: 220,
    height: 220,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  productImagePlaceholder: {
    width: 220,
    height: 220,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImagePlaceholderText: {
    fontSize: 80,
  },
  barcodeLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginBottom: 4,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  productName: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    marginTop: Spacing.sm,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(45, 122, 79, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  badgeContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  additivesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  additiveChip: {
    backgroundColor: Colors.accentOrange + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accentOrange + '40',
  },
  additiveText: {
    color: Colors.accentOrange,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  additiveDescriptions: {
    marginTop: Spacing.md,
  },
  additiveDescText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  calorieButton: {
    backgroundColor: Colors.accentOrange + '15',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentOrange + '50',
    shadowColor: Colors.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  calorieButtonIcon: {
    fontSize: 28,
  },
  calorieButtonText: {
    flex: 1,
    color: Colors.accentOrange,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginLeft: Spacing.md,
  },
  calorieButtonArrow: {
    color: Colors.accentOrange,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
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
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});

export default AnalysisScreen;
