import { CategoryRepository } from "../../domain/category/categoryRepository";
import { Category } from "../../domain/category/category";

export const createWebCategoryRepository = (): CategoryRepository => {
    return {
        async getCategories(): Promise<Category[]> {
            return [];
        },

        async getCategory(id: string): Promise<Category | null> {
            return null;
        },

        async addCategory(category: Category): Promise<void> {
            console.log("addCategory not implemented on web", category);
        },

        async updateCategory(category: Category): Promise<void> {
            console.log("updateCategory not implemented on web", category);
        },

        async deleteCategory(id: string): Promise<void> {
            console.log("deleteCategory not implemented on web", id);
        },
    };
};
