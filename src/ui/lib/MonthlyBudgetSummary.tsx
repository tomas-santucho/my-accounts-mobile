import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const MonthlyBudgetSummary = () => {
    const { theme } = useTheme();
    // mock data
    const startingBalance = 99;
    const endingBalance = 99;
    const savingsIncrease = 99;
    const savedThisMonth = 99;
    const incomeExpended = 99;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Top balance cards */}
            <View style={styles.balanceRow}>
                <View style={[styles.balanceCard, { backgroundColor: theme.colors.cardBackground }]}>
                    <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>Starting Balance</Text>
                    <Text style={[styles.balanceAmount, { color: theme.colors.textPrimary }]}>${startingBalance.toLocaleString()}</Text>
                    <LinearGradient
                        colors={['#FF7A00', '#FF5B00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBar}
                    />
                    <Text style={[styles.percent, { color: theme.colors.textSecondary }]}>100%</Text>
                </View>

                <View style={[styles.balanceCard, { backgroundColor: theme.colors.cardBackground }]}>
                    <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>Ending Balance</Text>
                    <Text style={[styles.balanceAmount, { color: theme.colors.textPrimary }]}>${endingBalance.toLocaleString()}</Text>
                    <LinearGradient
                        colors={['#FF7A00', '#FF5B00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradientBar, { width: '81%' }]}
                    />
                    <Text style={[styles.percent, { color: theme.colors.textSecondary }]}>99%</Text>
                </View>
            </View>

            {/* Summary card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardBackground }]}>
                <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>Summary</Text>

                <View style={styles.summaryRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.inputBackground }]}>
                        <Ionicons name="trending-up-outline" size={22} color={theme.colors.textPrimary} />
                    </View>
                    <View style={styles.summaryText}>
                        <Text style={[styles.summaryLabel, { color: theme.colors.textPrimary }]}>Savings Increase</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>+{savingsIncrease}%</Text>
                        <Text style={styles.subText}>vs last month</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.summaryRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.inputBackground }]}>
                        <Ionicons name="wallet-outline" size={22} color={theme.colors.textPrimary} />
                    </View>
                    <View style={styles.summaryText}>
                        <Text style={[styles.summaryLabel, { color: theme.colors.textPrimary }]}>Total Saved This Month</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>${savedThisMonth.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.summaryRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.inputBackground }]}>
                        <Ionicons name="stats-chart-outline" size={22} color={theme.colors.textPrimary} />
                    </View>
                    <View style={styles.summaryText}>
                        <Text style={[styles.summaryLabel, { color: theme.colors.textPrimary }]}>Income Expended</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>{incomeExpended}%</Text>
                        <Text style={[styles.subText, { color: '#FF5B00' }]}>of total income</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default MonthlyBudgetSummary;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    balanceCard: {
        flex: 1,
        borderRadius: 14,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 13,
    },
    balanceAmount: {
        fontSize: 22,
        fontWeight: '700',
        marginVertical: 4,
    },
    gradientBar: {
        width: '100%',
        height: 35,
        borderRadius: 10,
        marginTop: 8,
    },
    percent: {
        fontSize: 12,
        marginTop: 4,
    },
    summaryCard: {
        borderRadius: 14,
        marginTop: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    summaryTitle: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    iconContainer: {
        borderRadius: 30,
        padding: 10,
        marginRight: 10,
    },
    summaryText: {
        flex: 1,
    },
    summaryLabel: {
        fontWeight: '600',
        fontSize: 14,
    },
    summaryValue: {
        fontWeight: '700',
        fontSize: 16,
        marginTop: 2,
    },
    subText: {
        fontSize: 12,
        color: '#2ECC71',
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 6,
    },
});
