import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import Logo from './Logo';

interface FinanceHeaderProps {
    onAddTransaction?: () => void;
}

export default function FinanceHeader({ onAddTransaction }: FinanceHeaderProps) {
    const [currency, setCurrency] = useState('USD');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={styles.logoContainer}>
                        <Logo width={32} height={32} />
                    </View>
                    <View>
                        <Text style={styles.title}>Finances</Text>
                        <Text style={styles.subtitle}>
                            Track your expenses and income
                        </Text>
                    </View>
                </View>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            currency === 'USD' && styles.activeToggle
                        ]}
                        onPress={() => setCurrency('USD')}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                currency === 'USD' && styles.activeText
                            ]}
                        >
                            USD
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            currency === 'ARS' && styles.activeToggle
                        ]}
                        onPress={() => setCurrency('ARS')}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                currency === 'ARS' && styles.activeText
                            ]}
                        >
                            ARS
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={onAddTransaction}>
                <Text style={styles.addText}>+ Add Transaction</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A2343', // deep navy
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
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    subtitle: {
        color: '#B0B6D1',
        fontSize: 12,
        marginTop: 2,
        maxWidth: 180,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 4,
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    toggleText: {
        color: '#94A3B8',
        fontWeight: '600',
        fontSize: 12,
    },
    activeToggle: {
        backgroundColor: '#fff',
    },
    activeText: {
        color: '#1A2343',
    },
    addButton: {
        backgroundColor: '#FF5B00',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#FF5B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    }
});
