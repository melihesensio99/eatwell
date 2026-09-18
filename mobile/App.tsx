import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { TodayScreen } from './src/features/today/screens/TodayScreen';
import { ScanScreen } from './src/features/scan/screens/ScanScreen';
import { RecipesScreen } from './src/features/recipes/screens/RecipesScreen';
import { InsightsScreen } from './src/features/insights/screens/InsightsScreen';
import { ProfileScreen } from './src/features/profile/screens/ProfileScreen';
import { FavoritesScreen } from './src/features/foods/screens/FavoritesScreen';
import { HistoryScreen } from './src/features/daily-log/screens/HistoryScreen';
import { SavedRecipesScreen } from './src/features/recipes/screens/SavedRecipesScreen';
import { AuthScreen } from './src/features/auth/screens/AuthScreen';
import { colors, typography } from './src/theme';
import { useAuthStore } from './src/store/authStore';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.coral, tabBarInactiveTintColor: colors.textMuted, tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel }}>
    <Tabs.Screen name="Bugün" component={TodayScreen} />
    <Tabs.Screen name="Tara" component={ScanScreen} />
    <Tabs.Screen name="Tarifler" component={RecipesScreen} />
    <Tabs.Screen name="İçgörüler" component={InsightsScreen} />
    <Tabs.Screen name="Profil" component={ProfileScreen} />
    <Tabs.Screen name="Favoriler" component={FavoritesScreen} />
    <Tabs.Screen name="Geçmiş" component={HistoryScreen} />
    <Tabs.Screen name="Tariflerim" component={SavedRecipesScreen} />
  </Tabs.Navigator>;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);
  React.useEffect(() => { void hydrate(); }, [hydrate]);
  return <QueryClientProvider client={queryClient}><StatusBar style="dark" />{!isHydrated ? null : token ? <NavigationContainer><MainTabs /></NavigationContainer> : <AuthScreen />}</QueryClientProvider>;
}

const styles = StyleSheet.create({
  tabBar: { height: 72, paddingBottom: 12, paddingTop: 8, backgroundColor: colors.surface, borderTopColor: colors.border },
  tabLabel: { ...typography.label },
});
