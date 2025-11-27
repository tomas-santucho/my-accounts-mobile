import { Platform } from "react-native";
import { CategoryRepository } from "../domain/category/categoryRepository";
import { createMobileCategoryRepository } from "../infrastructure/local/categoryRepository.mobile";
import { createWebCategoryRepository } from "../infrastructure/api/categoryRepository.web";
import * as CategoryUseCases from "../app/category";
import { Category } from "../domain/category/category";

let repository: CategoryRepository;

if (Platform.OS === 'web') {
    repository = createWebCategoryRepository();
} else {
    repository = createMobileCategoryRepository();
}

export const categoryService = {
    addCategory: (
        name: string,
        icon: string,
        type: "income" | "expense",
        color?: string,
        isDefault?: boolean
    ) => CategoryUseCases.addCategory(repository, name, icon, type, color, isDefault),
    listCategories: () => CategoryUseCases.listCategories(repository),
    editCategory: (category: Category) => CategoryUseCases.editCategory(repository, category),
    deleteCategory: (id: string) => CategoryUseCases.deleteCategory(repository, id),
};
