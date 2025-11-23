import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Tab = 'Dashboard' | 'Transactions' | 'Reports' | 'Settings';

interface BottomNavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const tabs: { name: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { name: 'Dashboard', icon: 'grid-outline', label: 'Dashboard' },
    { name: 'Transactions', icon: 'receipt-outline', label: 'Transactions' },
    { name: 'Reports', icon: 'bar-chart-outline', label: 'Reports' },
    { name: 'Settings', icon: 'settings-outline', label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.name;
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
              color={isActive ? '#FF7F50' : '#A0A0A0'} // Coral orange for active, Gray for inactive
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Increased padding for home indicator
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
  activeLabel: {
    color: '#FF7F50',
  },
});
