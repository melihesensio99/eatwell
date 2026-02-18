import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/colors';

interface Props {
  grade: string | null;
}

const gradeColors: Record<string, string> = {
  a: Colors.nutriScoreA,
  b: Colors.nutriScoreB,
  c: Colors.nutriScoreC,
  d: Colors.nutriScoreD,
  e: Colors.nutriScoreE,
};

const gradeDescriptions: Record<string, string> = {
  a: 'Çok iyi besin kalitesi! Bu ürün beslenme açısından en iyi kategoride yer alıyor.',
  b: 'İyi besin kalitesi. Düzenli tüketim için uygun bir ürün.',
  c: 'Orta düzey besin kalitesi. Dengeli bir beslenme içinde makul miktarda tüketilebilir.',
  d: 'Düşük besin kalitesi. Tüketimi sınırlı tutmanız önerilir.',
  e: 'Çok düşük besin kalitesi. Mümkün olduğunca az tüketilmesi önerilir.',
};

const NutriScoreBadge: React.FC<Props> = ({ grade }) => {
  const [expanded, setExpanded] = useState(false);

  if (!grade) return null;

  const letter = grade.toLowerCase();
  const color = gradeColors[letter] || Colors.textMuted;
  const description = gradeDescriptions[letter] || '';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleExpand} activeOpacity={0.7}>
      <Text style={styles.title}>Nutri-Score</Text>
      
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{letter.toUpperCase()}</Text>
      </View>

      {/* Kompakt Bilgi Kartı */}
      {expanded && (
        <View style={styles.infoCard}>
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
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: FontSize.xxl,
    color: '#FFFFFF',
    fontWeight: '800',
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

export default NutriScoreBadge;
