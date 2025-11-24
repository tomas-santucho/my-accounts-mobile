import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

export type Tab = 'Dashboard' | 'Transactions' | 'Reports' | 'Settings';

interface BottomNavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const tabs: { name: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { name: 'Dashboard', icon: 'grid-outline', label: 'Dashboard' },
    { name: 'Transactions', icon: 'receipt-outline', label: 'Transactions' },
    { name: 'Reports', icon: 'bar-chart-outline', label: 'Reports' },
    { name: 'Settings', icon: 'settings-outline', label: 'Settings' },
  ];

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.colors.tabBarBackground,
        borderTopColor: theme.colors.border,
        paddingBottom: Math.max(insets.bottom, 20)
      }
    ]}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.name;
        const color = isActive ? theme.colors.tabBarActive : theme.colors.tabBarInactive;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabChange(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? (tab.icon.replace('-outline', '') as any) : tab.icon}
              size={24}
              color={color}
            />
            <Text style={[styles.label, { color }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    // paddingBottom handled by safe area insets
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
