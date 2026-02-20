import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { calorieGoalService } from '../services/dailyLogService';
import { CalorieGoalResponse, SetCalorieGoalRequest } from '../types/dailyLog';
import { getDeviceId } from '../services/deviceService';
import { LoadingSpinner } from '../components';

interface Props {
  navigation: any;
}

const ACTIVITY_LEVELS = [
  { value: 1, label: 'Hareketsiz', desc: 'Masa başı iş', icon: '🪑', multiplier: '×1.2' },
  { value: 2, label: 'Hafif Aktif', desc: 'Haftada 1-3 gün', icon: '🚶', multiplier: '×1.375' },
  { value: 3, label: 'Orta Aktif', desc: 'Haftada 3-5 gün', icon: '🏃', multiplier: '×1.55' },
  { value: 4, label: 'Çok Aktif', desc: 'Haftada 6-7 gün', icon: '🏋️', multiplier: '×1.725' },
  { value: 5, label: 'Ekstra Aktif', desc: 'Günde 2 idman', icon: '⚡', multiplier: '×1.9' },
];

const GOAL_TYPES = [
  { value: 0, label: 'Koruma', desc: 'Kiloyu koru', icon: '⚖️', adjustment: '±0' },
  { value: 1, label: 'Kas Kazanımı', desc: 'Bulk (+400 kcal)', icon: '💪', adjustment: '+400' },
  { value: 2, label: 'Yağ Yakımı', desc: 'Cut (-400 kcal)', icon: '🔥', adjustment: '-400' },
];

const GENDERS = [
  { value: 'male', label: 'Erkek', icon: '👨' },
  { value: 'female', label: 'Kadın', icon: '👩' },
];

const CalorieGoalScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingGoal, setExistingGoal] = useState<CalorieGoalResponse | null>(null);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState(1);
  const [goalType, setGoalType] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadExistingGoal();
  }, []);

  const loadExistingGoal = async () => {
    try {
      const deviceId = await getDeviceId();
      const result = await calorieGoalService.getGoal(deviceId);
      if (result.hasGoal && result.goal) {
        setExistingGoal(result.goal);
        setWeight(result.goal.weight.toString());
        setHeight(result.goal.height.toString());
        setAge(result.goal.age.toString());
        setGender(result.goal.gender);
        setActivityLevel(result.goal.activityLevel);
        setGoalType(result.goal.goalType);
      }
    } catch (err) {
      console.error('Goal yüklenemedi:', err);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSave = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (!w || w <= 0 || !h || h <= 0 || !a || a <= 0) {
      Alert.alert('Hata', 'Lütfen tüm değerleri doğru girin.');
      return;
    }

    try {
      setSaving(true);
      const deviceId = await getDeviceId();
      const data: SetCalorieGoalRequest = {
        weight: w,
        height: h,
        age: a,
        gender,
        activityLevel,
        goalType,
      };
      const result = await calorieGoalService.setGoal(deviceId, data);
      setExistingGoal(result.goal);
      Alert.alert('Başarılı ✅', `Günlük kalori hedefiniz: ${Math.round(result.goal.dailyCalorieTarget)} kcal`, [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Hata', 'Kalori hedefi kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Profil yükleniyor..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🎯</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Kalori Hedefi</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            BMR & TDEE bazlı hesaplama
          </Text>
        </View>

        {/* Mevcut hedef gösterimi */}
        {existingGoal && (
          <View style={[styles.resultCard, { borderColor: colors.primary + '30' }]}>
            <View style={styles.resultGlow} />
            <View style={styles.resultRow}>
              <ResultItem label="BMR" value={Math.round(existingGoal.bmr)} unit="kcal" color={colors.accentBlue} />
              <ResultItem label="TDEE" value={Math.round(existingGoal.tdee)} unit="kcal" color={colors.accentOrange} />
              <ResultItem label="Hedef" value={Math.round(existingGoal.dailyCalorieTarget)} unit="kcal" color={colors.primary} />
            </View>
          </View>
        )}

        {/* Cinsiyet */}
        <SectionTitle icon="👤" title="Cinsiyet" colors={colors} />
        <View style={styles.optionRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.genderCard,
                { backgroundColor: colors.backgroundCard, borderColor: gender === g.value ? colors.primary : colors.border },
                gender === g.value && { borderWidth: 2 },
              ]}
              onPress={() => setGender(g.value)}
            >
              <Text style={styles.genderIcon}>{g.icon}</Text>
              <Text style={[styles.genderLabel, { color: gender === g.value ? colors.primary : colors.textPrimary }]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fiziksel Bilgiler */}
        <SectionTitle icon="📏" title="Fiziksel Bilgiler" colors={colors} />
        <View style={styles.inputRow}>
          <InputField
            label="Kilo"
            value={weight}
            onChangeText={setWeight}
            unit="kg"
            icon="⚖️"
            colors={colors}
          />
          <InputField
            label="Boy"
            value={height}
            onChangeText={setHeight}
            unit="cm"
            icon="📐"
            colors={colors}
          />
          <InputField
            label="Yaş"
            value={age}
            onChangeText={setAge}
            unit="yıl"
            icon="🎂"
            colors={colors}
          />
        </View>

        {/* Aktivite Seviyesi */}
        <SectionTitle icon="🏃" title="Aktivite Seviyesi" colors={colors} />
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.selectCard,
              { backgroundColor: colors.backgroundCard, borderColor: activityLevel === level.value ? colors.accentBlue : colors.border },
              activityLevel === level.value && { borderWidth: 2 },
            ]}
            onPress={() => setActivityLevel(level.value)}
          >
            <Text style={styles.selectIcon}>{level.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectLabel, { color: activityLevel === level.value ? colors.accentBlue : colors.textPrimary }]}>
                {level.label}
              </Text>
              <Text style={[styles.selectDesc, { color: colors.textMuted }]}>{level.desc}</Text>
            </View>
            <Text style={[styles.multiplier, { color: colors.accentBlue }]}>{level.multiplier}</Text>
          </TouchableOpacity>
        ))}

        {/* Hedef Tipi */}
        <SectionTitle icon="🎯" title="Hedefiniz" colors={colors} />
        {GOAL_TYPES.map((goal) => (
          <TouchableOpacity
            key={goal.value}
            style={[
              styles.selectCard,
              { backgroundColor: colors.backgroundCard, borderColor: goalType === goal.value ? colors.primary : colors.border },
              goalType === goal.value && { borderWidth: 2 },
            ]}
            onPress={() => setGoalType(goal.value)}
          >
            <Text style={styles.selectIcon}>{goal.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectLabel, { color: goalType === goal.value ? colors.primary : colors.textPrimary }]}>
                {goal.label}
              </Text>
              <Text style={[styles.selectDesc, { color: colors.textMuted }]}>{goal.desc}</Text>
            </View>
            <Text style={[styles.multiplier, { color: colors.primary }]}>{goal.adjustment}</Text>
          </TouchableOpacity>
        ))}

        {/* Kaydet Butonu */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '⏳ Hesaplanıyor...' : '💾 Hesapla ve Kaydet'}
          </Text>
        </TouchableOpacity>

        {/* Formül Bilgisi */}
        <View style={[styles.infoCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>📐 Mifflin-St Jeor Formülü</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Erkek: (10×kilo) + (6.25×boy) − (5×yaş) + 5{'\n'}
            Kadın: (10×kilo) + (6.25×boy) − (5×yaş) − 161{'\n\n'}
            TDEE = BMR × Aktivite Çarpanı
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const SectionTitle = ({ icon, title, colors }: any) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionIcon}>{icon}</Text>
    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
  </View>
);

const InputField = ({ label, value, onChangeText, unit, icon, colors }: any) => (
  <View style={[styles.inputField, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
    <Text style={styles.inputIcon}>{icon}</Text>
    <TextInput
      style={[styles.input, { color: colors.textPrimary }]}
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      placeholder="0"
      placeholderTextColor={colors.textMuted}
    />
    <Text style={[styles.unitText, { color: colors.textMuted }]}>{unit}</Text>
  </View>
);

const ResultItem = ({ label, value, unit, color }: any) => (
  <View style={styles.resultItem}>
    <Text style={[styles.resultLabel, { color: color }]}>{label}</Text>
    <Text style={[styles.resultValue, { color }]}>{value}</Text>
    <Text style={[styles.resultUnit, { color: color + '80' }]}>{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxl + 20 },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  headerIcon: { fontSize: 48, marginBottom: Spacing.sm },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 4 },
  resultCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.primary + '06',
    overflow: 'hidden',
  },
  resultGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + '08',
    top: -60,
    alignSelf: 'center',
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-around' },
  resultItem: { alignItems: 'center' },
  resultLabel: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  resultValue: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  resultUnit: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: -0.3 },
  optionRow: { flexDirection: 'row', gap: Spacing.sm },
  genderCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  genderIcon: { fontSize: 32, marginBottom: Spacing.xs },
  genderLabel: { fontSize: FontSize.md, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  inputField: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  inputIcon: { fontSize: 20, marginBottom: Spacing.xs },
  input: { fontSize: FontSize.xl, fontWeight: '800', textAlign: 'center', width: '100%' },
  unitText: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 4 },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  selectIcon: { fontSize: 24 },
  selectLabel: { fontSize: FontSize.md, fontWeight: '700' },
  selectDesc: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },
  multiplier: { fontSize: FontSize.sm, fontWeight: '800' },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '800' },
  infoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
  },
  infoTitle: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: Spacing.sm },
  infoText: { fontSize: FontSize.xs, fontWeight: '500', lineHeight: 20, fontVariant: ['tabular-nums'] },
});

export default CalorieGoalScreen;
