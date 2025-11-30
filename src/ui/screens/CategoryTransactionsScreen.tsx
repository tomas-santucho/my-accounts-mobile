import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Transaction } from '../../domain/transaction/transaction';
import { Category } from '../../domain/category/category';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { Currency, formatCurrency, convertAmount } from '../../services/currencyService';

interface CategoryTransactionsScreenProps {
    categoryId: string;
    month: number;
    year: number;
    onClose: () => void;
    displayCurrency: Currency;
}

export default function CategoryTransactionsScreen({
    categoryId,
    month,
    year,
    onClose,
    displayCurrency
}: CategoryTransactionsScreenProps) {
    const { theme } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            // Fetch Category
            const categories = await categoryService.listCategories();
            const foundCategory = categories.find(c => c.id === categoryId);
            setCategory(foundCategory || null);

            // Fetch Transactions
            const allTransactions = await transactionService.listTransactions();
            const filtered = allTransactions.filter(t => {
                const d = new Date(t.date);
                return t.category === categoryId &&
                    d.getMonth() === month &&
                    d.getFullYear() === year;
            });

            // Sort by date desc
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(filtered);

            // Calculate Total
            let sum = 0;
            for (const t of filtered) {
                const converted = await convertAmount(t.amount, t.currency, displayCurrency, 'blue');
                sum += converted;
            }
            setTotal(sum);

        } catch (e) {
            console.error("Failed to fetch category transactions", e);
        }
    }, [categoryId, month, year, displayCurrency]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.item, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.itemLeft}>
                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text style={[styles.description, { color: theme.colors.textPrimary }]}>
                    {item.description}
                </Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
                    {formatCurrency(item.amount, item.currency)}
                </Text>
                {item.currency !== displayCurrency && (
                    <Text style={[styles.converted, { color: theme.colors.textSecondary }]}>
                        ≈ {formatCurrency(item.amount * (displayCurrency === 'usd' ? 1 / 1000 : 1000), displayCurrency)} {/* Placeholder conversion visual */}
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                        {category?.name || 'Category'}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                        {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <View style={[styles.summary, { backgroundColor: theme.colors.cardBackground }]}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                    {formatCurrency(total, displayCurrency)}
                </Text>
            </View>

            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        No transactions found for this month.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
    },
    summary: {
        padding: 20,
        alignItems: 'center',
        margin: 16,
        borderRadius: 12,
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        paddingHorizontal: 16,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemLeft: {
        flex: 1,
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    date: {
        fontSize: 12,
        marginBottom: 2,
    },
    description: {
        fontSize: 16,
    },
    amount: {
        fontSize: 16,
        fontWeight: '600',
    },
    converted: {
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    }
});
