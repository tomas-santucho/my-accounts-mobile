import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../../services/transactionService';

interface AddTransactionScreenProps {
    onClose: () => void;
    onSave: () => void;
}

export default function AddTransactionScreen({ onClose, onSave }: AddTransactionScreenProps) {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState<'usd' | 'ars'>('usd');
    const [installments, setInstallments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!amount || !description || !category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid positive amount');
            return;
        }

        const numericInstallments = installments ? parseInt(installments) : undefined;

        setIsSubmitting(true);
        try {
            await transactionService.addTransaction(
                'user-123', // Hardcoded user ID for now
                type,
                description,
                numericAmount,
                category,
                new Date(),
                currency,
                numericInstallments
            );
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Transaction</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Type Segmented Control */}
                <View style={styles.segmentContainer}>
                    <TouchableOpacity
                        style={[styles.segmentButton, type === 'expense' && styles.segmentActiveExpense]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentButton, type === 'income' && styles.segmentActiveIncome]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Income</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>{currency === 'usd' ? '$' : 'ARS'}</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                {/* Currency Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Currency</Text>
                    <View style={styles.currencySelector}>
                        <TouchableOpacity
                            style={[styles.currencyButton, currency === 'usd' && styles.currencyButtonActive]}
                            onPress={() => setCurrency('usd')}
                        >
                            <Text style={[styles.currencyButtonText, currency === 'usd' && styles.currencyButtonTextActive]}>USD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.currencyButton, currency === 'ars' && styles.currencyButtonActive]}
                            onPress={() => setCurrency('ars')}
                        >
                            <Text style={[styles.currencyButtonText, currency === 'ars' && styles.currencyButtonTextActive]}>ARS</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="What is this for?"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Category Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Food, Transport, Salary"
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                {/* Installments (Only for Expense) */}
                {type === 'expense' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Installments (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Number of installments"
                            keyboardType="number-pad"
                            value={installments}
                            onChangeText={setInstallments}
                        />
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Save Transaction'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentActiveExpense: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentActiveIncome: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    segmentTextActive: {
        color: '#1E293B',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 8,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 8,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1E293B',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '700',
        color: '#1E293B',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    currencySelector: {
        flexDirection: 'row',
        gap: 12,
    },
    currencyButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFF',
    },
    currencyButtonActive: {
        borderColor: '#FF7F50',
        backgroundColor: '#FFF0E0',
    },
    currencyButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    currencyButtonTextActive: {
        color: '#FF7F50',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    saveButton: {
        backgroundColor: '#1E293B',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
