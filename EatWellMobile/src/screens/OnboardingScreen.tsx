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
    description: 'Kamera ile ürünlerin barkodunu okutun ve anında bilgi alın.',
    color: '#2D7A4F',
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Sağlığını Analiz Et',
    description:
      'Nutri-Score, NOVA grubu, besin değerleri ve katkı maddeleri hakkında detaylı analiz.',
    color: '#FF9800',
  },
  {
    id: '3',
    emoji: '🥗',
    title: 'Bilinçli Beslen',
    description:
      'Kalori bilgileri ve uzman tavsiyeleri ile daha sağlıklı tercihler yapın.',
    color: '#4CAF50',
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
      <View style={[styles.emojiCircle, { backgroundColor: item.color + '15', borderColor: item.color + '30' }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
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
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
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
                  backgroundColor: slides[currentIndex]?.color || '#2D7A4F',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: slides[currentIndex]?.color || '#2D7A4F' }]}
          onPress={isLastSlide ? handleGetStarted : handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? '🚀 Başla' : 'Devam →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: 'rgba(168, 184, 200, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 17,
    color: 'rgba(168, 184, 200, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
