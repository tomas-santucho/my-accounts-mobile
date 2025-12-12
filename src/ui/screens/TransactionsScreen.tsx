import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, StatusBar, Modal, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../domain/transaction/transaction';
import { Category } from '../../domain/category/category';
import { categoryService } from '../../services/categoryService';
import AddTransactionScreen from './AddTransactionScreen';
import { useTheme } from '../theme';
import FilterModal, { SortOption } from '../lib/FilterModal';
import ConfirmDialog from '../lib/ConfirmDialog';
import InstallmentDeleteDialog from '../lib/InstallmentDeleteDialog';
import * as Sentry from '@sentry/react-native';
import { convertAmount, Currency } from '../../services/currencyService';
import { getCurrencyPreferences } from '../../config/currencyPreferences';

export default function TransactionsScreen() {
    const { theme } = useTheme();
    const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [rateType, setRateType] = useState<'blue' | 'official'>('blue');
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryMap, setCategoryMap] = useState<Map<string, Category>>(new Map());

    // Delete states
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showInstallmentDelete, setShowInstallmentDelete] = useState(false);

    useEffect(() => {
        // Load currency preferences
        getCurrencyPreferences().then(prefs => {
            setRateType(prefs.rateType);
        });
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const cats = await categoryService.listCategories();
            setCategories(cats);
            const map = new Map<string, Category>();
            cats.forEach(c => map.set(c.id, c));
            setCategoryMap(map);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    }, []);

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
        fetchCategories();
    }, [fetchTransactions, fetchCategories]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchTransactions(), fetchCategories()]);
        setRefreshing(false);
    }, [fetchTransactions, fetchCategories]);

    // Apply filters, search, and sorting
    const filteredTransactions = React.useMemo(() => {
        let filtered = [...transactions];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => {
                const categoryName = categoryMap.get(t.category)?.name || t.category;
                return t.description.toLowerCase().includes(query) ||
                    categoryName.toLowerCase().includes(query);
            });
        }

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(t => {
                // Match by ID
                if (selectedCategories.includes(t.category)) return true;

                // Match by Name (Legacy)
                // Find if any selected category has a name that matches t.category
                const transactionCategoryName = t.category.toLowerCase();
                return selectedCategories.some(id => {
                    const cat = categoryMap.get(id);
                    return cat && cat.name.toLowerCase() === transactionCategoryName;
                });
            });
        }

        // Apply month filter
        if (selectedMonth !== null) {
            filtered = filtered.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === selectedMonth;
            });
        }

        // Apply year filter
        if (selectedYear !== null) {
            filtered = filtered.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === selectedYear;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [transactions, searchQuery, selectedMonth, selectedYear, selectedCategories, sortBy, categoryMap]);

    // Convert currency helper
    const calculateConvertedTotal = useCallback(async (transactionsList: Transaction[]) => {
        let total = 0;
        const displayCurrency: Currency = currency === 'USD' ? 'usd' : 'ars';

        for (const t of transactionsList) {
            const converted = await convertAmount(
                t.amount,
                t.currency,
                displayCurrency,
                rateType
            );
            total += converted;
        }
        return total;
    }, [currency, rateType]);

    // Calculate totals from filtered transactions with conversion
    useEffect(() => {
        const updateTotals = async () => {
            const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
            const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

            const incomeTotal = await calculateConvertedTotal(incomeTransactions);
            const expenseTotal = await calculateConvertedTotal(expenseTransactions);

            setTotalIncome(incomeTotal);
            setTotalExpense(expenseTotal);
        };

        updateTotals();
    }, [filteredTransactions, calculateConvertedTotal]);

    const netBalance = totalIncome - totalExpense;

    // Group filtered transactions by date
    const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
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

    // Check if any filters are active
    const hasActiveFilters = selectedMonth !== null || selectedYear !== null || selectedCategories.length > 0 || sortBy !== 'date-desc';

    const handleApplyFilters = (filters: { month: number | null; year: number | null; categories: string[]; sortBy: SortOption }) => {
        setSelectedMonth(filters.month);
        setSelectedYear(filters.year);
        setSelectedCategories(filters.categories);
        setSortBy(filters.sortBy);
    };

    const handleResetFilters = () => {
        setSelectedMonth(null);
        setSelectedYear(null);
        setSelectedCategories([]);
        setSortBy('date-desc');
    };

    const handleDeletePress = (transaction: Transaction) => {
        setTransactionToDelete(transaction);

        // Check if this transaction is part of an installment group
        if (transaction.installmentGroupId) {
            setShowInstallmentDelete(true);
        } else {
            setShowConfirmDelete(true);
        }
    };

    const handleDeleteSingle = async () => {
        if (!transactionToDelete) return;

        try {
            await transactionService.deleteTransaction(transactionToDelete.id);
            setShowConfirmDelete(false);
            setShowInstallmentDelete(false);
            setTransactionToDelete(null);
            await fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            Sentry.captureException(error);
            Alert.alert('Error', 'Failed to delete transaction. Please try again.');
        }
    };

    const handleDeleteAll = async () => {
        if (!transactionToDelete?.installmentGroupId) return;

        try {
            await transactionService.deleteTransactionsByInstallmentGroup(transactionToDelete.installmentGroupId);
            setShowInstallmentDelete(false);
            setTransactionToDelete(null);
            await fetchTransactions();
        } catch (error) {
            console.error('Error deleting installment group:', error);
            Sentry.captureException(error);
            Alert.alert('Error', 'Failed to delete installments. Please try again.');
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDelete(false);
        setShowInstallmentDelete(false);
        setTransactionToDelete(null);
    };

    const handleEditPress = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsAddModalVisible(true);
    };

    const getIconForCategory = (categoryIdOrName: string) => {
        // Check if it's an ID
        const category = categoryMap.get(categoryIdOrName);
        if (category) return category.icon;

        // Fallback for legacy names
        const cat = categoryIdOrName.toLowerCase();
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
                    onClose={() => {
                        setIsAddModalVisible(false);
                        setTransactionToEdit(null);
                    }}
                    onSave={() => {
                        fetchTransactions();
                        setIsAddModalVisible(false);
                        setTransactionToEdit(null);
                    }}
                    transaction={transactionToEdit || undefined}
                />
            </Modal>

            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                selectedCategories={selectedCategories}
                categories={categories}
                sortBy={sortBy}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
            />

            <ConfirmDialog
                visible={showConfirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteSingle}
                onCancel={handleCancelDelete}
                destructive
            />

            <InstallmentDeleteDialog
                visible={showInstallmentDelete}
                onDeleteSingle={handleDeleteSingle}
                onDeleteAll={handleDeleteAll}
                onCancel={handleCancelDelete}
                installmentCount={transactionToDelete?.installments}
            />

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
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setIsFilterModalVisible(true)}
                        >
                            <Ionicons name="options-outline" size={24} color={theme.colors.onPrimary} />
                            {hasActiveFilters && (
                                <View style={[styles.filterBadge, { backgroundColor: theme.colors.secondary }]} />
                            )}
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
                                            <View style={styles.transactionItem}>
                                                <TouchableOpacity
                                                    style={styles.transactionContent}
                                                    onPress={() => handleEditPress(item)}
                                                    onLongPress={() => handleDeletePress(item)}
                                                >
                                                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                                        <Ionicons name={getIconForCategory(item.category) as any} size={24} color={theme.colors.textSecondary} />
                                                    </View>
                                                    <View style={styles.transactionInfo}>
                                                        <Text style={[styles.transactionTitle, { color: theme.colors.textPrimary }]}>{item.description}</Text>
                                                        <Text style={[styles.transactionSubtitle, { color: theme.colors.textSecondary }]}>
                                                            {categoryMap.get(item.category)?.name || item.category} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {item.installments ? ` • ${item.installmentNumber}/${item.installments}` : ''}
                                                        </Text>
                                                    </View>
                                                    <Text style={[
                                                        styles.transactionAmount,
                                                        item.type === 'income' ? { color: theme.colors.success } : { color: theme.colors.error }
                                                    ]}>
                                                        {item.type === 'income' ? '+' : ''}{item.type === 'expense' ? '' : ''}${Math.abs(item.amount).toLocaleString()}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => handleDeletePress(item)}
                                                >
                                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                                </TouchableOpacity>
                                            </View>
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
    filterBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
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
    transactionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
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
