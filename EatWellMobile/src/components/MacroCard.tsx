import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';

interface MacroCardProps {
  label: string;
  value: number | undefined;
  unit: string;
  color: string;
  icon: string;
  colors: any; // Theme colors
}

const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, color, icon, colors }) => (
  <View style={[styles.macroCard, { backgroundColor: colors.backgroundCard, borderColor: color + '25' }]}>
    <View style={[styles.macroIconWrap, { backgroundColor: color + '12' }]}>
      <Text style={styles.macroIcon}>{icon}</Text>
    </View>
    <Text style={[styles.macroValue, { color }]}>
      {value ? Math.round(value) : 0}
      <Text style={styles.macroUnit}>{unit}</Text>
    </Text>
    <Text style={[styles.macroLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  macroCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  macroIcon: {
    fontSize: 20,
  },
  macroValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: 2,
  },
  macroUnit: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MacroCard;
