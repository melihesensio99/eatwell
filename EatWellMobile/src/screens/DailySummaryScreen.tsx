import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Animated,
  Easing,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { API_CONFIG } from '../constants/api';

import { dailyLogService } from '../services/dailyLogService';
import { DailySummaryDto } from '../types/dailyLog';
import { getDeviceId } from '../services/deviceService';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingSpinner, GoalChart, MacroCard, DetailPill } from '../components';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Ürün arama state (Moved to top)
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = (text: string) => {
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

  /* Edit & Delete Logic */
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newAmount, setNewAmount] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    
    // Android: selection closes the picker automatically
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'set') {
            setSelectedDate(currentDate);
        }
    } else {
        // iOS: Update state live as spinner spins, user confirms with "Onayla" button
        setSelectedDate(currentDate);
    }
  };


  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };


  const fetchSummary = async () => {
    try {
      const deviceId = await getDeviceId();
      const data = await dailyLogService.getDailySummary(deviceId, selectedDate);
      setSummary(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Günlük özet alınamadı.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* OLD useEffect was here, replacing with useFocusEffect */
  
  useFocusEffect(
    React.useCallback(() => {
      fetchSummary();
      return () => {
        // Optional cleanup
      };
    }, [selectedDate]) // Dependency: selectedDate. When date changes, we refetch.
  );
  
  // We keep fadeAnim reset logic in a separate useEffect if needed, 
  // or put it inside focus effect. Let's keep it simple.
  useEffect(() => {
     fadeAnim.setValue(0);
     // fetchSummary() is handled by useFocusEffect now when selectedDate changes OR focus happens
  }, [selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading) {
    return <LoadingSpinner message="Özet yükleniyor..." />;
  }


  const handleDeletePress = (item: any) => {
    Alert.alert(
      'Kaydı Sil',
      `"${item.productName}" kaydını silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const deviceId = await getDeviceId();
              await dailyLogService.deleteConsumption(item.id, deviceId);
              fetchSummary(); // Refresh list
            } catch (error) {
              Alert.alert('Hata', 'Kayıt silinemedi.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditPress = (item: any) => {
    setEditingItem(item);
    setNewAmount(item.amount.toString());
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingItem || !newAmount) return;
    
    const amountVal = parseFloat(newAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir miktar girin.');
      return;
    }

    try {
      setLoading(true);
      const deviceId = await getDeviceId();
      await dailyLogService.updateConsumption(editingItem.id, deviceId, amountVal);
      setEditModalVisible(false);
      setEditingItem(null);
      fetchSummary();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanToAdd = () => {
    setAddModalVisible(false);
    navigation.navigate('BarcodeScanner', { 
      nextScreen: 'Calorie',
      nextScreenParams: { 
        enableAdding: true,
        initialDate: selectedDate.toISOString() 
      }
    });
  };





  const handleSelectSearchProduct = (code: string) => {
    setAddModalVisible(false);
    setSearchText('');
    setSearchResults([]);
    navigation.navigate('Calorie', {
      barcode: code,
      enableAdding: true,
      initialDate: selectedDate.toISOString(),
    });
  };

  const totalCal = summary?.totalCalorie ? Math.round(summary.totalCalorie) : 0;
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header — Tarih */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Günlük Özet</Text>
              
              <TouchableOpacity 
                style={styles.calendarBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.calendarIcon}>📅</Text>
                <Text style={[styles.dateText, { color: colors.primary }]}>
                   {isToday ? 'Bugün' : selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.headerGoalBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => navigation.navigate('CalorieGoal')}
            >
              <Text style={[styles.headerGoalText, { color: colors.primary }]}>🎯 Kalori Belirle</Text>
            </TouchableOpacity>
          </View>

          {/* Tarih Seçici (Picker) */}
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerModalOverlay}>
                  <View style={[styles.datePickerModalContent, { backgroundColor: colors.backgroundCard }]}>
                    {/* Toolbar */}
                    <View style={styles.datePickerToolbar}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Vazgeç</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        // iOS'te onChangeDate zaten selectedDate'i güncelliyor (temp olarak),
                        // ama burada "Onayla" diyerek kapatıyoruz. 
                        // Gerçek bir "temp state" kullanmak daha temiz olurdu ama 
                        // şimdilik inline değişim kullanıcıya anlık feedback veriyor.
                        setShowDatePicker(false);
                        fetchSummary(); // Tarih değiştiği için veriyi çek
                      }}>
                        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Onayla</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={onChangeDate}
                      maximumDate={new Date()}
                      textColor={colors.textPrimary}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )
          )}

          {/* Navigasyon Okları */}
          <View style={[styles.dateSelector, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.dateBtn, { backgroundColor: colors.backgroundLight }]}
              onPress={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate);
              }}
            >
              <Text style={[styles.dateBtnText, { color: colors.primary }]}>◀ Önceki</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateBtn, { backgroundColor: isToday ? 'transparent' : colors.backgroundLight }]}
              onPress={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                if (nextDate <= new Date()) {
                  setSelectedDate(nextDate);
                }
              }} 
              disabled={isToday}
            >
              <Text style={[styles.dateBtnText, isToday && styles.disabledBtn, { color: colors.primary }]}>Sonraki ▶</Text>
            </TouchableOpacity>
          </View>

          {/* Ana Kalori Kartı */}
          <View style={[styles.mainCard, { borderColor: colors.primary + '30' }]}>
            <View style={styles.mainCardGlow} />



            <GoalChart current={totalCal} target={summary?.calorieGoal || 0} />
          </View>

          {/* Makro Besinler */}
          <View style={styles.macroContainer}>
            <MacroCard 
              label="Protein" 
              value={summary?.totalProtein} 
              unit="g" 
              color={Colors.accentBlue} 
              icon="🥩"
              colors={colors}
            />
            <MacroCard 
              label="Yağ" 
              value={summary?.totalFat} 
              unit="g" 
              color={Colors.accentOrange} 
              icon="🫒"
              colors={colors}
            />
            <MacroCard 
              label="Karb." 
              value={summary?.totalCarb} 
              unit="g" 
              color={Colors.accent} 
              icon="🍞"
              colors={colors}
            />
          </View>

          {/* Tüketilenler Listesi */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tüketilenler</Text>
            <Text style={[styles.itemCount, { color: colors.textMuted }]}>
              {summary?.consumedItems?.length || 0} ürün
            </Text>
          </View>

          {summary?.consumedItems && summary.consumedItems.length > 0 ? (
            summary.consumedItems.map((item, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.itemCard, 
                    { backgroundColor: colors.backgroundCard, borderColor: isExpanded ? colors.primary + '50' : colors.border },
                  ]}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.85}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.productName || `Ürün #${item.code}`}
                      </Text>
                      <Text style={[styles.itemAmount, { color: colors.textMuted }]}>{item.amount}g</Text>
                    </View>
                    <View style={styles.itemMeta}>
                      <Text style={[styles.itemCalories, { color: colors.primary }]}>
                        {Math.round(item.calories)} kcal
                      </Text>
                      <Text style={[styles.expandIcon, { color: colors.textMuted }]}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={[styles.itemDetails, { borderTopColor: colors.divider }]}>
                      <View style={styles.detailRow}>
                         <DetailPill label="Protein" value={item.protein} color={Colors.accentBlue} />
                         <DetailPill label="Yağ" value={item.fat} color={Colors.accentOrange} />
                         <DetailPill label="Karb." value={item.carb} color={Colors.accent} />
                      </View>
                      
                      <View style={styles.actionRow}>
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}
                          onPress={() => handleEditPress(item)}
                        >
                          <Text style={[styles.actionBtnText, { color: colors.primary }]}>✏️ Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: Colors.accentRed + '15', borderColor: Colors.accentRed + '30' }]}
                          onPress={() => handleDeletePress(item)}
                        >
                          <Text style={[styles.actionBtnText, { color: Colors.accentRed }]}>🗑️ Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Henüz bir şey eklenmedi
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                Ürün eklemek için + butonuna dokunun
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { shadowColor: Colors.primary }]}
        onPress={() => { setSearchText(''); setSearchResults([]); setAddModalVisible(true); }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {/* Ürün Ekleme Modalı */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addModalOverlay}>
          <View style={[styles.addModalContent, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.addModalHeader}>
              <Text style={[styles.addModalTitle, { color: colors.textPrimary }]}>Ürün Ekle</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={{ fontSize: 24, color: colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Arama input */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 10 }} // Reduced padding
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            <View style={[styles.addSearchWrapper, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <TextInput
                style={[styles.addSearchInput, { color: colors.textPrimary }]}
                placeholder="Ürün adı girin..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={handleSearchInput}
                onSubmitEditing={executeSearch}
                returnKeyType="search"
                autoFocus
              />
              {isSearching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <TouchableOpacity onPress={executeSearch}>
                  <Text style={{ fontSize: 16, marginLeft: 8 }}>🔍</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Separator */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ marginHorizontal: 10, color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>VEYA</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            {/* Barkod tara seçeneği (Taşındı) */}
            <TouchableOpacity
              style={[styles.addScanBtn, { backgroundColor: colors.backgroundLight, borderColor: colors.border, marginBottom: searchResults.length > 0 ? 8 : 16 }]}
              onPress={handleScanToAdd}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>📷</Text>
              <View>
                <Text style={[styles.addScanText, { color: colors.textPrimary }]}>Barkod ile Ekle</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Kamerayı aç</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={{ fontSize: 18, color: colors.textMuted, opacity: 0.5 }}>›</Text>
            </TouchableOpacity>

            {/* Sonuçlar */}
            {searchResults.length > 0 && (
              <View style={[styles.addSearchResults, { borderColor: colors.border }]}>
                {searchResults.map((item, index) => (
                  <TouchableOpacity
                    key={item.code || index}
                    style={[styles.addSearchItem, index < searchResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
                    onPress={() => handleSelectSearchProduct(item.code)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[{ fontSize: 14, fontWeight: '600' }, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text style={[{ fontSize: 11, marginTop: 2 }, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.brands || 'Marka bilinmiyor'}
                        {item.caloriesPer100g ? ` · ${Math.round(item.caloriesPer100g)} kcal/100g` : ''}
                      </Text>
                    </View>
                    {item.nutritionGrade && (
                      <View style={[styles.addGradeBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                          {item.nutritionGrade.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}




            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Edit Modal */}
      {editModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Miktarı Güncelle</Text>
            {editingItem && (
               <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{editingItem.productName}</Text>
            )}
            
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numeric"
                placeholder="Gramaj"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <Text style={[styles.inputUnit, { color: colors.textMuted }]}>g</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.backgroundLight }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={saveEdit}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    // backgroundColor: 'rgba(255,255,255,0.05)', // Optional background
  },
  calendarIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  headerGoalBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerGoalText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  dateText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: 4,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  dateBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  dateBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.25,
  },
  mainCard: {
    alignItems: 'center',
    borderRadius: BorderRadius.xxl,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    backgroundColor: Colors.primary + '06',
    overflow: 'hidden',
  },
  mainCardGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + '08',
    top: -60,
    alignSelf: 'center',
  },
  totalCalorieEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  totalCalorieValue: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  totalCalorieUnit: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  itemCount: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  itemCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
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
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  itemCalories: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  expandIcon: {
    fontSize: 10,
    marginTop: 4,
  },
  itemDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  detailPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  detailPillLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailPillValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  goalSection: {
    width: '100%',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  goalBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  goalRemaining: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  goalEditLink: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  goalEditText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  setGoalBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderStyle: 'dashed' as any,
    alignSelf: 'center',
  },
  setGoalText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  detailRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerModalContent: {
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  datePickerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  inputUnit: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  setGoalBtnAbs: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.round,
    zIndex: 10,
  },

  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  addModalContent: {
    borderRadius: BorderRadius.xl, // All corners rounded for floating top card
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginHorizontal: Spacing.md, // Add margin to make it look floating
    maxHeight: '80%',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  addSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  addSearchInput: {
    flex: 1,
    fontSize: FontSize.md,
    padding: 0,
  },
  addSearchResults: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  addSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  addGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  addSearchHint: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    fontSize: FontSize.md,
  },
  addScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    // borderStyle: 'dashed', // Removed dash for cleaner look
  },
  addScanText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});

export default DailySummaryScreen;
