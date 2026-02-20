import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { CaloriePercent } from '../types';

interface Props {
  data: CaloriePercent;
}

const SIZE = 170;
const STROKE_WIDTH = 22;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CalorieChart: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const total = (data.fatPercent || 0) + (data.proteinPercent || 0) + (data.carbPercent || 0);
  if (total <= 0) return null;

  const segments = [
    { label: 'Yağ', percent: data.fatPercent, color: Colors.accentOrange },
    { label: 'Protein', percent: data.proteinPercent, color: Colors.accentBlue },
    { label: 'Karbonhidrat', percent: data.carbPercent, color: Colors.accent },
  ];

  let cumulativePercent = 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} originX={SIZE / 2} originY={SIZE / 2}>
            {/* Arka plan halkası */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Segment halkaları */}
            {segments.map((seg, i) => {
              const dashLength = (seg.percent / 100) * CIRCUMFERENCE;
              const dashOffset = -(cumulativePercent / 100) * CIRCUMFERENCE;
              cumulativePercent += seg.percent;

              return (
                <Circle
                  key={i}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={seg.color}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                  strokeDasharray={[dashLength, CIRCUMFERENCE - dashLength]}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>
        {/* Merkez değer */}
        <View style={styles.centerText}>
          <Text style={[styles.kcalValue, { color: colors.textPrimary }]}>
            {data.energyKcal100g?.toFixed(0) || '—'}
          </Text>
          <Text style={[styles.kcalLabel, { color: colors.textMuted }]}>kcal</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={[styles.legendItem, { backgroundColor: seg.color + '10' }]}>
            <View style={[styles.legendDot, { backgroundColor: seg.color, shadowColor: seg.color }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>{seg.label}</Text>
            <Text style={[styles.legendValue, { color: seg.color }]}>%{seg.percent.toFixed(0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  chartWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  kcalValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  kcalLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legend: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});

export default CalorieChart;
