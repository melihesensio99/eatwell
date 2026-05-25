import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  grade: string | null;
}

const grades = ['a', 'b', 'c', 'd', 'e'];

const gradeConfig: Record<string, { colors: [string, string]; description: string }> = {
  a: { colors: ['#16a34a', '#22c55e'], description: 'Çok iyi besin kalitesi! Düzenli tüketim için oldukça uygun.' },
  b: { colors: ['#65a30d', '#84cc16'], description: 'İyi besin kalitesi. Dengeli beslenme için uygun.' },
  c: { colors: ['#ca8a04', '#eab308'], description: 'Orta düzey. Dengeli beslenme içinde makul miktarda tüketilebilir.' },
  d: { colors: ['#ea580c', '#f97316'], description: 'Düşük besin kalitesi. Tüketimi sınırlı tutmanız önerilir.' },
  e: { colors: ['#dc2626', '#ef4444'], description: 'Çok düşük besin kalitesi. Mümkün olduğunca az tüketilmeli.' },
};

const NutriScoreBadge: React.FC<Props> = ({ grade }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (!grade) return null;
  const letter = grade.toLowerCase();
  const config = gradeConfig[letter] ?? { colors: ['#6b7280', '#9ca3af'] as [string,string], description: '' };

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={styles.wrapper}>
      {/* Başlık */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textMuted }]}>📊  NUTRI-SCORE</Text>
        <Text style={[styles.tapHint, { color: colors.textMuted }]}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Skala çubuğu */}
      <View style={styles.scaleBar}>
        {grades.map((g) => {
          const cfg = gradeConfig[g];
          const isActive = g === letter;
          return (
            <LinearGradient
              key={g}
              colors={cfg.colors}
              style={[
                styles.scaleSegment,
                isActive && styles.activeSegment,
              ]}
            >
              <Text style={[styles.scaleLabel, isActive && styles.activeLetter]}>
                {g.toUpperCase()}
              </Text>
            </LinearGradient>
          );
        })}
      </View>

      {/* Aktif grade açıklaması */}
      {expanded && (
        <View style={[styles.infoBox, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>{config.description}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tapHint: {
    fontSize: 10,
    fontWeight: '600',
  },
  scaleBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    gap: 2,
  },
  scaleSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    opacity: 0.35,
  },
  activeSegment: {
    opacity: 1,
    transform: [{ scaleY: 1.15 }],
  },
  scaleLabel: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  activeLetter: {
    fontSize: FontSize.md,
  },
  infoBox: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default NutriScoreBadge;
