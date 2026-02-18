import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Colors, BorderRadius, FontSize } from '../constants/colors';

interface Props {
  label: string;
  level: string; // "low", "moderate", "high" veya Türkçe
  value?: number | null;
  unit?: string;
}

const getLevelInfo = (level: string): { color: string; text: string; width: DimensionValue } => {
  const l = level?.toLowerCase() || '';
  if (l.includes('low') || l.includes('düşük') || l.includes('az')) {
    return { color: Colors.levelLow, text: 'Düşük', width: '30%' };
  }
  if (l.includes('moderate') || l.includes('orta')) {
    return { color: Colors.levelModerate, text: 'Orta', width: '60%' };
  }
  return { color: Colors.levelHigh, text: 'Yüksek', width: '100%' };
};

const NutrientBar: React.FC<Props> = ({ label, level, value, unit }) => {
  const info = getLevelInfo(level);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.levelBadge, { backgroundColor: info.color + '25' }]}>
          <View style={[styles.levelDot, { backgroundColor: info.color }]} />
          <Text style={[styles.levelText, { color: info.color }]}>{info.text}</Text>
        </View>
      </View>
      {value !== undefined && value !== null && (
        <Text style={styles.value}>
          {value.toFixed(1)}g / 100g
        </Text>
      )}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: info.width,
              backgroundColor: info.color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  value: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 5,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  barBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default NutrientBar;
