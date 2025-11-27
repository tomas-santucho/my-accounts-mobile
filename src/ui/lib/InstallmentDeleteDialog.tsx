import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface InstallmentDeleteDialogProps {
    visible: boolean;
    onDeleteSingle: () => void;
    onDeleteAll: () => void;
    onCancel: () => void;
    installmentCount?: number;
}

export default function InstallmentDeleteDialog({
    visible,
    onDeleteSingle,
    onDeleteAll,
    onCancel,
    installmentCount,
}: InstallmentDeleteDialogProps) {
    const { theme } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[styles.dialog, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.inputBackground }]}>
                        <Ionicons name="warning-outline" size={32} color={theme.colors.error} />
                    </View>

                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Delete Installment
                    </Text>

                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                        This transaction is part of an installment plan{installmentCount ? ` with ${installmentCount} installments` : ''}.
                        What would you like to delete?
                    </Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: theme.colors.inputBackground }]}
                            onPress={onDeleteSingle}
                        >
                            <Ionicons name="document-outline" size={24} color={theme.colors.textPrimary} />
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                                    Delete This Only
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                                    Remove only this installment
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: theme.colors.inputBackground }]}
                            onPress={onDeleteAll}
                        >
                            <Ionicons name="documents-outline" size={24} color={theme.colors.error} />
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                                    Delete All Installments
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                                    Remove all related installments
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
        textAlign: 'center',
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 16,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
    },
    cancelButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
