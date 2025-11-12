import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import FinanceCard from '../lib/FinanceCard';
import FinanceHeader from "../lib/FinanceHeader";
import { MonthlyBudgetSummary } from "../lib/MonthlyBudgetSummary";

console.log("MonthlyBudgetSummary:", MonthlyBudgetSummary);

export default function FinanceSummaryScreen() {
    const expenses = [
        { name: 'Home', icon: '🏠', planned: 1200, actual: 1150 },
        { name: 'Utilities', icon: '⚡', planned: 250, actual: 280 },
        { name: 'Food', icon: '🍽️', planned: 600, actual: 650 },
        { name: 'Delivery', icon: '🚚', planned: 150, actual: 120 },
        { name: 'Shopping', icon: '🛍️', planned: 300, actual: 420 },
    ];

    const income = [
        { name: 'Salary', icon: '💵', planned: 5000, actual: 5000 },
        { name: 'Bonus', icon: '🎁', planned: 500, actual: 750 },
        { name: 'Interest', icon: '📈', planned: 50, actual: 65 },
    ];

    return (
       <ScrollView>
           <FinanceHeader/>
           <ScrollView style={styles.container}>
               <MonthlyBudgetSummary/>
               <FinanceCard title="Expenses" total="2,22620" data={expenses} />
               <FinanceCard title="Income" total="5,2222" data={income} />
           </ScrollView>
       </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F7F8FC',
        flex: 1,
    },
});
