import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  score: number;
}

const HealthBadge: React.FC<Props> = ({ score }) => {
  const { colors, isDark } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  let gradientColors: [string, string] = ['#ef4444', '#f97316'];
  let label = 'Düşük Besin Değeri';
  let emoji = '⚠️';
  let labelColor = '#ef4444';

  if (score >= 70) {
    gradientColors = ['#22c55e', '#16a34a'];
    label = 'Mükemmel Seçim';
    emoji = '🏆';
    labelColor = '#16a34a';
  } else if (score >= 50) {
    gradientColors = ['#f59e0b', '#d97706'];
    label = 'Orta Düzey';
    emoji = '🔶';
    labelColor = '#d97706';
  }

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
      {/* Başlık */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.label, { color: labelColor }]}>{emoji}  {label}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>100 üzerinden sağlık puanı</Text>
        </View>
        <LinearGradient colors={gradientColors} style={styles.scorePill}>
          <Text style={styles.scoreNumber}>{score}</Text>
        </LinearGradient>
      </View>

      {/* Progress Bar */}
      <View style={[styles.track, { backgroundColor: colors.backgroundLight }]}>
        <Animated.View style={[styles.fill, { width: barWidth }]}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>

      {/* Scale hints */}
      <View style={styles.scaleRow}>
        <Text style={[styles.scaleText, { color: colors.textMuted }]}>Düşük</Text>
        <Text style={[styles.scaleText, { color: colors.textMuted }]}>Orta</Text>
        <Text style={[styles.scaleText, { color: colors.textMuted }]}>Mükemmel</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  scorePill: {
    borderRadius: BorderRadius.round,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 56,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: '#fff',
  },
  track: {
    height: 10,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default HealthBadge;
