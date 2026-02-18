// ==========================================
// CalorieScreen — Kalori Bilgileri Ekranı
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

  useEffect(() => {
    fetchCalorie();
  }, [barcode]);

  const fetchCalorie = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productService.getCalorieInfo(barcode);
      setData(result);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
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
      Alert.alert('Başarılı', 'Ürün günlüğe eklendi!', [
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorText}>{error}</Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Başlık */}
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 Kalori Detayları</Text>
          <Text style={styles.productName}>
            {data.productName || paramProductName || 'Bilinmeyen Ürün'}
          </Text>
        </View>

        {/* Miktar Girişi ve Ekleme Butonu (SADECE EKLEME MODUNDA VE EN ÜSTTE) */}
        {enableAdding && (
          <View style={[styles.card, styles.addCard]}>
            <Text style={styles.sectionTitle}>🍽️ Tüketim Ekle</Text>
            
            {/* Tarih Seçimi (Sadece bugün değilse göster) */}
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <View style={styles.dateSelector}>
                {!initialDate && (
                  <TouchableOpacity onPress={() => {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    setSelectedDate(prevDate);
                  }}>
                    <Text style={styles.dateNavBtn}>◀</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.dateText}>
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
                    <Text style={[styles.dateNavBtn, selectedDate.toDateString() === new Date().toDateString() && styles.disabledBtn]}>▶</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Miktar"
                placeholderTextColor={Colors.textMuted}
                autoFocus={true}
              />
              <Text style={styles.unitText}>gram</Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, adding && styles.addButtonDisabled]}
              onPress={handleAddToLog}
              disabled={adding}
            >
              <Text style={styles.addButtonText}>
                {adding ? 'Ekleniyor...' : 'Günlüğe Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Donut Chart */}
        {data.caloriePercentInfo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Makro Besin Dağılımı</Text>
            <CalorieChart data={data.caloriePercentInfo} />
          </View>
        )}

        {/* Besin Değerleri Tablosu */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📋 Besin Değerleri (100g)</Text>
          {nutrients.map((nutrient, index) => (
            <View
              key={index}
              style={[
                styles.nutrientRow,
                index < nutrients.length - 1 && styles.nutrientRowBorder,
              ]}
            >
              <View style={styles.nutrientLeft}>
                <Text style={styles.nutrientIcon}>{nutrient.icon}</Text>
                <Text style={styles.nutrientLabel}>{nutrient.label}</Text>
              </View>
              <View style={[styles.nutrientValueBadge, { backgroundColor: nutrient.color + '15' }]}>
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
          <Text style={styles.backButtonText}>← Analiz Ekranına Dön</Text>
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
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  productName: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addCard: {
    backgroundColor: Colors.primary + '10', // Hafif vurgulu arka plan
    borderColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  nutrientRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  nutrientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nutrientIcon: {
    fontSize: 20,
  },
  nutrientLabel: {
    color: Colors.textPrimary,
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
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '600',
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
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
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
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  unitText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateNavBtn: {
    fontSize: 24,
    color: Colors.primary,
    paddingHorizontal: Spacing.md,
  },
  dateText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  disabledBtn: {
    color: Colors.textMuted,
    opacity: 0.5,
  },
});

export default CalorieScreen;
