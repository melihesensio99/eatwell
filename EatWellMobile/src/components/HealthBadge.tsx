import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';

interface Props {
  score: number;
}

const HealthBadge: React.FC<Props> = ({ score }) => {
  let color = Colors.unhealthy; // Kırmızı (0-49)
  let text = 'Düşük Besin Değeri';
  let icon = '🔴';

  if (score >= 70) {
    color = Colors.healthy; // Yeşil (70-100)
    text = 'Mükemmel Seçim';
    icon = '✅';
  } else if (score >= 50) {
    color = Colors.accentOrange; // Turuncu (50-69)
    text = 'Orta Seviye';
    icon = '⚠️';
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { borderColor: color, backgroundColor: color + '15' }]}>
        <View style={[styles.scoreCircle, { borderColor: color }]}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color }]}>{text}</Text>
          <Text style={styles.subtitle}>{score}/100 Sağlık Puanı</Text>
        </View>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  icon: {
    fontSize: 28,
  },
});

export default HealthBadge;
