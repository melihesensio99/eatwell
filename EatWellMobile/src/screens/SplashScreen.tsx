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
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Logo animasyonu
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 15,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 10,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

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
      {/* Arka plan efektleri */}
      <Animated.View style={[styles.bgGlow, styles.bgGlow1, { opacity: glowAnim }]} />
      <Animated.View style={[styles.bgGlow, styles.bgGlow2, { opacity: glowAnim }]} />

      {/* Logo ve halo */}
      <Animated.View
        style={[
          styles.logoRing,
          {
            opacity: fadeAnim,
            transform: [{ scale: ringScale }],
          },
        ]}
      >
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
        </Animated.View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <View style={styles.titleRow}>
          <Text style={styles.logoText}>Eat</Text>
          <Text style={styles.logoTextGreen}>Well</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.logoSubtext}>Feel</Text>
          <Text style={styles.logoSubtextGreen}>Well</Text>
        </View>
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
    backgroundColor: '#0A0E17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgGlow: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgGlow1: {
    width: 350,
    height: 350,
    backgroundColor: 'rgba(0, 214, 143, 0.06)',
    top: '15%',
    left: -100,
  },
  bgGlow2: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    bottom: '15%',
    right: -80,
  },
  logoRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(0, 214, 143, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 214, 143, 0.12)',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 214, 143, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 52,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#F0F4F8',
    letterSpacing: -1,
  },
  logoTextGreen: {
    fontSize: 44,
    fontWeight: '900',
    color: '#00D68F',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 214, 143, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  logoSubtext: {
    fontSize: 26,
    fontWeight: '300',
    color: '#64748B',
    letterSpacing: 6,
    marginTop: -4,
  },
  logoSubtextGreen: {
    fontSize: 26,
    fontWeight: '300',
    color: '#00FFB2',
    letterSpacing: 6,
    marginTop: -4,
  },
  tagline: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: 12,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dotActive: {
    backgroundColor: '#00D68F',
    width: 24,
    shadowColor: '#00D68F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});

export default SplashScreen;
