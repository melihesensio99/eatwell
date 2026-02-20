// ==========================================
// CalorieScreen — Premium Kalori Bilgileri
// ==========================================

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  Easing,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { FoodCalorieInfo } from '../types';
import { productService } from '../services';
import { CalorieChart, LoadingSpinner } from '../components';
import { dailyLogService } from '../services/dailyLogService';
import { getDeviceId } from '../services/deviceService';

interface Props {
  route: any;
  navigation: any;
}

interface NutrientRow {
  label: string;
  value: number | null;
  unit: string;
  icon: string;
  color: string;
}

const CalorieScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { barcode, productName: paramProductName, enableAdding, initialDate } = route.params;
  const [data, setData] = useState<FoodCalorieInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('100');
  const [adding, setAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchCalorie();
  }, [barcode]);

  const fetchCalorie = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productService.getCalorieInfo(barcode);
      setData(result);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err: any) {
      setError('Kalori bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLog = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar giriniz.');
      return;
    }

    try {
      setAdding(true);
      const deviceId = await getDeviceId();
      await dailyLogService.addConsumption(deviceId, barcode, Number(amount), selectedDate);
      Alert.alert('Başarılı ✅', 'Ürün günlüğe eklendi!', [
        {
          text: 'Tamam',
          onPress: () => navigation.navigate('DailySummary'),
        },
      ]);
    } catch (err) {
      Alert.alert('Hata', 'Ürün eklenirken bir sorun oluştu.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Kalori bilgileri yükleniyor..." />;
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <View style={styles.errorIconWrap}>
          <Text style={styles.errorEmoji}>😔</Text>
        </View>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCalorie}>
          <Text style={styles.retryText}>🔄 Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  const nutrients: NutrientRow[] = [
    { label: 'Yağ', value: data.fat100g, unit: 'g', icon: '🫒', color: Colors.accentOrange },
    { label: 'Doymuş Yağ', value: data.saturatedFat100g, unit: 'g', icon: '🧈', color: Colors.accentRed },
    { label: 'Karbonhidrat', value: data.carbohydrates100g, unit: 'g', icon: '🍞', color: Colors.accent },
    { label: 'Şeker', value: data.sugars100g, unit: 'g', icon: '🍬', color: Colors.accentPurple },
    { label: 'Protein', value: data.proteins100g, unit: 'g', icon: '🥩', color: Colors.accentBlue },
    { label: 'Tuz', value: data.salt100g, unit: 'g', icon: '🧂', color: Colors.textSecondary },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Başlık */}
        <View style={[styles.header, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <Text style={styles.headerIcon}>🔥</Text>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Kalori Detayları</Text>
            <Text style={[styles.productName, { color: colors.textSecondary }]}>
              {data.productName || paramProductName || 'Bilinmeyen Ürün'}
            </Text>
          </View>
        </View>

        {/* Miktar Girişi ve Ekleme Butonu */}
        {enableAdding && (
          <View style={[styles.card, styles.addCard, { borderColor: colors.primary }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🍽️</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tüketim Ekle</Text>
            </View>
            
            {/* Tarih Seçimi */}
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <View style={[styles.dateSelector, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {!initialDate && (
                  <TouchableOpacity onPress={() => {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    setSelectedDate(prevDate);
                  }}>
                    <Text style={[styles.dateNavBtn, { color: colors.primary }]}>◀</Text>
                  </TouchableOpacity>
                )}
                <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                  {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  {selectedDate.toDateString() === new Date().toDateString() ? ' (Bugün)' : ''}
                </Text>
                {!initialDate && (
                  <TouchableOpacity onPress={() => {
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    if (nextDate <= new Date()) {
                      setSelectedDate(nextDate);
                    }
                  }} disabled={selectedDate.toDateString() === new Date().toDateString()}>
                    <Text style={[styles.dateNavBtn, selectedDate.toDateString() === new Date().toDateString() && styles.disabledBtn, { color: colors.primary }]}>▶</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Miktar"
                placeholderTextColor={colors.textMuted}
                autoFocus={true}
              />
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>gram</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.addButton, adding && styles.addButtonDisabled]}
              onPress={handleAddToLog}
              disabled={adding}
            >
              <Text style={styles.addButtonText}>
                {adding ? '⏳ Ekleniyor...' : '✅ Günlüğe Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Donut Chart */}
        {data.caloriePercentInfo && (
          <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Makro Dağılımı</Text>
            </View>
            <CalorieChart data={data.caloriePercentInfo} />
          </View>
        )}

        {/* Besin Değerleri Tablosu */}
        <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Besin Değerleri (100g)</Text>
          </View>
          {nutrients.map((nutrient, index) => (
            <View
              key={index}
              style={[
                styles.nutrientRow,
                index < nutrients.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider },
              ]}
            >
              <View style={styles.nutrientLeft}>
                <View style={[styles.nutrientIconWrap, { backgroundColor: nutrient.color + '12' }]}>
                  <Text style={styles.nutrientIcon}>{nutrient.icon}</Text>
                </View>
                <Text style={[styles.nutrientLabel, { color: colors.textPrimary }]}>{nutrient.label}</Text>
              </View>
              <View style={[styles.nutrientValueBadge, { backgroundColor: nutrient.color + '12' }]}>
                <Text style={[styles.nutrientValue, { color: nutrient.color }]}>
                  {nutrient.value !== null ? `${nutrient.value.toFixed(1)} ${nutrient.unit}` : '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Geri Butonu */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={[styles.backButtonText, { color: colors.textMuted }]}>← Geri Dön</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  headerIcon: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  productName: {
    fontSize: FontSize.sm,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addCard: {
    backgroundColor: Colors.primary + '08',
    borderWidth: 1.5,
    marginBottom: Spacing.md,
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
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  nutrientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nutrientIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutrientIcon: {
    fontSize: 18,
  },
  nutrientLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  nutrientValueBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  nutrientValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  backButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  unitBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  unitText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  dateNavBtn: {
    fontSize: 22,
    paddingHorizontal: Spacing.md,
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.3,
  },
});

export default CalorieScreen;
