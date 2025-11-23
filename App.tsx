import React, { useState } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import FinanceSummaryScreen from "./src/ui/screens/FinanceSummaryScreen";
import SettingsScreen from "./src/ui/screens/SettingsScreen";
import TransactionsScreen from "./src/ui/screens/TransactionsScreen";
import BottomNavigation, { Tab } from "./src/ui/lib/BottomNavigation";
import SplashScreen from "./src/ui/screens/SplashScreen";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://0c062097cd716eed51844d06da293f00@o4510410482909184.ingest.de.sentry.io/4510410485661776',

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions for testing

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // Debugging
  debug: __DEV__, // Enable debug mode in development
});

export default Sentry.wrap(function App() {
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </View>
  );
});

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
  },
  placeholderText: {
    fontSize: 20,
    color: '#888',
    fontWeight: '600',
  },
});