import { Category } from "./category";

export interface CategoryRepository {
    getCategories(): Promise<Category[]>;
    getCategory(id: string): Promise<Category | null>;
    addCategory(category: Category): Promise<void>;
    updateCategory(category: Category): Promise<void>;
    deleteCategory(id: string): Promise<void>;
}
