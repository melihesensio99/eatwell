import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text, StyleSheet } from "react-native";
import { colors } from "./src/theme";
import { AuthScreen } from "./src/screens/AuthScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { TodayScreen } from "./src/features/today/TodayScreen";
import { DailyLogScreen } from "./src/features/daily-log/DailyLogScreen";
import { RecipesScreen } from "./src/features/recipes/RecipesScreen";
import { AnalyticsScreen } from "./src/features/analytics/AnalyticsScreen";
import { ProfileScreen } from "./src/features/profile/ProfileScreen";
import { configureApi } from "./src/api/client";
import { firebaseAuth } from "./src/auth/firebase";
import { logout } from "./src/auth/firebase";

const Tabs = createBottomTabNavigator();

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <NavigationContainer>
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.mustard,
          tabBarInactiveTintColor: colors.cream,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="Ana Sayfa"
          component={TodayScreen}
          options={{ tabBarIcon: () => <Text style={styles.tabIcon}>⌂</Text> }}
        />
        <Tabs.Screen
          name="Günlük"
          component={DailyLogScreen}
          options={{ tabBarIcon: () => <Text style={styles.tabIcon}>▤</Text> }}
        />
        <Tabs.Screen
          name="Tarifler"
          component={RecipesScreen}
          options={{ tabBarIcon: () => <Text style={styles.tabIcon}>♨</Text> }}
        />
        <Tabs.Screen
          name="Analiz"
          component={AnalyticsScreen}
          options={{ tabBarIcon: () => <Text style={styles.tabIcon}>⌁</Text> }}
        />
        <Tabs.Screen
          name="Profil"
          options={{ tabBarIcon: () => <Text style={styles.tabIcon}>◎</Text> }}
        >
          {() => <ProfileScreen onLogout={onLogout} />}
        </Tabs.Screen>
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

configureApi(async () => firebaseAuth?.currentUser?.getIdToken() ?? null);

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const onAuthenticated = (name: string, isNew: boolean) => {
    setUser(name);
    setNeedsOnboarding(isNew);
  };
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!user ? (
        <AuthScreen onAuthenticated={onAuthenticated} />
      ) : needsOnboarding ? (
        <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />
      ) : (
        <MainTabs
          onLogout={async () => {
            await logout();
            setUser(null);
            setNeedsOnboarding(false);
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.espresso,
    borderTopWidth: 0,
  },
  tabLabel: { fontSize: 10, fontWeight: "800" },
  tabIcon: { fontSize: 20, color: colors.cream },
});
