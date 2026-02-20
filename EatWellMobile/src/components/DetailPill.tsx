import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, FontSize, Spacing } from '../constants/colors';

interface DetailPillProps {
  label: string;
  value: number | undefined;
  color: string;
}

const DetailPill: React.FC<DetailPillProps> = ({ label, value, color }) => (
  <View style={[styles.detailPill, { backgroundColor: color + '10' }]}>
    <Text style={[styles.detailPillLabel, { color: color }]}>{label}</Text>
    <Text style={[styles.detailPillValue, { color: color }]}>
      {value ? value.toFixed(1) : 0}g
    </Text>
  </View>
);

const styles = StyleSheet.create({
  detailPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
  },
  detailPillLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailPillValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
});

export default DetailPill;
