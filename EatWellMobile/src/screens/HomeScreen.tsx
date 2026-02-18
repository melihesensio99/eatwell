import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [barcode, setBarcode] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Giriş animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Buton nabız efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleAnalyze = () => {
    const trimmed = barcode.trim();
    if (!trimmed) {
      Alert.alert('Uyarı', 'Lütfen bir barkod numarası girin.');
      return;
    }
    navigation.navigate('Analysis', { barcode: trimmed });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Tema Değiştirme */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
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
          <Text style={styles.emoji}>🥗</Text>
          <Text style={styles.title}>EatWell</Text>
          <Text style={styles.titleAccent}>FeelWell</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Barkod okutarak ürünlerin besin değerlerini{'\n'}ve sağlık analizini görün
          </Text>
        </View>

        {/* Barkod giriş alanı */}
        <View style={styles.inputSection}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Text style={styles.inputIcon}>🔍</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Barkod numarası girin..."
              placeholderTextColor={colors.textMuted}
              value={barcode}
              onChangeText={setBarcode}
              keyboardType="number-pad"
              returnKeyType="search"
              onSubmitEditing={handleAnalyze}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleAnalyze}
              activeOpacity={0.8}
            >
              <Text style={styles.analyzeButtonIcon}>📊</Text>
              <Text style={styles.analyzeButtonText}>Ürünü Analiz Et</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Kamera ile Barkod Tara */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('BarcodeScanner')}
            activeOpacity={0.8}
          >
            <Text style={styles.scanButtonIcon}>📷</Text>
            <Text style={styles.scanButtonText}>Kamera ile Tara</Text>
          </TouchableOpacity>


          {/* Günlük Özet Butonu */}
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => navigation.navigate('DailySummary')}
            activeOpacity={0.8}
          >
            <Text style={styles.logButtonIcon}>📅</Text>
            <Text style={styles.logButtonText}>Günlük Özeti Gör</Text>
          </TouchableOpacity>
        </View>

        {/* Hızlı test barkodları */}
        <View style={styles.quickCodes}>
          <Text style={styles.quickCodesTitle}>Hızlı Test</Text>
          <View style={styles.quickCodesRow}>
            {['8690504058687', '8690637843518', '80135463'].map((code) => (
              <TouchableOpacity
                key={code}
                style={styles.quickCodeChip}
                onPress={() => {
                  setBarcode(code);
                  navigation.navigate('Analysis', { barcode: code });
                }}
              >
                <Text style={styles.quickCodeText}>{code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  titleAccent: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -1,
    marginTop: -8,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  inputSection: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 56,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzeButtonIcon: {
    fontSize: 20,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  quickCodes: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  quickCodesTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickCodesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickCodeChip: {
    backgroundColor: Colors.backgroundGlass,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickCodeText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accentOrange + '40',
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    color: Colors.accentOrange,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  logButton: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accentBlue + '40',
  },
  logButtonIcon: {
    fontSize: 20,
  },
  logButtonText: {
    color: Colors.accentBlue,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  themeToggleText: {
    fontSize: 22,
  },
});

export default HomeScreen;
