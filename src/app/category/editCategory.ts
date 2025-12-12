import { CategoryRepository } from "../../domain/category/categoryRepository";
import { Category } from "../../domain/category/category";

export const editCategory = async (repository: CategoryRepository, category: Category): Promise<void> => {
    await repository.updateCategory(category);
};
