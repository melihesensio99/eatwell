import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  AnalysisScreen,
  CalorieScreen,
  BarcodeScannerScreen,
  SplashScreen,
  OnboardingScreen,
  DailySummaryScreen,

  CalorieGoalScreen,
  AllergenSettingsScreen,
  ChatScreen,
} from './src/screens';
import { ThemeProvider, useTheme } from './src/constants/ThemeContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScannerScreen}
          options={{
            title: 'Barkod Tara',
            headerBackTitle: 'Geri',
            headerTransparent: true,
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{
            title: 'Ürün Analizi',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Calorie"
          component={CalorieScreen}
          options={{
            title: 'Kalori Bilgileri',
            headerBackTitle: 'Analiz',
          }}
        />
        <Stack.Screen
          name="DailySummary"
          component={DailySummaryScreen}
          options={{
            title: 'Günlük Özet',
            headerBackTitle: 'Kalori',
          }}
        />
        <Stack.Screen
          name="CalorieGoal"
          component={CalorieGoalScreen}
          options={{
            title: 'Kalori Hedefi',
            headerBackTitle: 'Geri',
          }}

        />
        <Stack.Screen
          name="AllergenSettings"
          component={AllergenSettingsScreen}
          options={{
            title: 'Alerjen Ayarları',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'AI Beslenme Asistanı',
            headerBackTitle: 'Geri',
          }}
        />
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
