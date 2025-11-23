import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Transaction } from '../../domain/transaction/transaction';

const FinanceCard = ({ title, total, data }: { title: string, total: string, data: Transaction[] }) => {
    const renderItem = ({ item }: { item: Transaction }) => {
        return (
            <View style={styles.row}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 20 }}>{item.type === 'income' ? '💰' : '💸'}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={styles.category}>{item.description}</Text>
                    <View style={styles.values}>
                        <Text style={styles.label}>Category</Text>
                        <Text style={styles.value}>{item.category}</Text>
                        <Text style={styles.label}>Amount</Text>
                        <Text style={styles.value}>${item.amount.toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.total}>Total: ${total}</Text>
            </View>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
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
        color: '#1A2343',
        fontSize: 16,
    },
    total: {
        color: '#333',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    category: {
        fontWeight: '600',
        color: '#1A2343',
    },
    values: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    label: {
        color: '#888',
        fontSize: 12,
    },
    value: {
        fontWeight: '600',
        fontSize: 13,
        width: 55,
        textAlign: 'right',
    },
});

export default FinanceCard;
