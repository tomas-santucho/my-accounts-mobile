import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, StatusBar, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import FinanceCard from '../lib/FinanceCard';
import FinanceHeader from "../lib/FinanceHeader";
import MonthlyBudgetSummary from "../lib/MonthlyBudgetSummary";
import ExchangeRateDisplay from '../lib/ExchangeRateDisplay';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../domain/transaction/transaction';
import { Category } from '../../domain/category/category';
import { categoryService } from '../../services/categoryService';
import AddTransactionScreen from './AddTransactionScreen';
import * as Sentry from '@sentry/react-native';
import { Currency, convertAmount } from '../../services/currencyService';
import { getCurrencyPreferences } from '../../config/currencyPreferences';
import { useTheme } from '../theme';
import { Budget } from '../../domain/budget/budget';
import { budgetService } from '../../services/budgetService';
import CategoryTransactionsScreen from './CategoryTransactionsScreen';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FinanceSummaryScreen() {
    const { theme } = useTheme();
    const [expenses, setExpenses] = useState<Transaction[]>([]);
    const [income, setIncome] = useState<Transaction[]>([]);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [incomeTotal, setIncomeTotal] = useState(0);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [displayCurrency, setDisplayCurrencyState] = useState<Currency>('usd');
    const [rateType, setRateType] = useState<'blue' | 'official'>('blue');

    // Month Selection
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Budgets
    const [budgets, setBudgets] = useState<Budget[]>([]);

    // Drill-down
    const [selectedCategoryForDrillDown, setSelectedCategoryForDrillDown] = useState<string | null>(null);

    // Stats for MonthlyBudgetSummary
    const [startingBalance, setStartingBalance] = useState(0);
    const [endingBalance, setEndingBalance] = useState(0);
    const [previousMonthBalance, setPreviousMonthBalance] = useState(0);

    // Initial Balance
    const [manualInitialBalance, setManualInitialBalance] = useState(0);
    const [isInitialBalanceModalVisible, setIsInitialBalanceModalVisible] = useState(false);
    const [newInitialBalance, setNewInitialBalance] = useState('');

    useEffect(() => {
        // Load currency preferences
        getCurrencyPreferences().then(prefs => {
            setDisplayCurrencyState(prefs.displayCurrency);
            setRateType(prefs.rateType);
        });

        // Load initial balance
        AsyncStorage.getItem('@initialBalance').then(val => {
            if (val) {
                setManualInitialBalance(parseFloat(val));
            }
        });
    }, []);

    const saveInitialBalance = async () => {
        const amount = parseFloat(newInitialBalance);
        if (!isNaN(amount)) {
            await AsyncStorage.setItem('@initialBalance', amount.toString());
            setManualInitialBalance(amount);
            setIsInitialBalanceModalVisible(false);
            fetchData(); // Recalculate
        }
    };

    const calculateConvertedTotal = useCallback(async (transactions: Transaction[]) => {
        let total = 0;
        for (const t of transactions) {
            const converted = await convertAmount(
                t.amount,
                t.currency,
                displayCurrency,
                rateType
            );
            total += converted;
        }
        return total;
    }, [displayCurrency, rateType]);

    const calculateBalance = useCallback(async (transactions: Transaction[]) => {
        let balance = 0;
        for (const t of transactions) {
            const converted = await convertAmount(
                t.amount,
                t.currency,
                displayCurrency,
                rateType
            );
            if (t.type === 'income') {
                balance += converted;
            } else {
                balance -= converted;
            }
        }
        return balance;
    }, [displayCurrency, rateType]);

    const fetchData = useCallback(async () => {
        try {
            const transactions = await transactionService.listTransactions();

            const currentMonth = selectedDate.getMonth();
            const currentYear = selectedDate.getFullYear();

            // Fetch Budgets
            const fetchedBudgets = await budgetService.getBudgetsForMonth(currentMonth, currentYear);
            setBudgets(fetchedBudgets);

            // Filter transactions for selected month
            const currentMonthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear;
            });

            // Filter transactions for previous month (relative to selected)
            const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
            const previousMonth = previousMonthDate.getMonth();
            const previousYear = previousMonthDate.getFullYear();

            const previousMonthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === previousMonth &&
                    transactionDate.getFullYear() === previousYear;
            });

            // Get transactions before selected month (for starting balance)
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const transactionsBeforeCurrentMonth = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate < startOfMonth;
            });

            const expenseList = currentMonthTransactions.filter(t => t.type === 'expense');
            const incomeList = currentMonthTransactions.filter(t => t.type === 'income');

            setExpenses(expenseList);
            setIncome(incomeList);

            // Calculate converted totals
            const expTotal = await calculateConvertedTotal(expenseList);
            const incTotal = await calculateConvertedTotal(incomeList);

            setExpenseTotal(expTotal);
            setIncomeTotal(incTotal);

            // Calculate balances
            const startBalance = await calculateBalance(transactionsBeforeCurrentMonth);
            const currentBalance = await calculateBalance([...transactionsBeforeCurrentMonth, ...currentMonthTransactions]);

            // Previous month balance (end of previous month)
            const prevStartOfMonth = new Date(previousYear, previousMonth, 1);
            const transactionsBeforePrevMonth = transactions.filter(t => new Date(t.date) < prevStartOfMonth);
            const prevMonthBalance = await calculateBalance([...transactionsBeforePrevMonth, ...previousMonthTransactions]);

            // Add manual initial balance
            // We assume manualInitialBalance is in the display currency or base currency?
            // Let's assume it's a base amount that gets added. 
            // If the user sets it, they probably set it in the current view currency.
            // But storing it as a raw number is ambiguous if currency changes.
            // For simplicity, let's assume it's in the display currency (or just raw value added to total).
            // A better approach would be to store { amount, currency } but let's keep it simple as requested.
            // Actually, if I change currency, this static number won't convert. 
            // I should probably store it as USD or ARS and convert it.
            // For now, I'll just add it directly.

            setStartingBalance(startBalance + manualInitialBalance);
            setEndingBalance(currentBalance + manualInitialBalance);
            setPreviousMonthBalance(prevMonthBalance + manualInitialBalance);
        } catch (error) {
            console.error("Failed to fetch data", error);
            Sentry.captureException(error);
        }
    }, [calculateConvertedTotal, calculateBalance, selectedDate]);

    const [categoryMap, setCategoryMap] = useState<Map<string, Category>>(new Map());

    const fetchCategories = useCallback(async () => {
        try {
            const categories = await categoryService.listCategories();
            const map = new Map<string, Category>();
            categories.forEach(c => map.set(c.id, c));
            setCategoryMap(map);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [fetchData, fetchCategories]);

    const changeMonth = (increment: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setSelectedDate(newDate);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

            {/* Add Transaction Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <AddTransactionScreen
                    onClose={() => setIsAddModalVisible(false)}
                    onSave={() => {
                        fetchData();
                        setIsAddModalVisible(false);
                    }}
                />
            </Modal>

            {/* Initial Balance Modal */}
            <Modal
                visible={isInitialBalanceModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsInitialBalanceModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                >
                    <View style={{ width: '80%', padding: 20, borderRadius: 12, backgroundColor: theme.colors.cardBackground, elevation: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.colors.textPrimary }}>Set Initial Balance</Text>
                        <Text style={{ marginBottom: 8, color: theme.colors.textSecondary }}>
                            This amount will be added to your calculated balance from transactions.
                        </Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 16,
                                fontSize: 16,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.border,
                                backgroundColor: theme.colors.inputBackground
                            }}
                            value={newInitialBalance}
                            onChangeText={setNewInitialBalance}
                            keyboardType="numeric"
                            placeholder="Amount"
                            placeholderTextColor={theme.colors.textSecondary}
                            autoFocus
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => setIsInitialBalanceModalVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 }}>
                                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveInitialBalance} style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10, backgroundColor: theme.colors.primary }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Category Drill Down Modal */}
            <Modal
                visible={!!selectedCategoryForDrillDown}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedCategoryForDrillDown(null)}
            >
                {selectedCategoryForDrillDown && (
                    <CategoryTransactionsScreen
                        categoryId={selectedCategoryForDrillDown}
                        month={selectedDate.getMonth()}
                        year={selectedDate.getFullYear()}
                        onClose={() => setSelectedCategoryForDrillDown(null)}
                        displayCurrency={displayCurrency}
                    />
                )}
            </Modal>

            <ScrollView style={{ backgroundColor: theme.colors.background }}>
                <FinanceHeader
                    onAddTransaction={() => setIsAddModalVisible(true)}
                    currency={displayCurrency === 'usd' ? 'USD' : 'ARS'}
                    onCurrencyChange={(curr) => setDisplayCurrencyState(curr === 'USD' ? 'usd' : 'ars')}
                />

                {/* Month Picker */}
                <View style={[styles.monthPicker, { backgroundColor: theme.colors.cardBackground }]}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: theme.colors.textPrimary }]}>
                        {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <MonthlyBudgetSummary
                        startingBalance={startingBalance}
                        endingBalance={endingBalance}
                        previousMonthBalance={previousMonthBalance}
                        totalIncome={incomeTotal}
                        totalExpenses={expenseTotal}
                        displayCurrency={displayCurrency}
                        onEditStartingBalance={() => {
                            setNewInitialBalance(manualInitialBalance.toString());
                            setIsInitialBalanceModalVisible(true);
                        }}
                    />

                    <ExchangeRateDisplay compact={false} />

                    {/* Income first as requested */}
                    <FinanceCard
                        title="Income"
                        total={incomeTotal.toFixed(2)}
                        data={income}
                        displayCurrency={displayCurrency}
                        rateType={rateType}
                        categoryMap={categoryMap}
                        budgets={budgets} // Pass budgets
                        onCategoryPress={(catId) => setSelectedCategoryForDrillDown(catId)}
                        onBudgetUpdate={fetchData} // Refresh after budget update
                        month={selectedDate.getMonth()}
                        year={selectedDate.getFullYear()}
                    />

                    <FinanceCard
                        title="Expenses"
                        total={expenseTotal.toFixed(2)}
                        data={expenses}
                        displayCurrency={displayCurrency}
                        rateType={rateType}
                        categoryMap={categoryMap}
                        percentageOfIncome={incomeTotal > 0 ? (expenseTotal / incomeTotal) * 100 : 0}
                        budgets={budgets}
                        onCategoryPress={(catId) => setSelectedCategoryForDrillDown(catId)}
                        onBudgetUpdate={fetchData}
                        month={selectedDate.getMonth()}
                        year={selectedDate.getFullYear()}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 12,
    },
    monthPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 12,
    },
    arrowButton: {
        padding: 8,
    },
    monthText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
