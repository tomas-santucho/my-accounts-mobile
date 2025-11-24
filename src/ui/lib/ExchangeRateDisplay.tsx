import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getExchangeRates, clearRateCache, ExchangeRates } from '../../services/currencyService';
import { useTheme } from '../theme';

interface ExchangeRateDisplayProps {
    compact?: boolean;
}

export default function ExchangeRateDisplay({ compact = false }: ExchangeRateDisplayProps) {
    const { theme } = useTheme();
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        if (forceRefresh) {
            clearRateCache();
        }

        try {
            const fetchedRates = await getExchangeRates({ useCache: !forceRefresh });
            setRates(fetchedRates);
        } catch (err) {
            setError('Unable to fetch rates');
            console.error('Exchange rate fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    if (loading && !rates) {
        return (
            <View style={[styles.container, compact && styles.containerCompact, { backgroundColor: theme.colors.cardBackground }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    if (error && !rates) {
        return (
            <View style={[styles.container, compact && styles.containerCompact, { backgroundColor: theme.colors.cardBackground }]}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
        );
    }

    if (!rates) return null;

    if (compact) {
        return (
            <View style={styles.containerCompact}>
                <View style={styles.compactRow}>
                    <Ionicons name="cash-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.compactText, { color: theme.colors.textSecondary }]}>
                        Blue: ${rates.blue.value_avg.toFixed(2)}
                    </Text>
                </View>
            </View>
        );
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Exchange Rates</Text>
                <TouchableOpacity
                    onPress={() => fetchRates(true)}
                    disabled={loading}
                    style={styles.refreshButton}
                >
                    <Ionicons
                        name="refresh"
                        size={18}
                        color={loading ? theme.colors.textSecondary : theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.ratesContainer}>
                <View style={[styles.rateCard, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
                    <View style={styles.rateHeader}>
                        <Ionicons name="trending-up" size={20} color={theme.colors.info} />
                        <Text style={[styles.rateType, { color: theme.colors.textSecondary }]}>Blue (Parallel)</Text>
                    </View>
                    <Text style={[styles.rateValue, { color: theme.colors.textPrimary }]}>
                        ${rates.blue.value_avg.toFixed(2)}
                    </Text>
                    <View style={styles.rateDetails}>
                        <Text style={[styles.rateDetailText, { color: theme.colors.textSecondary }]}>
                            Buy: ${rates.blue.value_buy.toFixed(2)}
                        </Text>
                        <Text style={[styles.rateDetailText, { color: theme.colors.textSecondary }]}>
                            Sell: ${rates.blue.value_sell.toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={[styles.rateCard, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
                    <View style={styles.rateHeader}>
                        <Ionicons name="business" size={20} color={theme.colors.success} />
                        <Text style={[styles.rateType, { color: theme.colors.textSecondary }]}>Official</Text>
                    </View>
                    <Text style={[styles.rateValue, { color: theme.colors.textPrimary }]}>
                        ${rates.official.value_avg.toFixed(2)}
                    </Text>
                    <View style={styles.rateDetails}>
                        <Text style={[styles.rateDetailText, { color: theme.colors.textSecondary }]}>
                            Buy: ${rates.official.value_buy.toFixed(2)}
                        </Text>
                        <Text style={[styles.rateDetailText, { color: theme.colors.textSecondary }]}>
                            Sell: ${rates.official.value_sell.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.updateTime, { color: theme.colors.textSecondary }]}>
                Last updated: {formatTime(rates.lastUpdated)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    containerCompact: {
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    refreshButton: {
        padding: 4,
    },
    ratesContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    rateCard: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
    },
    rateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    rateType: {
        fontSize: 12,
        fontWeight: '600',
    },
    rateValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
    },
    rateDetails: {
        gap: 2,
    },
    rateDetailText: {
        fontSize: 11,
    },
    updateTime: {
        fontSize: 11,
        textAlign: 'center',
    },
    compactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    compactText: {
        fontSize: 12,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
