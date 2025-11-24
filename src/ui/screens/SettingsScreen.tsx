import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { getCurrencyPreferences, setDisplayCurrency, setRateType } from '../../config/currencyPreferences';
import { Currency, RateType, clearRateCache } from '../../services/currencyService';
import { useTheme } from '../theme';

export default function SettingsScreen() {
    const { theme, isDark, setThemeMode, themeMode } = useTheme();
    const [displayCurrency, setDisplayCurrencyState] = useState<Currency>('usd');
    const [rateTypePreference, setRateTypeState] = useState<RateType>('blue');

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const prefs = await getCurrencyPreferences();
        setDisplayCurrencyState(prefs.displayCurrency);
        setRateTypeState(prefs.rateType);
    };

    const handleDisplayCurrencyChange = async (currency: Currency) => {
        setDisplayCurrencyState(currency);
        await setDisplayCurrency(currency);
    };

    const handleRateTypeChange = async (rateType: RateType) => {
        setRateTypeState(rateType);
        await setRateType(rateType);
        clearRateCache(); // Force refresh of rates
    };

    const handleThemeChange = () => {
        // Cycle through Light -> Dark -> System
        if (themeMode === 'light') setThemeMode('dark');
        else if (themeMode === 'dark') setThemeMode('system');
        else setThemeMode('light');
    };

    const getThemeLabel = () => {
        if (themeMode === 'system') return 'System Default';
        if (themeMode === 'light') return 'Light Mode';
        return 'Dark Mode';
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.cardBackground} />
            <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
            </View>

            {/* User Profile Section */}
            <View style={styles.section}>
                <View style={[styles.profileContainer, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="person" size={40} color="#FFF" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>Tomas Santucho</Text>
                        <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>voidsynths@proton.me</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="pencil-outline" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Currency Preferences Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Currency Preferences</Text>

                <View style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#1B5E20' : '#E8F5E9' }]}>
                        <Ionicons name="cash-outline" size={22} color="#4CAF50" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Display Currency</Text>
                        <View style={styles.currencyOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.currencyOption,
                                    {
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.border
                                    },
                                    displayCurrency === 'usd' && {
                                        borderColor: theme.colors.primary,
                                        backgroundColor: isDark ? theme.colors.surface : '#FFF0E0' // Adjust active bg
                                    }
                                ]}
                                onPress={() => handleDisplayCurrencyChange('usd')}
                            >
                                <Text style={[
                                    styles.currencyOptionText,
                                    { color: theme.colors.textSecondary },
                                    displayCurrency === 'usd' && { color: theme.colors.primary, fontWeight: '600' }
                                ]}>USD</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.currencyOption,
                                    {
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.border
                                    },
                                    displayCurrency === 'ars' && {
                                        borderColor: theme.colors.primary,
                                        backgroundColor: isDark ? theme.colors.surface : '#FFF0E0'
                                    }
                                ]}
                                onPress={() => handleDisplayCurrencyChange('ars')}
                            >
                                <Text style={[
                                    styles.currencyOptionText,
                                    { color: theme.colors.textSecondary },
                                    displayCurrency === 'ars' && { color: theme.colors.primary, fontWeight: '600' }
                                ]}>ARS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#E65100' : '#FFF3E0' }]}>
                        <Ionicons name="trending-up-outline" size={22} color="#FF9800" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Exchange Rate Type</Text>
                        <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>
                            {rateTypePreference === 'blue' ? 'Blue (Parallel Market)' : 'Official Rate'}
                        </Text>
                        <View style={styles.currencyOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.currencyOption,
                                    {
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.border
                                    },
                                    rateTypePreference === 'blue' && {
                                        borderColor: theme.colors.primary,
                                        backgroundColor: isDark ? theme.colors.surface : '#FFF0E0'
                                    }
                                ]}
                                onPress={() => handleRateTypeChange('blue')}
                            >
                                <Text style={[
                                    styles.currencyOptionText,
                                    { color: theme.colors.textSecondary },
                                    rateTypePreference === 'blue' && { color: theme.colors.primary, fontWeight: '600' }
                                ]}>Blue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.currencyOption,
                                    {
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.border
                                    },
                                    rateTypePreference === 'official' && {
                                        borderColor: theme.colors.primary,
                                        backgroundColor: isDark ? theme.colors.surface : '#FFF0E0'
                                    }
                                ]}
                                onPress={() => handleRateTypeChange('official')}
                            >
                                <Text style={[
                                    styles.currencyOptionText,
                                    { color: theme.colors.textSecondary },
                                    rateTypePreference === 'official' && { color: theme.colors.primary, fontWeight: '600' }
                                ]}>Official</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Data & Sync Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Data & Sync</Text>
                <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]} activeOpacity={0.7}>
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#0D47A1' : '#E3F2FD' }]}>
                        <Ionicons name="cloud-upload-outline" size={22} color="#4A90E2" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Sync with Database</Text>
                        <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>Backup your data to the cloud</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Preferences</Text>
                <TouchableOpacity
                    style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}
                    activeOpacity={0.7}
                    onPress={handleThemeChange}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#1B5E20' : '#E8F5E9' }]}>
                        <Ionicons name={isDark ? "moon" : "sunny"} size={22} color="#4CAF50" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Theme</Text>
                        <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>{getThemeLabel()}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]} activeOpacity={0.7}>
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#E65100' : '#FFF3E0' }]}>
                        <Ionicons name="notifications-outline" size={22} color="#FF9800" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Notifications</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Debug Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Debug</Text>
                <TouchableOpacity
                    style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}
                    activeOpacity={0.7}
                    onPress={() => {
                        Sentry.captureMessage("Manual Test Message from Settings");
                        alert("Sent test message to Sentry");
                    }}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#0D47A1' : '#E3F2FD' }]}>
                        <Ionicons name="paper-plane-outline" size={22} color="#2196F3" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Send Test Message</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}
                    activeOpacity={0.7}
                    onPress={() => {
                        throw new Error("Test Sentry Crash from Settings");
                    }}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#B71C1C' : '#FFEBEE' }]}>
                        <Ionicons name="bug-outline" size={22} color="#D32F2F" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Force Crash</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDark ? '#3E2723' : '#FFF0F0' }]}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
    },
    profileEmail: {
        fontSize: 14,
        marginTop: 2,
    },
    editButton: {
        padding: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubLabel: {
        fontSize: 13,
        marginTop: 2,
    },
    currencyOptions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    currencyOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    currencyOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    logoutButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 16
    }
});
