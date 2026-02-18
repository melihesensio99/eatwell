import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';

interface Props {
  group: string | null;
}

const groupInfo: Record<string, { color: string; label: string }> = {
  '1': { color: Colors.novaGroup1, label: 'İşlenmemiş' },
  '2': { color: Colors.novaGroup2, label: 'İşlenmiş malzeme' },
  '3': { color: Colors.novaGroup3, label: 'İşlenmiş gıda' },
  '4': { color: Colors.novaGroup4, label: 'Ultra işlenmiş' },
};

const groupDescriptions: Record<string, string> = {
  '1': 'İşlenmemiş veya minimal işlenmiş gıdalar. Doğal haliyle tüketilen, sağlıklı besinlerdir.',
  '2': 'İşlenmiş mutfak malzemeleri. Yağlar, şekerler, un gibi yemek hazırlamak için kullanılan ürünler.',
  '3': 'İşlenmiş gıdalar. Konserve sebzeler, peynirler gibi birkaç bileşenle hazırlanan ürünler.',
  '4': 'Ultra işlenmiş gıdalar. Çok sayıda katkı maddesi içeren, endüstriyel olarak üretilmiş ürünler. Tüketimi sınırlı tutulmalıdır.',
};

const NovaGroupBadge: React.FC<Props> = ({ group }) => {
  const [expanded, setExpanded] = useState(false);

  if (!group) return null;

  const info = groupInfo[group] || { color: Colors.textMuted, label: 'Bilinmiyor' };
  const description = groupDescriptions[group] || '';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleExpand} activeOpacity={0.7}>
      <Text style={styles.title}>NOVA Grubu</Text>
      <View style={[styles.badge, { borderColor: info.color }]}>
        <View style={[styles.numberCircle, { backgroundColor: info.color }]}>
          <Text style={styles.number}>{group}</Text>
        </View>
        <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
      </View>

      {/* Kompakt Bilgi Kartı */}
      {expanded && (
        <View style={[styles.infoCard, { borderColor: info.color + '40' }]}>
          <Text style={styles.infoText}>{description}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  title: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    paddingRight: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.xs,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: Colors.backgroundCard,
    marginBottom: 4,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  tapHint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    marginTop: 8,
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default NovaGroupBadge;
