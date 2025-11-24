import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, StatusBar, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../domain/transaction/transaction';
import AddTransactionScreen from './AddTransactionScreen';
import * as Sentry from '@sentry/react-native';
import { useTheme } from '../theme';

export default function TransactionsScreen() {
    const { theme } = useTheme();
    const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransactions = useCallback(async () => {
        try {
            const data = await transactionService.listTransactions();
            // Sort by date descending
            const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(sortedData);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            Sentry.captureException(error);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    }, [fetchTransactions]);

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income' && t.currency.toUpperCase() === currency)
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense' && t.currency.toUpperCase() === currency)
        .reduce((acc, t) => acc + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Group transactions by date
    const groupedTransactions = transactions.reduce((acc, transaction) => {
        // Simple date formatting for grouping
        const date = new Date(transaction.date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {} as Record<string, Transaction[]>);

    const sections = Object.keys(groupedTransactions).map(date => ({
        title: date,
        data: groupedTransactions[date] || []
    }));

    const getIconForCategory = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('food') || cat.includes('grocery')) return 'nutrition-outline';
        if (cat.includes('coffee')) return 'cafe-outline';
        if (cat.includes('transport') || cat.includes('gas') || cat.includes('uber')) return 'car-outline';
        if (cat.includes('home') || cat.includes('rent')) return 'home-outline';
        if (cat.includes('bill') || cat.includes('utility')) return 'flash-outline';
        if (cat.includes('shopping')) return 'bag-handle-outline';
        if (cat.includes('salary') || cat.includes('income')) return 'cash-outline';
        return 'receipt-outline'; // default
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <AddTransactionScreen
                    onClose={() => setIsAddModalVisible(false)}
                    onSave={() => {
                        fetchTransactions();
                        setIsAddModalVisible(false);
                    }}
                />
            </Modal>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                {/* Header Section */}
                <View style={[styles.headerContainer, { backgroundColor: theme.colors.primaryDark }]}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Transactions</Text>
                            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.7)' }]}>View and manage all your transactions</Text>
                        </View>
                        <View style={styles.currencyToggle}>
                            <TouchableOpacity
                                style={[styles.currencyOption, currency === 'USD' && styles.currencyActive]}
                                onPress={() => setCurrency('USD')}
                            >
                                <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextActive]}>USD</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.currencyOption, currency === 'ARS' && styles.currencyActive]}
                                onPress={() => setCurrency('ARS')}
                            >
                                <Text style={[styles.currencyText, currency === 'ARS' && styles.currencyTextActive]}>ARS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputContainer}>
                            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.colors.onPrimary }]}
                                placeholder="Search transactions..."
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <Ionicons name="options-outline" size={24} color={theme.colors.onPrimary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}
                        activeOpacity={0.8}
                        onPress={() => setIsAddModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color={theme.colors.onPrimary} />
                        <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }]}>Add Transaction</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bodyContainer}>
                    {/* Summary Cards */}
                    <View style={[styles.summaryContainer, { backgroundColor: theme.colors.cardBackground }]}>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Income</Text>
                            <Text style={[styles.summaryValueIncome, { color: theme.colors.success }]}>+${totalIncome.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Expenses</Text>
                            <Text style={[styles.summaryValueExpense, { color: theme.colors.error }]}>-${totalExpense.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Net Balance</Text>
                            <Text style={[styles.summaryValueBalance, { color: theme.colors.textPrimary }]}>${netBalance.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Transactions List */}
                    <View style={styles.listContainer}>
                        {sections.map((section) => (
                            <View key={section.title} style={styles.section}>
                                <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{section.title}</Text>
                                <View style={[styles.cardList, { backgroundColor: theme.colors.cardBackground }]}>
                                    {section.data.map((item, index) => (
                                        <View key={item.id}>
                                            <TouchableOpacity style={styles.transactionItem}>
                                                <View style={[styles.iconContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                                    <Ionicons name={getIconForCategory(item.category) as any} size={24} color={theme.colors.textSecondary} />
                                                </View>
                                                <View style={styles.transactionInfo}>
                                                    <Text style={[styles.transactionTitle, { color: theme.colors.textPrimary }]}>{item.description}</Text>
                                                    <Text style={[styles.transactionSubtitle, { color: theme.colors.textSecondary }]}>
                                                        {item.category} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {item.installments ? ` • ${item.installments} inst.` : ''}
                                                    </Text>
                                                </View>
                                                <Text style={[
                                                    styles.transactionAmount,
                                                    item.type === 'income' ? { color: theme.colors.success } : { color: theme.colors.error }
                                                ]}>
                                                    {item.type === 'income' ? '+' : ''}{item.type === 'expense' ? '' : ''}${Math.abs(item.amount).toLocaleString()}
                                                </Text>
                                            </TouchableOpacity>
                                            {index < section.data.length - 1 && <View style={[styles.itemSeparator, { backgroundColor: theme.colors.border }]} />}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                        {sections.length === 0 && (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Text style={{ color: theme.colors.textSecondary }}>No transactions found</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 40, // Increased padding to account for overlap
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    currencyToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 4,
    },
    currencyOption: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    currencyActive: {
        backgroundColor: '#FFF',
    },
    currencyText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
    },
    currencyTextActive: {
        color: '#1E293B',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bodyContainer: {
        paddingHorizontal: 20,
        marginTop: -30, // Overlap with header
    },
    summaryContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryCard: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValueIncome: {
        fontSize: 16,
        fontWeight: '700',
    },
    summaryValueExpense: {
        fontSize: 16,
        fontWeight: '700',
    },
    summaryValueBalance: {
        fontSize: 16,
        fontWeight: '700',
    },
    summaryDivider: {
        width: 1,
        height: 30,
    },
    listContainer: {
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardList: {
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    itemSeparator: {
        height: 1,
        marginLeft: 60, // Indent separator
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    transactionSubtitle: {
        fontSize: 13,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
});
