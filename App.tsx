import React, { useState } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FinanceSummaryScreen from "./src/ui/screens/FinanceSummaryScreen";
import SettingsScreen from "./src/ui/screens/SettingsScreen";
import TransactionsScreen from "./src/ui/screens/TransactionsScreen";
import BottomNavigation, { Tab } from "./src/ui/lib/BottomNavigation";
import SplashScreen from "./src/ui/screens/SplashScreen";
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { ThemeProvider, useTheme } from "./src/ui/theme";
import { errorTracking } from "./src/services/errorTracking";
import { AuthProvider } from "./src/context/AuthContext";

const MainLayout = () => {
  const { theme, isDark } = useTheme();
  const [currentTab, setCurrentTab] = useState<Tab>('Dashboard');
  const [isAppReady, setIsAppReady] = useState(false);

  if (!isAppReady) {
    return <SplashScreen onFinish={() => setIsAppReady(true)} />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <FinanceSummaryScreen />;
      case 'Transactions':
        return <TransactionsScreen />;
      case 'Reports':
        return <PlaceholderScreen title="Reports" />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <FinanceSummaryScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </View>
  );
};

const PostHogInitializer = () => {
  const posthog = usePostHog();

  React.useEffect(() => {
    if (posthog) {
      errorTracking.setPostHog(posthog);
    }
  }, [posthog]);

  return null;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PostHogProvider
        apiKey="phc_sbzzyGxQJAz5lWr71T6nvBKv3OFghZSgvER3ltTOk7o"
        options={{
          host: 'https://eu.i.posthog.com',
          enableSessionReplay: true,
          captureAppLifecycleEvents: true,
        }}
        autocapture
      >
        <PostHogInitializer />
        <ThemeProvider>
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        </ThemeProvider>
      </PostHogProvider>
    </SafeAreaProvider>
  );
}

const PlaceholderScreen = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
  },
});