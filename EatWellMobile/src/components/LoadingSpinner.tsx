// ==========================================
// LoadingSpinner — Yükleme göstergesi
// ==========================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/colors';

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = 'Yükleniyor...' }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
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
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          { transform: [{ rotate: spin }, { scale: pulseAnim }] },
        ]}
      >
        <Text style={styles.emoji}>🍎</Text>
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  spinner: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    marginTop: Spacing.lg,
    fontWeight: '500',
  },
});

export default LoadingSpinner;
