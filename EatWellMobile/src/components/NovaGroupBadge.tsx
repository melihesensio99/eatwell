import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  group: string | null;
}

const novaConfig: Record<string, {
  colors: [string, string];
  label: string;
  icon: string;
  description: string;
}> = {
  '1': {
    colors: ['#16a34a', '#22c55e'],
    label: 'İşlenmemiş',
    icon: '🌿',
    description: 'Doğal veya minimal işlenmiş gıda. En sağlıklı kategori.',
  },
  '2': {
    colors: ['#65a30d', '#84cc16'],
    label: 'İşlenmiş Malzeme',
    icon: '🧂',
    description: 'Yağlar, şekerler, un gibi pişirmede kullanılan maddeler.',
  },
  '3': {
    colors: ['#ca8a04', '#eab308'],
    label: 'İşlenmiş Gıda',
    icon: '🥫',
    description: 'Konserve, peynir gibi birkaç bileşenle üretilen ürünler.',
  },
  '4': {
    colors: ['#dc2626', '#f97316'],
    label: 'Ultra İşlenmiş',
    icon: '🏭',
    description: 'Çok sayıda katkı maddesi içeren endüstriyel ürünler. Tüketimi sınırlandırın.',
  },
};

const NovaGroupBadge: React.FC<Props> = ({ group }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const cfg = (group && novaConfig[group]) ? novaConfig[group] : { colors: ['#9ca3af', '#d1d5db'] as [string,string], label: 'Bilinmiyor', icon: '❓', description: 'Bu ürünün NOVA işlenmişlik grubu bilinmiyor veya hesaplanamadı.' };
  const groupNum = group ? parseInt(group) : 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={styles.wrapper}>
      {/* Başlık */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textMuted }]}>🏭  NOVA GRUBU</Text>
        <Text style={[styles.tapHint, { color: colors.textMuted }]}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* 4 Segmentli gösterge */}
      <View style={styles.segments}>
        {[1, 2, 3, 4].map((n) => {
          const c = novaConfig[String(n)];
          const isActive = n === groupNum;
          const isPast = n < groupNum;
          return (
            <LinearGradient
              key={n}
              colors={isActive || isPast ? c.colors : ['#e5e7eb', '#d1d5db']}
              style={[styles.segment, isActive && styles.activeSegment]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isActive && (
                <Text style={styles.activeNumber}>{n}</Text>
              )}
            </LinearGradient>
          );
        })}
      </View>

      {/* Aktif grup etiketi */}
      <View style={styles.labelRow}>
        <LinearGradient colors={cfg.colors} style={styles.iconPill}>
          <Text style={styles.icon}>{cfg.icon}</Text>
          <Text style={styles.pillText}>{group || '?'}/4 — {cfg.label}</Text>
        </LinearGradient>
      </View>

      {/* Açıklama */}
      {expanded && (
        <View style={[styles.infoBox, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>{cfg.description}</Text>
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
  segments: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  activeSegment: {
    height: 12,
    marginTop: -2,
  },
  activeNumber: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    position: 'absolute',
    top: -14,
  },
  labelRow: {
    alignItems: 'flex-start',
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  pillText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: '800',
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

export default NovaGroupBadge;
