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
            const results = db.objects("Category").filtered("deletedAt == null");
            return results.map((c: any) => ({ ...c } as Category));
        },

        async getCategory(id: string): Promise<Category | null> {
            const db = await getDb();
            const category = db.objectForPrimaryKey("Category", id);
            return (category && !(category as any).deletedAt) ? { ...category } as Category : null;
        },

        async addCategory(category: Category): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Category", { ...category, isSynced: false });
            });
        },

        async updateCategory(category: Category): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Category", { ...category, updatedAt: new Date(), isSynced: false }, Realm.UpdateMode.Modified);
            });
        },

        async deleteCategory(id: string): Promise<void> {
            const db = await getDb();
            const category = db.objectForPrimaryKey("Category", id);
            if (category) {
                db.write(() => {
                    (category as any).deletedAt = new Date();
                    (category as any).updatedAt = new Date();
                    (category as any).isSynced = false;
                });
            }
        },

        async getDirtyCategories(): Promise<Category[]> {
            const db = await getDb();
            const results = db.objects("Category").filtered("isSynced == false");
            return results.map((c: any) => ({ ...c } as Category));
        },

        async markAsSynced(ids: string[]): Promise<void> {
            const db = await getDb();
            const categories = db.objects("Category").filtered("id IN $0", ids);
            db.write(() => {
                for (const c of categories) {
                    (c as any).isSynced = true;
                }
            });
        },

        async upsertCategories(categories: Category[]): Promise<void> {
            const db = await getDb();
            db.write(() => {
                for (const c of categories) {
                    const existing = db.objectForPrimaryKey("Category", c.id);

                    if (existing) {
                        const existingUpdatedAt = (existing as any).updatedAt;
                        const incomingUpdatedAt = new Date(c.updatedAt);
                        if (existingUpdatedAt >= incomingUpdatedAt) {
                            // Local is newer or same, skip overwriting
                            continue;
                        }
                    }

                    // When pulling from server, we mark as synced
                    db.create("Category", { ...c, isSynced: true }, Realm.UpdateMode.Modified);
                }
            });
        }
    };
};
