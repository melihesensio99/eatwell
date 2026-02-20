import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  current: number;
  target: number;
}

const SIZE = 200;
const STROKE_WIDTH = 15;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const GoalChart: React.FC<Props> = ({ current, target }) => {
  const { colors } = useTheme();
  
  /* Safe percentage calculation */
  const safeTarget = target > 0 ? target : 1; // Avoid division by zero
  const percentage = target > 0 ? Math.min(Math.max(current / safeTarget, 0), 1) : 0;
  const dashLength = percentage * CIRCUMFERENCE;
  
  const isOver = target > 0 && current > target;
  const progressColor = isOver ? Colors.accentRed : Colors.primary;
  
  const displayDashLength = isOver ? CIRCUMFERENCE : dashLength;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} originX={SIZE / 2} originY={SIZE / 2}>
            {/* Background Circle */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={colors.border}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeOpacity={0.3}
            />
            {/* Progress Circle */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={progressColor}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={`${displayDashLength}, ${CIRCUMFERENCE}`}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        {/* Center Text */}
        <View style={styles.centerText}>
          <Text style={styles.emoji}>🍎</Text>
          <Text style={[styles.currentValue, { color: colors.textPrimary }]}>
            {Math.round(current)}
          </Text>
          
          {target > 0 ? (
            <>
              <Text style={[styles.targetValue, { color: colors.textMuted }]}>
                / {Math.round(target)} kcal
              </Text>
              {isOver && (
                <Text style={[styles.overText, { color: Colors.accentRed }]}>
                  +{Math.round(current - target)} Aşıldı
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.targetValue, { color: colors.textMuted, fontSize: 12 }]}>
              Hedef Belirlenmedi
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
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
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
  },
  targetValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginTop: 2,
  },
  overText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

export default GoalChart;
