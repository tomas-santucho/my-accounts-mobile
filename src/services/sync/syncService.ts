import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMobileTransactionRepository } from '../../infrastructure/local/transactionRepository.mobile';
import { createMobileCategoryRepository } from '../../infrastructure/local/categoryRepository.mobile';
import { apiClient } from '../../data/rest/apiClient';
import { Transaction } from '../../domain/transaction/transaction';
import { Category } from '../../domain/category/category';

const LAST_SYNC_KEY = 'last_sync_timestamp';

export const syncService = {
    async sync(userId: string) {
        try {
            console.log("Starting sync...");
            const transactionRepo = createMobileTransactionRepository();
            const categoryRepo = createMobileCategoryRepository();

            // 1. Get last sync timestamp
            const lastSyncTimestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);

            // 2. Get dirty transactions and categories
            const dirtyTransactions = await (transactionRepo as any).getDirtyTransactions();
            const dirtyCategories = await (categoryRepo as any).getDirtyCategories();

            console.log(`Found ${dirtyTransactions.length} dirty transactions and ${dirtyCategories.length} dirty categories to push.`);

            // 3. Prepare payload
            const payload = {
                lastSyncTimestamp: lastSyncTimestamp ? lastSyncTimestamp : null,
                changes: {
                    updated: dirtyTransactions, // Includes created, updated, and soft-deleted (with deletedAt set)
                    categories: {
                        updated: dirtyCategories,
                    }
                },
                userId
            };

            // 4. Call backend
            const response = await apiClient.post('/api/sync/transactions', payload);

            console.log("Sync response received:", response);

            // 5. Apply server changes
            if (response.changes) {
                // Apply transaction updates
                if (response.changes.transactions && response.changes.transactions.updated) {
                    const serverTransactionUpdates = response.changes.transactions.updated as Transaction[];
                    console.log(`Applying ${serverTransactionUpdates.length} transaction updates from server.`);
                    if (serverTransactionUpdates.length > 0) {
                        await (transactionRepo as any).upsertTransactions(serverTransactionUpdates);
                    }
                }

                // Apply category updates
                if (response.changes.categories && response.changes.categories.updated) {
                    const serverCategoryUpdates = response.changes.categories.updated as Category[];
                    console.log(`Applying ${serverCategoryUpdates.length} category updates from server.`);
                    if (serverCategoryUpdates.length > 0) {
                        await (categoryRepo as any).upsertCategories(serverCategoryUpdates);
                    }
                }
            }

            // 6. Mark local dirty items as synced
            if (dirtyTransactions.length > 0) {
                const transactionIds = dirtyTransactions.map((t: Transaction) => t.id);
                await (transactionRepo as any).markAsSynced(transactionIds);
            }

            if (dirtyCategories.length > 0) {
                const categoryIds = dirtyCategories.map((c: Category) => c.id);
                await (categoryRepo as any).markAsSynced(categoryIds);
            }

            // 7. Update timestamp
            if (response.timestamp) {
                await AsyncStorage.setItem(LAST_SYNC_KEY, response.timestamp);
            }

            console.log("Sync completed successfully.");

        } catch (error) {
            console.error("Sync failed:", error);
            throw error;
        }
    },

    async clearSyncData() {
        await AsyncStorage.removeItem(LAST_SYNC_KEY);
    }
};
