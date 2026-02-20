import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const slides = [
  {
    id: '1',
    emoji: '📷',
    title: 'Barkod Tara',
    description: 'Kamera ile ürünlerin barkodunu okutun ve anında detaylı bilgi alın.',
    color: '#00D68F',
    bgGlow: 'rgba(0, 214, 143, 0.08)',
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Akıllı Analiz',
    description:
      'Nutri-Score, NOVA grubu, besin değerleri ve katkı maddeleri hakkında detaylı analiz alın.',
    color: '#FF8C42',
    bgGlow: 'rgba(255, 140, 66, 0.08)',
  },
  {
    id: '3',
    emoji: '🥗',
    title: 'Bilinçli Beslen',
    description:
      'Kalori takibi, alerjen uyarıları ve günlük özet ile sağlıklı yaşayın.',
    color: '#38BDF8',
    bgGlow: 'rgba(56, 189, 248, 0.08)',
  },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
    } catch {}
    navigation.replace('Home');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={[styles.emojiOuter, { backgroundColor: item.bgGlow, borderColor: item.color + '20' }]}>
        <View style={[styles.emojiInner, { backgroundColor: item.color + '15', borderColor: item.color + '30' }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={[styles.accentLine, { backgroundColor: item.color }]} />
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Arka plan glow */}
      <View style={[styles.bgOrb, { backgroundColor: slides[currentIndex]?.bgGlow || 'transparent' }]} />

      <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 28, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.25, 1, 0.25],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: slides[currentIndex]?.color || '#00D68F',
                  shadowColor: slides[currentIndex]?.color || '#00D68F',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: slides[currentIndex]?.color || '#00D68F',
            shadowColor: slides[currentIndex]?.color || '#00D68F',
          }]}
          onPress={isLastSlide ? handleGetStarted : handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? '🚀 Başlayalım!' : 'Devam →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  bgOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: '10%',
    alignSelf: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skipText: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 44,
  },
  emojiOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 40,
  },
  emojiInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F0F4F8',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(148, 163, 184, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  accentLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: 28,
    opacity: 0.5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  buttonContainer: {
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;
