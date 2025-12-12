import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../domain/category/category';
import AddCategoryScreen from './AddCategoryScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CategoryListScreenProps {
    onClose: () => void;
    onSelect?: (category: Category) => void; // If provided, acts as a selector
}

export default function CategoryListScreen({ onClose, onSelect }: CategoryListScreenProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState<Category[]>([]);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    const loadCategories = useCallback(async () => {
        try {
            const allCategories = await categoryService.listCategories();
            setCategories(allCategories);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleDelete = (category: Category) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await categoryService.deleteCategory(category.id);
                            loadCategories();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete category");
                        }
                    }
                }
            ]
        );
    };

    const handlePress = (category: Category) => {
        if (onSelect) {
            onSelect(category);
            onClose();
        } else {
            setEditingCategory(category);
            setIsAddModalVisible(true);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={() => handlePress(item)}
            onLongPress={() => !onSelect && handleDelete(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            {!onSelect && (
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error || '#FF3B30'} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
            <View style={[styles.header, { borderBottomColor: theme.colors.border, paddingTop: 16 }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    {onSelect ? 'Select Category' : 'Categories'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
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

                <FlatList
                    data={filteredCategories}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No categories found</Text>
                        </View>
                    }
                />
            </View>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 20 }]}
                onPress={() => {
                    setEditingCategory(undefined);
                    setIsAddModalVisible(true);
                }}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>

            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <AddCategoryScreen
                    onClose={() => setIsAddModalVisible(false)}
                    onSave={() => {
                        loadCategories();
                        // If we are in selection mode and just created a category, we might want to select it automatically?
                        // For now, just reload list.
                    }}
                    initialCategory={editingCategory}
                />
            </Modal>
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
        paddingBottom: 16,
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
    },
    segmentContainer: {
        flexDirection: 'row',
        margin: 16,
        borderRadius: 12,
        padding: 4,
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
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});
