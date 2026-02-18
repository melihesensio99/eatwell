import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { dailyLogService, DailySummaryDto } from '../services/dailyLogService';
import { getDeviceId } from '../services/deviceService';
import { LoadingSpinner } from '../components';

interface Props {
  navigation: any;
}


if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const DailySummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<DailySummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const fetchSummary = async () => {
    try {
      const deviceId = await getDeviceId();
      const data = await dailyLogService.getDailySummary(deviceId, selectedDate);
      setSummary(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Günlük özet alınamadı.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading) {
    return <LoadingSpinner message="Özet yükleniyor..." />;
  }

  const handleScanToAdd = () => {
    navigation.navigate('BarcodeScanner', { 
      nextScreen: 'Calorie',
      nextScreenParams: { 
        enableAdding: true,
        initialDate: selectedDate.toISOString() 
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Günlük Özet</Text>
        <TouchableOpacity onPress={() => {
            const date = new Date(); // Reset to today
            setSelectedDate(date);
        }}>
            <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
            {selectedDate.toDateString() === new Date().toDateString() ? ' (Bugün)' : ''}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Tarih Seçimi */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => {
          const prevDate = new Date(selectedDate);
          prevDate.setDate(prevDate.getDate() - 1);
          setSelectedDate(prevDate);
        }}>
          <Text style={styles.dateNavBtn}>◀ Önceki Gün</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => {
          const nextDate = new Date(selectedDate);
          nextDate.setDate(nextDate.getDate() + 1);
          if (nextDate <= new Date()) {
              setSelectedDate(nextDate);
          }
        }} disabled={selectedDate.toDateString() === new Date().toDateString()}>
          <Text style={[styles.dateNavBtn, selectedDate.toDateString() === new Date().toDateString() && styles.disabledBtn]}>Sonraki Gün ▶</Text>
        </TouchableOpacity>
      </View>

      {/* Ana Kalori Kartı */}
      <View style={[styles.card, styles.mainCard]}>
        <Text style={styles.totalCalorieLabel}>Toplam Kalori</Text>
        <Text style={styles.totalCalorieValue}>
          {summary?.totalCalorie ? Math.round(summary.totalCalorie) : 0} kcal
        </Text>
      </View>

      {/* Makro Besinler */}
      <View style={styles.macroContainer}>
        <MacroCard 
          label="Protein" 
          value={summary?.totalProtein} 
          unit="g" 
          color={Colors.accentBlue} 
          icon="🥩"
        />
        <MacroCard 
          label="Yağ" 
          value={summary?.totalFat} 
          unit="g" 
          color={Colors.accentOrange} 
          icon="🫒"
        />
        <MacroCard 
          label="Karb." 
          value={summary?.totalCarb} 
          unit="g" 
          color={Colors.accent} 
          icon="🍞"
        />
      </View>

      {/* Tüketilenler Listesi */}
      <Text style={styles.sectionTitle}>Tüketilenler</Text>
      {summary?.consumedItems && summary.consumedItems.length > 0 ? (
        summary.consumedItems.map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.itemCard, isExpanded && styles.itemCardExpanded]}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.9}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.productName || `Ürün #${item.code}`}
                  </Text>
                  <Text style={styles.itemAmount}>{item.amount}g</Text>
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemCalories}>{Math.round(item.calories)} kcal</Text>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Protein</Text>
                    <Text style={[styles.detailValue, { color: Colors.accentBlue }]}>
                      {item.protein ? item.protein.toFixed(1) : 0}g
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Yağ</Text>
                    <Text style={[styles.detailValue, { color: Colors.accentOrange }]}>
                      {item.fat ? item.fat.toFixed(1) : 0}g
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Karb.</Text>
                    <Text style={[styles.detailValue, { color: Colors.accent }]}>
                      {item.carb ? item.carb.toFixed(1) : 0}g
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          </View>
        )}
      </ScrollView>

      {/* FAB - Ürün Ekle Butonu */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleScanToAdd}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>➕</Text>
      </TouchableOpacity>
    </View>
  );
};

const MacroCard = ({ label, value, unit, color, icon }: any) => (
  <View style={[styles.macroCard, { borderColor: color }]}>
    <Text style={styles.macroIcon}>{icon}</Text>
    <Text style={[styles.macroValue, { color }]}>
      {value ? Math.round(value) : 0}{unit}
    </Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  dateText: {
    color: Colors.accentBlue,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateNavBtn: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  disabledBtn: {
    color: Colors.textMuted,
    opacity: 0.5,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.primary + '10', // Light primary background
    borderColor: Colors.primary,
  },
  totalCalorieLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    marginBottom: Spacing.xs,
  },
  totalCalorieValue: {
    color: Colors.primary,
    fontSize: 48,
    fontWeight: '800',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderBottomWidth: 4, 
  },
  macroIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  macroValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  macroLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  itemCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  itemCardExpanded: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemAmount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  itemCalories: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  itemDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailRow: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: -2,
  },
});

export default DailySummaryScreen;
