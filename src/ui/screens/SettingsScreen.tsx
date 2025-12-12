import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import CategoryListScreen from './CategoryListScreen';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { getCurrencyPreferences, setDisplayCurrency, setRateType } from '../../config/currencyPreferences';
import { Currency, RateType, clearRateCache } from '../../services/currencyService';
import { useTheme } from '../theme';
import { useAuth } from '../../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import { fetchAuthSession } from 'aws-amplify/auth';
import { syncService } from '../../services/sync/syncService';

export default function SettingsScreen() {
    const { theme, isDark, setThemeMode, themeMode } = useTheme();
    const { user, signIn, signOut, signUp, signInWithGoogle } = useAuth();
    const [displayCurrency, setDisplayCurrencyState] = useState<Currency>('usd');
    const [rateTypePreference, setRateTypeState] = useState<RateType>('blue');
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

    // Auth Modal State
    const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    // Close auth modal when user successfully logs in
    useEffect(() => {
        if (user && isAuthModalVisible) {
            setIsAuthModalVisible(false);
            // Clear form fields
            setEmail('');
            setPassword('');
            setName('');
        }
    }, [user]);

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

    const handleAuthAction = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (authMode === 'register' && !name) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setIsSubmitting(true);
        try {
            if (authMode === 'login') {
                await signIn({ username: email, password });
                setIsAuthModalVisible(false);
            } else {
                await signUp({
                    username: email,
                    password,
                    options: { userAttributes: { email, name } }
                });
                Alert.alert('Success', 'Account created! Please check your email for verification code.', [
                    { text: 'OK', onPress: () => setAuthMode('login') }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Authentication failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSync = async () => {
        if (!user) {
            Alert.alert('Login Required', 'You must be logged in to sync your data.', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Login', onPress: () => {
                        setAuthMode('login');
                        setIsAuthModalVisible(true);
                    }
                }
            ]);
            return;
        }

        try {
            const userId = user.attributes?.sub || user.username;
            if (!userId) {
                Alert.alert('Error', 'Could not determine user ID.');
                return;
            }

            Alert.alert('Syncing', 'Syncing data with cloud...');
            await syncService.sync(userId);
            Alert.alert('Success', 'Data synced successfully!');
        } catch (error: any) {
            console.error("Sync error:", error);
            Alert.alert('Sync Failed', error.message || 'An error occurred during sync.');
        }
    };

    const handleExport = async () => {
        if (!user) {
            Alert.alert('Login Required', 'You must be logged in to export your data.');
            return;
        }

        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.accessToken?.toString();
            if (!token) {
                Alert.alert('Error', 'Could not retrieve authentication token.');
                return;
            }

            const apiUrl = Constants.expoConfig?.extra?.['API_URL'];
            if (!apiUrl) {
                Alert.alert('Error', 'API URL not configured.');
                return;
            }

            const exportUrl = `${apiUrl}/api/transactions/export`;

            if (Platform.OS === 'web') {
                const response = await fetch(exportUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Export failed');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'transactions.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                // @ts-ignore
                const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + 'transactions.csv';
                if (!fileUri) {
                    throw new Error('No directory available for download');
                }
                // @ts-ignore
                const downloadRes = await FileSystem.downloadAsync(exportUrl, fileUri, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (downloadRes.status !== 200) {
                    throw new Error('Download failed');
                }

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri);
                } else {
                    Alert.alert('Error', 'Sharing is not available on this device');
                }
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to export transactions: ' + error.message);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.cardBackground} />
            <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
            </View>

            {/* User Profile Section */}
            <View style={styles.section}>
                {user ? (
                    <View style={[styles.profileContainer, { backgroundColor: theme.colors.cardBackground }]}>
                        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="person" size={40} color="#FFF" />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>
                                {user.attributes?.name || user.attributes?.email?.split('@')[0] || user.username || 'User'}
                            </Text>
                            <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                                {user.attributes?.email || user.signInDetails?.loginId || 'Logged In'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="pencil-outline" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.profileContainer, { backgroundColor: theme.colors.cardBackground, flexDirection: 'column', alignItems: 'stretch' }]}>
                        <Text style={[styles.profileName, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 16 }]}>
                            Sign in to sync your data
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.authButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
                                onPress={() => {
                                    setAuthMode('login');
                                    setIsAuthModalVisible(true);
                                }}
                            >
                                <Text style={styles.authButtonText}>Log In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.authButton, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary, flex: 1 }]}
                                onPress={() => {
                                    setAuthMode('register');
                                    setIsAuthModalVisible(true);
                                }}
                            >
                                <Text style={[styles.authButtonText, { color: theme.colors.primary }]}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Data & Sync</Text>
                {Platform.OS !== 'web' && (
                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}
                        activeOpacity={0.7}
                        onPress={handleSync}
                    >
                        <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#0D47A1' : '#E3F2FD' }]}>
                            <Ionicons name="cloud-upload-outline" size={22} color="#4A90E2" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Sync with Database</Text>
                            <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>
                                {user ? 'Backup your data to the cloud' : 'Login required'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}
                    activeOpacity={0.7}
                    onPress={handleExport}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#1B5E20' : '#E8F5E9' }]}>
                        <Ionicons name="download-outline" size={22} color="#4CAF50" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Export Transactions</Text>
                        <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>
                            Download as CSV
                        </Text>
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
                    onPress={() => setIsCategoryModalVisible(true)}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: isDark ? '#004D40' : '#E0F2F1' }]}>
                        <Ionicons name="pricetags-outline" size={22} color="#009688" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Categories</Text>
                        <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>Manage transaction categories</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

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

            {user && (
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: isDark ? '#3E2723' : '#FFF0F0' }]}
                        onPress={signOut}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={isCategoryModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsCategoryModalVisible(false)}
            >
                <CategoryListScreen onClose={() => setIsCategoryModalVisible(false)} />
            </Modal>

            {/* Auth Modal */}
            <Modal
                visible={isAuthModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAuthModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.authModalContent, { backgroundColor: theme.colors.cardBackground }]}>
                        <View style={styles.authHeader}>
                            <Text style={[styles.authTitle, { color: theme.colors.textPrimary }]}>
                                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsAuthModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            {authMode === 'register' && (
                                <>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: theme.colors.background,
                                            color: theme.colors.textPrimary,
                                            borderColor: theme.colors.border
                                        }]}
                                        placeholder="Enter your name"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </>
                            )}

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.background,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.border
                                }]}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.background,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.border
                                }]}
                                placeholder="Enter your password"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleAuthAction}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {authMode === 'login' ? 'Log In' : 'Sign Up'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {authMode === 'login' && (
                                <TouchableOpacity
                                    style={[styles.googleButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                                    onPress={async () => {
                                        try {
                                            await signInWithGoogle();
                                        } catch (error: any) {
                                            Alert.alert('Error', error.message || 'Google Sign-In failed');
                                        }
                                    }}
                                >
                                    <Ionicons name="logo-google" size={20} color={theme.colors.textPrimary} style={{ marginRight: 8 }} />
                                    <Text style={[styles.googleButtonText, { color: theme.colors.textPrimary }]}>Sign in with Google</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.switchAuthButton}
                                onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                            >
                                <Text style={[styles.switchAuthText, { color: theme.colors.primary }]}>
                                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    authButton: {
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    authModalContent: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    authHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    authTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    formContainer: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    submitButton: {
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    switchAuthButton: {
        alignItems: 'center',
        padding: 8,
    },
    switchAuthText: {
        fontSize: 14,
        fontWeight: '500',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
