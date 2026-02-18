import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: any;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();


    const timer = setTimeout(async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem('@onboarding_complete');
        if (onboardingDone === 'true') {
          navigation.replace('Home');
        } else {
          navigation.replace('Onboarding');
        }
      } catch {
        navigation.replace('Home');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logoEmoji}>🥗</Text>
        <Text style={styles.logoText}>EatWell</Text>
        <Text style={styles.logoSubtext}>FeelWell</Text>
      </Animated.View>

      <Animated.View style={{ opacity: subtitleFade }}>
        <Text style={styles.tagline}>Bilinçli beslen, sağlıklı yaşa</Text>
      </Animated.View>

      <View style={styles.bottomDots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#2D7A4F',
    letterSpacing: 2,
    textShadowColor: 'rgba(45, 122, 79, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoSubtext: {
    fontSize: 28,
    fontWeight: '300',
    color: '#4CAF50',
    letterSpacing: 4,
    marginTop: -4,
  },
  tagline: {
    color: 'rgba(168, 184, 200, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  bottomDots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    backgroundColor: '#2D7A4F',
    width: 20,
  },
});

export default SplashScreen;
