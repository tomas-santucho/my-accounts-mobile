import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MonthlyBudgetSummary = () => {
    // mock data
    const startingBalance = 99;
    const endingBalance = 99;
    const savingsIncrease = 99;
    const savedThisMonth = 99;
    const incomeExpended = 99;

    return (
        <View style={styles.container}>
            {/* Top balance cards */}
            <View style={styles.balanceRow}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Starting Balance</Text>
                    <Text style={styles.balanceAmount}>${startingBalance.toLocaleString()}</Text>
                    <LinearGradient
                        colors={['#FF7A00', '#FF5B00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBar}
                    />
                    <Text style={styles.percent}>100%</Text>
                </View>

                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Ending Balance</Text>
                    <Text style={styles.balanceAmount}>${endingBalance.toLocaleString()}</Text>
                    <LinearGradient
                        colors={['#FF7A00', '#FF5B00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradientBar, { width: '81%' }]}
                    />
                    <Text style={styles.percent}>99%</Text>
                </View>
            </View>

            {/* Summary card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Summary</Text>

                <View style={styles.summaryRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="trending-up-outline" size={22} color="#1A2343" />
                    </View>
                    <View style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Savings Increase</Text>
                        <Text style={styles.summaryValue}>+{savingsIncrease}%</Text>
                        <Text style={styles.subText}>vs last month</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="wallet-outline" size={22} color="#1A2343" />
                    </View>
                    <View style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Total Saved This Month</Text>
                        <Text style={styles.summaryValue}>${savedThisMonth.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="stats-chart-outline" size={22} color="#1A2343" />
                    </View>
                    <View style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Income Expended</Text>
                        <Text style={styles.summaryValue}>{incomeExpended}%</Text>
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
        backgroundColor: '#F7F8FC',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    balanceCard: {
        flex: 1,
        backgroundColor: '#fff',
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
        color: '#666',
        fontSize: 13,
    },
    balanceAmount: {
        color: '#1A2343',
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
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#fff',
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
        color: '#1A2343',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    iconContainer: {
        backgroundColor: '#E9ECF4',
        borderRadius: 30,
        padding: 10,
        marginRight: 10,
    },
    summaryText: {
        flex: 1,
    },
    summaryLabel: {
        fontWeight: '600',
        color: '#1A2343',
        fontSize: 14,
    },
    summaryValue: {
        fontWeight: '700',
        color: '#1A2343',
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
        backgroundColor: '#E9ECF4',
        marginVertical: 6,
    },
});
