import { CategoryRepository } from "../../domain/category/categoryRepository";
import { createCategory } from "../../domain/category/category";

export const addCategory = async (
    repository: CategoryRepository,
    name: string,
    icon: string,
    type: "income" | "expense",
    color?: string,
    isDefault?: boolean
): Promise<void> => {
    const category = createCategory(name, icon, type, color, isDefault);
    await repository.addCategory(category);
};
