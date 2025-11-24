import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Modal, StatusBar } from 'react-native';
import FinanceCard from '../lib/FinanceCard';
import FinanceHeader from "../lib/FinanceHeader";
import MonthlyBudgetSummary from "../lib/MonthlyBudgetSummary";
import CurrencyToggle from '../lib/CurrencyToggle';
import ExchangeRateDisplay from '../lib/ExchangeRateDisplay';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../domain/transaction/transaction';
import AddTransactionScreen from './AddTransactionScreen';
import * as Sentry from '@sentry/react-native';
import { Currency, convertAmount } from '../../services/currencyService';
import { getCurrencyPreferences, setDisplayCurrency } from '../../config/currencyPreferences';
import { useTheme } from '../theme';

export default function FinanceSummaryScreen() {
    const { theme } = useTheme();
    const [expenses, setExpenses] = useState<Transaction[]>([]);
    const [income, setIncome] = useState<Transaction[]>([]);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [incomeTotal, setIncomeTotal] = useState(0);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [displayCurrency, setDisplayCurrencyState] = useState<Currency>('usd');
    const [rateType, setRateType] = useState<'blue' | 'official'>('blue');

    useEffect(() => {
        // Load currency preferences
        getCurrencyPreferences().then(prefs => {
            setDisplayCurrencyState(prefs.displayCurrency);
            setRateType(prefs.rateType);
        });
    }, []);

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

    const fetchTransactions = useCallback(async () => {
        try {
            const transactions = await transactionService.listTransactions();
            const expenseList = transactions.filter(t => t.type === 'expense');
            const incomeList = transactions.filter(t => t.type === 'income');

            setExpenses(expenseList);
            setIncome(incomeList);

            // Calculate converted totals
            const expTotal = await calculateConvertedTotal(expenseList);
            const incTotal = await calculateConvertedTotal(incomeList);

            setExpenseTotal(expTotal);
            setIncomeTotal(incTotal);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            Sentry.captureException(error);
        }
    }, [calculateConvertedTotal]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleCurrencyToggle = async (newCurrency: Currency) => {
        setDisplayCurrencyState(newCurrency);
        await setDisplayCurrency(newCurrency);
        // Recalculate totals with new currency
        fetchTransactions();
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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

            <ScrollView style={{ backgroundColor: theme.colors.background }}>
                <FinanceHeader onAddTransaction={() => setIsAddModalVisible(true)} />
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.controlsRow}>
                        <CurrencyToggle
                            currentCurrency={displayCurrency}
                            onToggle={handleCurrencyToggle}
                        />
                    </View>

                    <ExchangeRateDisplay compact={false} />

                    <MonthlyBudgetSummary />
                    <FinanceCard
                        title="Expenses"
                        total={expenseTotal.toFixed(2)}
                        data={expenses}
                        displayCurrency={displayCurrency}
                        rateType={rateType}
                    />
                    <FinanceCard
                        title="Income"
                        total={incomeTotal.toFixed(2)}
                        data={income}
                        displayCurrency={displayCurrency}
                        rateType={rateType}
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
});
