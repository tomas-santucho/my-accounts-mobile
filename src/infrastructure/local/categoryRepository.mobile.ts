import Realm from "realm";
import { CategoryRepository } from "../../domain/category/categoryRepository";
import { Category } from "../../domain/category/category";
import { openRealm } from "../../data/realm/realm";
import { CategorySchema } from "../../data/realm/schemas";

export const createMobileCategoryRepository = (): CategoryRepository => {
    const getDb = async () => {
        if (CategorySchema === null) {
            throw new Error("CategorySchema is not available on this platform.");
        }
        return await openRealm();
    };

    return {
        async getCategories(): Promise<Category[]> {
            const db = await getDb();
            const results = db.objects<Category>("Category");
            return results.map(c => ({ ...c }));
        },

        async getCategory(id: string): Promise<Category | null> {
            const db = await getDb();
            const category = db.objectForPrimaryKey<Category>("Category", id);
            return category ? { ...category } : null;
        },

        async addCategory(category: Category): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Category", category);
            });
        },

        async updateCategory(category: Category): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Category", category, Realm.UpdateMode.Modified);
            });
        },

        async deleteCategory(id: string): Promise<void> {
            const db = await getDb();
            const category = db.objectForPrimaryKey("Category", id);
            if (category) {
                db.write(() => {
                    db.delete(category);
                });
            }
        },
    };
};
