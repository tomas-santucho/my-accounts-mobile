import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../domain/category/category';

interface AddCategoryScreenProps {
    onClose: () => void;
    onSave: () => void;
    initialCategory?: Category;
}

const ICONS = [
    'fast-food', 'restaurant', 'cafe', 'beer', 'wine',
    'car', 'bus', 'bicycle', 'train', 'airplane',
    'home', 'construct', 'hammer', 'key',
    'cart', 'gift', 'shirt', 'cut',
    'medical', 'fitness', 'heart',
    'school', 'book', 'briefcase',
    'game-controller', 'desktop', 'phone-portrait', 'wifi',
    'paw', 'flower', 'leaf', 'water', 'flash',
    'cash', 'card', 'wallet', 'pricetag',
    'star', 'map', 'navigate', 'pin'
];

export default function AddCategoryScreen({ onClose, onSave, initialCategory }: AddCategoryScreenProps) {
    const { theme } = useTheme();
    const [name, setName] = useState(initialCategory?.name || '');
    const [icon, setIcon] = useState(initialCategory?.icon || 'pricetag');
    const [type, setType] = useState<'income' | 'expense'>(initialCategory?.type || 'expense');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        setIsSubmitting(true);
        try {
            if (initialCategory) {
                await categoryService.editCategory({
                    ...initialCategory,
                    name,
                    icon,
                    type,
                });
            } else {
                await categoryService.addCategory(name, icon, type);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    {initialCategory ? 'Edit Category' : 'New Category'}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
                    <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Type Selector */}
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

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
                    <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
                        <View style={[styles.iconPreview, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, { color: theme.colors.textPrimary }]}
                            placeholder="Category Name"
                            placeholderTextColor={theme.colors.placeholder}
                            value={name}
                            onChangeText={setName}
                            autoFocus={!initialCategory}
                        />
                    </View>
                </View>

                {/* Icon Picker */}
                <Text style={[styles.label, { color: theme.colors.textSecondary, marginBottom: 12 }]}>Select Icon</Text>
                <View style={styles.iconGrid}>
                    {ICONS.map((iconName) => (
                        <TouchableOpacity
                            key={iconName}
                            style={[
                                styles.iconButton,
                                { borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground },
                                icon === iconName && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '15' }
                            ]}
                            onPress={() => setIcon(iconName)}
                        >
                            <Ionicons
                                name={iconName as any}
                                size={24}
                                color={icon === iconName ? theme.colors.primary : theme.colors.textSecondary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
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
    saveButtonText: {
        fontSize: 16,
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
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
    },
    iconPreview: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 40,
    },
    iconButton: {
        width: '18%', // Approx 5 columns
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
});
