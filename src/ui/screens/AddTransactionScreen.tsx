import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../../services/transactionService';
import { convertAmount, formatCurrency } from '../../services/currencyService';
import ExchangeRateDisplay from '../lib/ExchangeRateDisplay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

import CategoryListScreen from './CategoryListScreen';
import { Category } from '../../domain/category/category';

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
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [currency, setCurrency] = useState<'usd' | 'ars'>('usd');
    const [installments, setInstallments] = useState('');
    const [showInstallmentPicker, setShowInstallmentPicker] = useState(false);
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
        if (!amount || !description || !selectedCategory) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid positive amount');
            return;
        }

        const numericInstallments = installments ? parseInt(installments) : undefined;

        // Validate installments range
        if (numericInstallments && (numericInstallments < 1 || numericInstallments > 24)) {
            Alert.alert('Error', 'Installments must be between 1 and 24');
            return;
        }

        setIsSubmitting(true);
        try {
            await transactionService.addTransaction(
                'user-123', // Hardcoded user ID for now
                type,
                description,
                numericAmount,
                selectedCategory.id,
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

                {/* Category Selection */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
                    <TouchableOpacity
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }
                        ]}
                        onPress={() => setIsCategoryModalVisible(true)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {selectedCategory ? (
                                <>
                                    <View style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: theme.colors.primary + '20',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8
                                    }}>
                                        <Ionicons name={selectedCategory.icon as any} size={14} color={theme.colors.primary} />
                                    </View>
                                    <Text style={{ color: theme.colors.textPrimary, fontSize: 16 }}>{selectedCategory.name}</Text>
                                </>
                            ) : (
                                <Text style={{ color: theme.colors.placeholder, fontSize: 16 }}>Select Category</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={isCategoryModalVisible}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setIsCategoryModalVisible(false)}
                >
                    <CategoryListScreen
                        onClose={() => setIsCategoryModalVisible(false)}
                        onSelect={(category) => {
                            setSelectedCategory(category);
                            setIsCategoryModalVisible(false);
                        }}
                    />
                </Modal>

                {/* Installments (Only for Expense) */}
                {type === 'expense' && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Installments (Optional)</Text>
                        <View style={[
                            styles.pickerContainer,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border
                            }
                        ]}>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowInstallmentPicker(true)}
                            >
                                <Text style={[
                                    styles.pickerButtonText,
                                    { color: installments ? theme.colors.textPrimary : theme.colors.placeholder }
                                ]}>
                                    {installments ? `${installments} ${parseInt(installments) === 1 ? 'installment' : 'installments'}` : 'Select installments'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {installments && parseInt(installments) > 1 && (
                            <View style={[styles.installmentInfo, { borderTopColor: theme.colors.border }]}>
                                <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
                                <Text style={[styles.installmentInfoText, { color: theme.colors.textSecondary }]}>
                                    {currency === 'usd' ? '$' : 'ARS'} {(parseFloat(amount || '0') / parseInt(installments)).toFixed(2)} per month
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Installment Picker Modal */}
                <Modal
                    visible={showInstallmentPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowInstallmentPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowInstallmentPicker(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                            style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground, paddingBottom: Math.max(insets.bottom, 20) }]}
                        >
                            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Installments</Text>
                                <TouchableOpacity onPress={() => setShowInstallmentPicker(false)}>
                                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <TouchableOpacity
                                    style={[
                                        styles.installmentOption,
                                        { borderColor: theme.colors.border },
                                        !installments && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }
                                    ]}
                                    onPress={() => {
                                        setInstallments('');
                                        setShowInstallmentPicker(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.installmentOptionText,
                                        { color: theme.colors.textPrimary },
                                        !installments && { color: theme.colors.primary, fontWeight: '600' }
                                    ]}>
                                        No installments
                                    </Text>
                                    {!installments && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}
                                </TouchableOpacity>
                                <View style={styles.installmentGrid}>
                                    {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            style={[
                                                styles.installmentGridItem,
                                                {
                                                    backgroundColor: theme.colors.inputBackground,
                                                    borderColor: theme.colors.border
                                                },
                                                installments === String(num) && {
                                                    backgroundColor: theme.colors.primary,
                                                    borderColor: theme.colors.primary
                                                }
                                            ]}
                                            onPress={() => {
                                                setInstallments(String(num));
                                                setShowInstallmentPicker(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.installmentGridText,
                                                { color: theme.colors.textPrimary },
                                                installments === String(num) && { color: '#FFF', fontWeight: '700' }
                                            ]}>
                                                {num}
                                            </Text>
                                            <Text style={[
                                                styles.installmentGridLabel,
                                                { color: theme.colors.textSecondary },
                                                installments === String(num) && { color: '#FFF', opacity: 0.9 }
                                            ]}>
                                                {num === 1 ? 'month' : 'months'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>


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
    pickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    pickerButtonText: {
        fontSize: 16,
        flex: 1,
    },
    installmentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    installmentInfoText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalScroll: {
        padding: 20,
    },
    installmentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        marginBottom: 16,
    },
    installmentOptionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    installmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    installmentGridItem: {
        width: '22%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    installmentGridText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 2,
    },
    installmentGridLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
});
