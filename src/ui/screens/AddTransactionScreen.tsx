import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../../services/transactionService';
import { convertAmount, formatCurrency } from '../../services/currencyService';
import ExchangeRateDisplay from '../lib/ExchangeRateDisplay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface AddTransactionScreenProps {
    onClose: () => void;
    onSave: () => void;
}

export default function AddTransactionScreen({ onClose, onSave }: AddTransactionScreenProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState<'usd' | 'ars'>('usd');
    const [installments, setInstallments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [convertedAmount, setConvertedAmount] = useState<string>('');

    useEffect(() => {
        const updateConversion = async () => {
            const numericAmount = parseFloat(amount);
            if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
                setConvertedAmount('');
                return;
            }

            try {
                const targetCurrency = currency === 'usd' ? 'ars' : 'usd';
                const converted = await convertAmount(
                    numericAmount,
                    currency,
                    targetCurrency,
                    'blue'
                );
                setConvertedAmount(formatCurrency(converted, targetCurrency));
            } catch (error) {
                console.error('Conversion error:', error);
                setConvertedAmount('');
            }
        };

        updateConversion();
    }, [amount, currency]);

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
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Add Transaction</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Type Segmented Control */}
                <View style={[styles.segmentContainer, { backgroundColor: theme.colors.inputBackground }]}>
                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            type === 'expense' && { backgroundColor: theme.colors.cardBackground, ...styles.shadow }
                        ]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[
                            styles.segmentText,
                            { color: theme.colors.textSecondary },
                            type === 'expense' && { color: theme.colors.textPrimary, fontWeight: '600' }
                        ]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            type === 'income' && { backgroundColor: theme.colors.cardBackground, ...styles.shadow }
                        ]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[
                            styles.segmentText,
                            { color: theme.colors.textSecondary },
                            type === 'income' && { color: theme.colors.textPrimary, fontWeight: '600' }
                        ]}>Income</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Amount</Text>
                    <View style={[styles.amountContainer, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.currencySymbol, { color: theme.colors.textPrimary }]}>{currency === 'usd' ? '$' : 'ARS'}</Text>
                        <TextInput
                            style={[styles.amountInput, { color: theme.colors.textPrimary }]}
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.placeholder}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                {/* Currency Selection */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Currency</Text>
                    <View style={styles.currencySelector}>
                        <TouchableOpacity
                            style={[
                                styles.currencyButton,
                                { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                                currency === 'usd' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }
                            ]}
                            onPress={() => setCurrency('usd')}
                        >
                            <Text style={[
                                styles.currencyButtonText,
                                { color: theme.colors.textSecondary },
                                currency === 'usd' && { color: theme.colors.primary, fontWeight: '600' }
                            ]}>USD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.currencyButton,
                                { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                                currency === 'ars' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }
                            ]}
                            onPress={() => setCurrency('ars')}
                        >
                            <Text style={[
                                styles.currencyButtonText,
                                { color: theme.colors.textSecondary },
                                currency === 'ars' && { color: theme.colors.primary, fontWeight: '600' }
                            ]}>ARS</Text>
                        </TouchableOpacity>
                    </View>
                    {convertedAmount && (
                        <View style={[styles.conversionPreview, { borderTopColor: theme.colors.border }]}>
                            <Ionicons name="swap-horizontal" size={14} color={theme.colors.textSecondary} />
                            <Text style={[styles.conversionText, { color: theme.colors.textSecondary }]}>
                                ≈ {convertedAmount}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Exchange Rate Info */}
                <ExchangeRateDisplay compact={true} />

                {/* Description Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.border
                            }
                        ]}
                        placeholder="What is this for?"
                        placeholderTextColor={theme.colors.placeholder}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Category Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.border
                            }
                        ]}
                        placeholder="e.g. Food, Transport, Salary"
                        placeholderTextColor={theme.colors.placeholder}
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                {/* Installments (Only for Expense) */}
                {type === 'expense' && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Installments (Optional)</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.inputBackground,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.border
                                }
                            ]}
                            placeholder="Number of installments"
                            placeholderTextColor={theme.colors.placeholder}
                            keyboardType="number-pad"
                            value={installments}
                            onChangeText={setInstallments}
                        />
                    </View>
                )}

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: theme.colors.primary },
                        isSubmitting && styles.saveButtonDisabled
                    ]}
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    segmentContainer: {
        flexDirection: 'row',
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
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        paddingBottom: 8,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '700',
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
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
    },
    currencyButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    conversionPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    conversionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    saveButton: {
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
