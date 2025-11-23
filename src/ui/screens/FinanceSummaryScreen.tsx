import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Modal } from 'react-native';
import FinanceCard from '../lib/FinanceCard';
import FinanceHeader from "../lib/FinanceHeader";
import MonthlyBudgetSummary from "../lib/MonthlyBudgetSummary";
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../domain/transaction/transaction';
import AddTransactionScreen from './AddTransactionScreen';
import * as Sentry from '@sentry/react-native';

export default function FinanceSummaryScreen() {
    const [expenses, setExpenses] = useState<Transaction[]>([]);
    const [income, setIncome] = useState<Transaction[]>([]);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [incomeTotal, setIncomeTotal] = useState(0);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    const fetchTransactions = useCallback(async () => {
        try {
            const transactions = await transactionService.listTransactions();
            const expenses = transactions.filter(t => t.type === 'expense');
            const income = transactions.filter(t => t.type === 'income');

            setExpenses(expenses);
            setIncome(income);

            setExpenseTotal(expenses.reduce((acc, t) => acc + t.amount, 0));
            setIncomeTotal(income.reduce((acc, t) => acc + t.amount, 0));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            Sentry.captureException(error);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <View style={{ flex: 1 }}>
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

            <ScrollView>
                <FinanceHeader onAddTransaction={() => setIsAddModalVisible(true)} />
                <View style={styles.container}>
                    <MonthlyBudgetSummary />
                    <FinanceCard title="Expenses" total={expenseTotal.toFixed(2)} data={expenses} />
                    <FinanceCard title="Income" total={incomeTotal.toFixed(2)} data={income} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F7F8FC',
        flex: 1,
    },
});
