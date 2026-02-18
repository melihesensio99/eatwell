
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors, FontSize, Spacing } from '../constants/colors';
import { CaloriePercent } from '../types';

interface Props {
  data: CaloriePercent;
}

const SIZE = 160;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CalorieChart: React.FC<Props> = ({ data }) => {
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
            {/* Background circle */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Segment circles */}
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
        {/* Center text */}
        <View style={styles.centerText}>
          <Text style={styles.kcalValue}>{data.energyKcal100g?.toFixed(0) || '—'}</Text>
          <Text style={styles.kcalLabel}>kcal</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendLabel}>{seg.label}</Text>
            <Text style={styles.legendValue}>%{seg.percent.toFixed(1)}</Text>
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
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  kcalLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  legend: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  legendValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});

export default CalorieChart;
