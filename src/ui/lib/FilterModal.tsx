import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Category } from '../../domain/category/category';

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    selectedMonth: number | null;
    selectedYear: number | null;
    selectedCategories: string[];
    categories: Category[];
    sortBy: SortOption;
    onApplyFilters: (filters: {
        month: number | null;
        year: number | null;
        categories: string[];
        sortBy: SortOption;
    }) => void;
    onResetFilters: () => void;
}

const MONTHS = [
    'All Months',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
    { value: 'date-desc', label: 'Date (Newest First)', icon: 'calendar-outline' },
    { value: 'date-asc', label: 'Date (Oldest First)', icon: 'calendar-outline' },
    { value: 'amount-desc', label: 'Amount (Highest to Lowest)', icon: 'trending-down-outline' },
    { value: 'amount-asc', label: 'Amount (Lowest to Highest)', icon: 'trending-up-outline' },
];

export default function FilterModal({
    visible,
    onClose,
    selectedMonth,
    selectedYear,
    selectedCategories,
    categories,
    sortBy,
    onApplyFilters,
    onResetFilters,
}: FilterModalProps) {
    const { theme } = useTheme();
    const [tempMonth, setTempMonth] = React.useState<number | null>(selectedMonth);
    const [tempYear, setTempYear] = React.useState<number | null>(selectedYear);
    const [tempSelectedCategories, setTempSelectedCategories] = React.useState<string[]>(selectedCategories);
    const [tempSortBy, setTempSortBy] = React.useState<SortOption>(sortBy);

    // Generate year options (current year and past 5 years)
    const currentYear = new Date().getFullYear();
    const YEARS = ['All Years', ...Array.from({ length: 6 }, (_, i) => (currentYear - i).toString())];

    React.useEffect(() => {
        if (visible) {
            setTempMonth(selectedMonth);
            setTempYear(selectedYear);
            setTempSelectedCategories(selectedCategories);
            setTempSortBy(sortBy);
        }
    }, [visible, selectedMonth, selectedYear, selectedCategories, sortBy]);

    const handleApply = () => {
        onApplyFilters({
            month: tempMonth,
            year: tempYear,
            categories: tempSelectedCategories,
            sortBy: tempSortBy,
        });
        onClose();
    };

    const handleReset = () => {
        setTempMonth(null);
        setTempYear(null);
        setTempSelectedCategories([]);
        setTempSortBy('date-desc');
        onResetFilters();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                            Filter & Sort
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Category Filter */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Filter by Category
                            </Text>
                            <View style={styles.optionsGrid}>
                                {categories.map((category) => {
                                    const isSelected = tempSelectedCategories.includes(category.id);
                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.optionButton,
                                                {
                                                    backgroundColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.cardBackground,
                                                    borderColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.border,
                                                    flexDirection: 'row',
                                                    gap: 6
                                                },
                                            ]}
                                            onPress={() => {
                                                if (isSelected) {
                                                    setTempSelectedCategories(prev => prev.filter(id => id !== category.id));
                                                } else {
                                                    setTempSelectedCategories(prev => [...prev, category.id]);
                                                }
                                            }}
                                        >
                                            <Ionicons name={category.icon as any} size={16} color={isSelected ? theme.colors.onPrimary : theme.colors.textSecondary} />
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected
                                                            ? theme.colors.onPrimary
                                                            : theme.colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Month Filter */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Filter by Month
                            </Text>
                            <View style={styles.optionsGrid}>
                                {MONTHS.map((month, index) => {
                                    const monthValue = index === 0 ? null : index - 1;
                                    const isSelected = tempMonth === monthValue;
                                    return (
                                        <TouchableOpacity
                                            key={month}
                                            style={[
                                                styles.optionButton,
                                                {
                                                    backgroundColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.cardBackground,
                                                    borderColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.border,
                                                },
                                            ]}
                                            onPress={() => setTempMonth(monthValue)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected
                                                            ? theme.colors.onPrimary
                                                            : theme.colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                {month}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Year Filter */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Filter by Year
                            </Text>
                            <View style={styles.optionsGrid}>
                                {YEARS.map((year, index) => {
                                    const yearValue = index === 0 ? null : parseInt(year);
                                    const isSelected = tempYear === yearValue;
                                    return (
                                        <TouchableOpacity
                                            key={year}
                                            style={[
                                                styles.optionButton,
                                                {
                                                    backgroundColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.cardBackground,
                                                    borderColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.border,
                                                },
                                            ]}
                                            onPress={() => setTempYear(yearValue)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected
                                                            ? theme.colors.onPrimary
                                                            : theme.colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                {year}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Sort Options */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Sort By
                            </Text>
                            <View style={styles.sortOptions}>
                                {SORT_OPTIONS.map((option) => {
                                    const isSelected = tempSortBy === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.sortOption,
                                                {
                                                    backgroundColor: theme.colors.cardBackground,
                                                    borderColor: isSelected
                                                        ? theme.colors.primary
                                                        : theme.colors.border,
                                                    borderWidth: isSelected ? 2 : 1,
                                                },
                                            ]}
                                            onPress={() => setTempSortBy(option.value)}
                                        >
                                            <Ionicons
                                                name={option.icon as any}
                                                size={20}
                                                color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                                            />
                                            <Text
                                                style={[
                                                    styles.sortOptionText,
                                                    {
                                                        color: isSelected
                                                            ? theme.colors.primary
                                                            : theme.colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={20}
                                                    color={theme.colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                        <TouchableOpacity
                            style={[styles.resetButton, { borderColor: theme.colors.border }]}
                            onPress={handleReset}
                        >
                            <Text style={[styles.resetButtonText, { color: theme.colors.textSecondary }]}>
                                Reset
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleApply}
                        >
                            <Text style={[styles.applyButtonText, { color: theme.colors.onPrimary }]}>
                                Apply Filters
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 20,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 100,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sortOptions: {
        gap: 12,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    sortOptionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
