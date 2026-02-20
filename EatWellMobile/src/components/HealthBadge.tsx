import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  score: number;
}

const HealthBadge: React.FC<Props> = ({ score }) => {
  const { colors } = useTheme();
  
  let color = Colors.accentRed;
  let text = 'Düşük Besin Değeri';
  let icon = '🔴';
  let bgOpacity = '10';

  if (score >= 70) {
    color = Colors.healthy;
    text = 'Mükemmel Seçim';
    icon = '✅';
  } else if (score >= 50) {
    color = Colors.accentOrange;
    text = 'Orta Seviye';
    icon = '⚠️';
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { borderColor: color + '30', backgroundColor: color + bgOpacity }]}>
        <View style={[styles.scoreRing, { borderColor: color + '40' }]}>
          <View style={[styles.scoreCircle, { backgroundColor: colors.background, borderColor: color }]}>
            <Text style={[styles.scoreText, { color }]}>{score}</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color }]}>{text}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{score}/100 Sağlık Puanı</Text>
        </View>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  scoreRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  icon: {
    fontSize: 24,
  },
});

export default HealthBadge;
