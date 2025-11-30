import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import Logo from './Logo';
import { useTheme } from '../theme';

interface FinanceHeaderProps {
    onAddTransaction?: () => void;
    currency: 'USD' | 'ARS';
    onCurrencyChange: (currency: 'USD' | 'ARS') => void;
}

export default function FinanceHeader({ onAddTransaction, currency, onCurrencyChange }: FinanceHeaderProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={styles.logoContainer}>
                        <Logo width={32} height={32} />
                    </View>
                    <View>
                        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Finances</Text>
                        <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                            Track your expenses and income
                        </Text>
                    </View>
                </View>

                <View style={[styles.toggleContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            currency === 'ARS' && { backgroundColor: theme.colors.onPrimary }
                        ]}
                        onPress={() => onCurrencyChange('ARS')}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                { color: 'rgba(255, 255, 255, 0.5)' },
                                currency === 'ARS' && { color: theme.colors.primary }
                            ]}
                        >
                            ARS
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            currency === 'USD' && { backgroundColor: theme.colors.onPrimary }
                        ]}
                        onPress={() => onCurrencyChange('USD')}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                { color: 'rgba(255, 255, 255, 0.5)' },
                                currency === 'USD' && { color: theme.colors.primary }
                            ]}
                        >
                            USD
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}
                onPress={onAddTransaction}
            >
                <Text style={[styles.addText, { color: theme.colors.onPrimary }]}>+ Add Transaction</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    logoContainer: {
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
        maxWidth: 180,
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    toggleText: {
        fontWeight: '600',
        fontSize: 12,
    },
    addButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addText: {
        fontWeight: '600',
        fontSize: 16,
    }
});
