import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Transaction } from '../../domain/transaction/transaction';
import { Category } from '../../domain/category/category';
import { Currency, RateType, convertAmount, formatCurrency } from '../../services/currencyService';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../../domain/budget/budget';
import { budgetService } from '../../services/budgetService';

interface FinanceCardProps {
    title: string;
    total: string;
    data: Transaction[];
    displayCurrency?: Currency;
    rateType?: RateType;
    categoryMap?: Map<string, Category>;
    percentageOfIncome?: number;
    budgets?: Budget[];
    onCategoryPress?: (categoryId: string) => void;
    onBudgetUpdate?: () => void;
    month?: number;
    year?: number;
}

const FinanceCard = ({
    title,
    total,
    data,
    displayCurrency = 'usd',
    rateType = 'blue',
    categoryMap,
    percentageOfIncome,
    budgets,
    onCategoryPress,
    onBudgetUpdate,
    month,
    year
}: FinanceCardProps) => {
    const { theme } = useTheme();
    const [categoryTotals, setCategoryTotals] = useState<{ categoryId: string; total: number }[]>([]);
    const [editingBudget, setEditingBudget] = useState<{ categoryId: string; currentAmount: number } | null>(null);
    const [newBudgetAmount, setNewBudgetAmount] = useState('');

    useEffect(() => {
        const calculateCategoryTotals = async () => {
            const totals = new Map<string, number>();

            // Initialize with all categories from map if available, to show 0s
            if (categoryMap) {
                categoryMap.forEach((_, id) => totals.set(id, 0));
            }

            for (const item of data) {
                const converted = await convertAmount(
                    item.amount,
                    item.currency,
                    displayCurrency,
                    rateType
                );
                const currentTotal = totals.get(item.category) || 0;
                totals.set(item.category, currentTotal + converted);
            }

            // Convert map to array and sort by amount descending (or keep category order?)
            // For now, sort by actual amount descending
            const totalsArray = Array.from(totals.entries())
                .map(([categoryId, total]) => ({ categoryId, total }))
                .sort((a, b) => b.total - a.total);

            // Filter out categories with 0 total AND 0 budget if we want to hide unused
            // But user might want to set budget for unused category. 
            // Let's keep all for now or maybe filter if list is too long.
            // For now, let's filter out 0s if no budget exists.

            const filtered = totalsArray.filter(item => {
                const budget = budgets?.find(b => b.categoryId === item.categoryId);
                return item.total > 0 || (budget && budget.amount > 0);
            });

            setCategoryTotals(filtered);
        };

        calculateCategoryTotals();
    }, [data, displayCurrency, rateType, categoryMap, budgets]);

    const handleSaveBudget = async () => {
        if (editingBudget && month !== undefined && year !== undefined && onBudgetUpdate) {
            const amount = parseFloat(newBudgetAmount);
            if (!isNaN(amount)) {
                await budgetService.setBudget(
                    editingBudget.categoryId,
                    month,
                    year,
                    amount,
                    displayCurrency
                );
                onBudgetUpdate();
            }
            setEditingBudget(null);
            setNewBudgetAmount('');
        }
    };

    const renderItem = ({ item }: { item: { categoryId: string; total: number } }) => {
        const category = categoryMap?.get(item.categoryId);
        const categoryName = category?.name || item.categoryId;
        const categoryIcon = category?.icon || 'help-circle';

        const budget = budgets?.find(b => b.categoryId === item.categoryId);
        const plannedAmount = budget ? budget.amount : 0;
        const diff = plannedAmount - item.total;

        // We need numeric total of this card.
        const cardTotalNum = categoryTotals.reduce((sum, c) => sum + c.total, 0);
        const percentOfSalary = cardTotalNum > 0 ? (item.total / cardTotalNum) * percentageOfIncome! : 0;

        return (
            <TouchableOpacity
                style={[styles.row, { borderBottomColor: theme.colors.border }]}
                onPress={() => onCategoryPress?.(item.categoryId)}
            >
                <View style={styles.colCategory}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Ionicons name={categoryIcon as any} size={16} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {categoryName}
                    </Text>
                </View>

                {/* Planned */}
                <TouchableOpacity
                    style={styles.colValue}
                    onPress={() => {
                        setEditingBudget({ categoryId: item.categoryId, currentAmount: plannedAmount });
                        setNewBudgetAmount(plannedAmount.toString());
                    }}
                >
                    <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                        {plannedAmount > 0 ? formatCurrency(plannedAmount, displayCurrency) : '-'}
                    </Text>
                </TouchableOpacity>

                {/* Actual */}
                <View style={styles.colValue}>
                    <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>
                        {formatCurrency(item.total, displayCurrency)}
                    </Text>
                </View>

                {/* Diff */}
                <View style={styles.colValue}>
                    <Text style={[styles.valueText, {
                        color: diff > 0 ? theme.colors.success : (diff < 0 ? theme.colors.error : theme.colors.textSecondary)
                    }]}>
                        {diff !== 0 ? (diff > 0 ? '+' : '') + formatCurrency(diff, displayCurrency) : '-'}
                    </Text>
                </View>

                {/* % Of Salary */}
                <View style={styles.colValue}>
                    <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                        {percentOfSalary > 0 ? percentOfSalary.toFixed(2) + '%' : '0%'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
                    {percentageOfIncome !== undefined && (
                        <Text style={[styles.percentage, { color: theme.colors.textSecondary }]}>
                            {percentageOfIncome.toFixed(1)}% of income
                        </Text>
                    )}
                </View>
                <Text style={[styles.total, { color: theme.colors.textSecondary }]}>
                    Total: {displayCurrency === 'usd' ? '$' : 'ARS '}{total}
                </Text>
            </View>

            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.colHeader, styles.colCategory, { color: theme.colors.textSecondary }]}>Category</Text>
                <Text style={[styles.colHeader, styles.colValue, { color: theme.colors.textSecondary }]}>Planned</Text>
                <Text style={[styles.colHeader, styles.colValue, { color: theme.colors.textSecondary }]}>Actual</Text>
                <Text style={[styles.colHeader, styles.colValue, { color: theme.colors.textSecondary }]}>Diff.</Text>
                <Text style={[styles.colHeader, styles.colValue, { color: theme.colors.textSecondary }]}>%</Text>
            </View>

            <FlatList
                data={categoryTotals}
                renderItem={renderItem}
                keyExtractor={(item) => item.categoryId}
                scrollEnabled={false}
            />

            {/* Edit Budget Modal */}
            <Modal
                visible={!!editingBudget}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditingBudget(null)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Set Budget</Text>
                        <TextInput
                            style={[styles.input, {
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.border,
                                backgroundColor: theme.colors.inputBackground
                            }]}
                            value={newBudgetAmount}
                            onChangeText={setNewBudgetAmount}
                            keyboardType="numeric"
                            placeholder="Amount"
                            placeholderTextColor={theme.colors.textSecondary}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setEditingBudget(null)} style={styles.modalButton}>
                                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveBudget} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    percentage: {
        fontSize: 12,
        marginTop: 2,
    },
    total: {
        fontWeight: '600',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        marginBottom: 4,
    },
    colHeader: {
        fontSize: 11,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    colCategory: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    colValue: {
        flex: 1.2,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    valueText: {
        fontSize: 11,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
    },
});

export default FinanceCard;
