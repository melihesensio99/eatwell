import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  label: string;
  level: string;
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
  const { colors } = useTheme();
  const info = getLevelInfo(level);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        <View style={[styles.levelBadge, { backgroundColor: info.color + '15' }]}>
          <View style={[styles.levelDot, { backgroundColor: info.color, shadowColor: info.color }]} />
          <Text style={[styles.levelText, { color: info.color }]}>{info.text}</Text>
        </View>
      </View>
      {value !== undefined && value !== null && (
        <Text style={[styles.value, { color: colors.textMuted }]}>
          {value.toFixed(1)}g / 100g
        </Text>
      )}
      <View style={[styles.barBackground, { backgroundColor: colors.divider }]}>
        <View
          style={[
            styles.barFill,
            {
              width: info.width,
              backgroundColor: info.color,
              shadowColor: info.color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  value: {
    fontSize: FontSize.xs,
    marginBottom: 6,
    fontWeight: '500',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    gap: 5,
  },
  levelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  levelText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});

export default NutrientBar;
