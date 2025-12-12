import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, BudgetSchema } from '../../domain/budget/budget';

const STORAGE_KEY = '@budgets';

export const budgetRepository = {
    async getBudgets(month: number, year: number): Promise<Budget[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue != null) {
                const allBudgets = JSON.parse(jsonValue);
                // Validate and filter
                const budgets: Budget[] = [];
                for (const item of allBudgets) {
                    try {
                        // Parse dates back to Date objects if they are strings
                        if (typeof item.updatedAt === 'string') {
                            item.updatedAt = new Date(item.updatedAt);
                        }
                        const budget = BudgetSchema.parse(item);
                        if (budget.month === month && budget.year === year) {
                            budgets.push(budget);
                        }
                    } catch (e) {
                        console.warn("Invalid budget item found in storage", e);
                    }
                }
                return budgets;
            }
            return [];
        } catch (e) {
            console.error("Failed to load budgets", e);
            return [];
        }
    },

    async saveBudget(budget: Budget): Promise<void> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            let allBudgets: any[] = [];
            if (jsonValue != null) {
                allBudgets = JSON.parse(jsonValue);
            }

            // Remove existing budget for same category/month/year if exists
            allBudgets = allBudgets.filter(b =>
                !(b.categoryId === budget.categoryId && b.month === budget.month && b.year === budget.year)
            );

            allBudgets.push(budget);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allBudgets));
        } catch (e) {
            console.error("Failed to save budget", e);
            throw e;
        }
    },

    async getAllBudgets(): Promise<Budget[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue != null) {
                const allBudgets = JSON.parse(jsonValue);
                return allBudgets.map((item: any) => {
                    if (typeof item.updatedAt === 'string') {
                        item.updatedAt = new Date(item.updatedAt);
                    }
                    return BudgetSchema.parse(item);
                });
            }
            return [];
        } catch (e) {
            console.error("Failed to load all budgets", e);
            return [];
        }
    }
};
