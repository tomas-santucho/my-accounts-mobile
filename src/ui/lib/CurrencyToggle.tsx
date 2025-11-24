import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Currency } from '../../services/currencyService';
import { useTheme } from '../theme';

interface CurrencyToggleProps {
    currentCurrency: Currency;
    onToggle: (currency: Currency) => void;
    showLabel?: boolean;
}

export default function CurrencyToggle({
    currentCurrency,
    onToggle,
    showLabel = true
}: CurrencyToggleProps) {
    const { theme } = useTheme();
    const handleToggle = () => {
        const newCurrency: Currency = currentCurrency === 'usd' ? 'ars' : 'usd';
        onToggle(newCurrency);
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={handleToggle}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {showLabel && (
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Display in:</Text>
                )}
                <View style={styles.currencyBadge}>
                    <Text style={[styles.currencyText, { color: theme.colors.textPrimary }]}>
                        {currentCurrency === 'usd' ? 'USD' : 'ARS'}
                    </Text>
                    <Ionicons name="swap-horizontal" size={16} color={theme.colors.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
    currencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
