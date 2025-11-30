import { CategoryRepository } from "../../domain/category/categoryRepository";
import { Category } from "../../domain/category/category";
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    // Income categories
    { name: 'Salary', icon: 'cash-outline', type: 'income', color: '#10B981', isDefault: true },
    { name: 'Freelance', icon: 'briefcase-outline', type: 'income', color: '#059669', isDefault: true },
    { name: 'Investments', icon: 'trending-up-outline', type: 'income', color: '#34D399', isDefault: true },

    // Expense categories
    { name: 'Transport', icon: 'car-outline', type: 'expense', color: '#3B82F6', isDefault: true },
    { name: 'Food', icon: 'restaurant-outline', type: 'expense', color: '#F59E0B', isDefault: true },
    { name: 'Shopping', icon: 'bag-handle-outline', type: 'expense', color: '#A855F7', isDefault: true },
    { name: 'Bills', icon: 'flash-outline', type: 'expense', color: '#EF4444', isDefault: true },
    { name: 'Rent', icon: 'home-outline', type: 'expense', color: '#92400E', isDefault: true },
    { name: 'Entertainment', icon: 'game-controller-outline', type: 'expense', color: '#EC4899', isDefault: true },
    { name: 'Health', icon: 'medical-outline', type: 'expense', color: '#14B8A6', isDefault: true },
];

export async function seedDefaultCategories(
    repository: CategoryRepository
): Promise<void> {
    try {
        // Get existing categories
        const existingCategories = await repository.getCategories();
        const existingNames = new Set(existingCategories.map(c => c.name.toLowerCase()));

        // Only add categories that don't already exist
        for (const categoryData of DEFAULT_CATEGORIES) {
            if (!existingNames.has(categoryData.name.toLowerCase())) {
                const category: Category = {
                    id: uuidv4(),
                    ...categoryData,
                };
                await repository.addCategory(category);
            }
        }
    } catch (error) {
        console.error('Failed to seed default categories:', error);
        // Don't throw - seeding failure shouldn't crash the app
    }
}
