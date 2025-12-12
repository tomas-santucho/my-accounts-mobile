import { CategoryRepository } from "../../domain/category/categoryRepository";
import { Category } from "../../domain/category/category";

export const listCategories = async (repository: CategoryRepository): Promise<Category[]> => {
    return await repository.getCategories();
};
