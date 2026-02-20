// ==========================================
// LoadingSpinner — Premium yükleme göstergesi
// ==========================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = 'Yükleniyor...' }) => {
  const { colors } = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Dönüş animasyonu
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Nabız efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Halka solunum
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 0.85,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glow arka plan */}
      <Animated.View style={[styles.glowRing, { opacity: pulseAnim, transform: [{ scale: ringScale }] }]} />
      
      <Animated.View
        style={[
          styles.spinner,
          { transform: [{ rotate: spin }] },
        ]}
      >
        <Text style={styles.emoji}>🍎</Text>
      </Animated.View>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      
      {/* Dot animasyonu */}
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.dot, { opacity: Animated.subtract(1.6, pulseAnim), backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 214, 143, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 143, 0.08)',
  },
  spinner: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 44,
  },
  message: {
    fontSize: FontSize.md,
    marginTop: Spacing.lg,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default LoadingSpinner;
