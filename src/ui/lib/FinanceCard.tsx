import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Transaction } from '../../domain/transaction/transaction';
import { Currency, RateType, convertAmount, formatCurrency } from '../../services/currencyService';
import { useTheme } from '../theme';

interface FinanceCardProps {
    title: string;
    total: string;
    data: Transaction[];
    displayCurrency?: Currency;
    rateType?: RateType;
}

const FinanceCard = ({
    title,
    total,
    data,
    displayCurrency = 'usd',
    rateType = 'blue'
}: FinanceCardProps) => {
    const { theme } = useTheme();
    const [convertedAmounts, setConvertedAmounts] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const convertTransactionAmounts = async () => {
            const amounts = new Map<string, number>();

            for (const item of data) {
                const converted = await convertAmount(
                    item.amount,
                    item.currency,
                    displayCurrency,
                    rateType
                );
                amounts.set(item.id, converted);
            }

            setConvertedAmounts(amounts);
        };

        convertTransactionAmounts();
    }, [data, displayCurrency, rateType]);

    const renderItem = ({ item }: { item: Transaction }) => {
        const convertedAmount = convertedAmounts.get(item.id) || item.amount;
        const showOriginal = item.currency !== displayCurrency;

        return (
            <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 20 }}>{item.type === 'income' ? '💰' : '💸'}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.category, { color: theme.colors.textPrimary }]}>{item.description}</Text>
                    <View style={styles.values}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
                        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{item.category}</Text>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Amount</Text>
                        <View style={styles.amountContainer}>
                            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                                {formatCurrency(convertedAmount, displayCurrency)}
                            </Text>
                            {showOriginal && (
                                <Text style={[styles.originalAmount, { color: theme.colors.textSecondary }]}>
                                    ({formatCurrency(item.amount, item.currency)})
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.total, { color: theme.colors.textSecondary }]}>
                    Total: {displayCurrency === 'usd' ? '$' : 'ARS '}{total}
                </Text>
            </View>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
    },
    total: {
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    category: {
        fontWeight: '600',
    },
    values: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    label: {
        fontSize: 12,
    },
    value: {
        fontWeight: '600',
        fontSize: 13,
        width: 55,
        textAlign: 'right',
    },
    amountContainer: {
        width: 55,
        alignItems: 'flex-end',
    },
    originalAmount: {
        fontSize: 10,
        marginTop: 2,
    },
});

export default FinanceCard;
