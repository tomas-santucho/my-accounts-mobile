import { CategoryRepository } from "../../domain/category/categoryRepository";

export const deleteCategory = async (repository: CategoryRepository, id: string): Promise<void> => {
    await repository.deleteCategory(id);
};
