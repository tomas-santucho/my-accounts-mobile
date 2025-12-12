import Realm from "realm";
import { TransactionRepository } from "../../domain/transaction/transactionRepository";
import { Transaction } from "../../domain/transaction/transaction";
import { openRealm } from "../../data/realm/realm";
import { TransactionSchema } from "../../data/realm/schemas";

export const createMobileTransactionRepository = (): TransactionRepository => {
    const getDb = async () => {
        if (TransactionSchema === null) {
            throw new Error("TransactionSchema is not available on this platform.");
        }
        return await openRealm();
    };

    return {
        async getTransactions(): Promise<Transaction[]> {
            const db = await getDb();
            const results = db.objects("Transaction").filtered("deletedAt == null");
            return results.map((t: any) => ({ ...t } as Transaction));
        },

        async getTransaction(id: string): Promise<Transaction | null> {
            const db = await getDb();
            const transaction = db.objectForPrimaryKey("Transaction", id);
            return (transaction && !transaction.deletedAt) ? { ...transaction } as Transaction : null;
        },

        async addTransaction(transaction: Transaction): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Transaction", { ...transaction, isSynced: false });
            });
        },

        async updateTransaction(transaction: Transaction): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Transaction", { ...transaction, updatedAt: new Date(), isSynced: false }, Realm.UpdateMode.Modified);
            });
        },

        async deleteTransaction(id: string): Promise<void> {
            const db = await getDb();
            const transaction = db.objectForPrimaryKey("Transaction", id);
            if (transaction) {
                db.write(() => {
                    transaction.deletedAt = new Date();
                    transaction.updatedAt = new Date();
                    transaction.isSynced = false;
                });
            }
        },

        async deleteTransactionsByInstallmentGroup(installmentGroupId: string): Promise<void> {
            const db = await getDb();
            const transactions = db.objects("Transaction")
                .filtered("installmentGroupId == $0", installmentGroupId);

            if (transactions.length > 0) {
                db.write(() => {
                    for (const t of transactions) {
                        t.deletedAt = new Date();
                        t.updatedAt = new Date();
                        t.isSynced = false;
                    }
                });
            }
        },

        async getDirtyTransactions(): Promise<Transaction[]> {
            const db = await getDb();
            const results = db.objects("Transaction").filtered("isSynced == false");
            return results.map((t: any) => ({ ...t } as Transaction));
        },

        async markAsSynced(ids: string[]): Promise<void> {
            const db = await getDb();
            const transactions = db.objects("Transaction").filtered("id IN $0", ids);
            db.write(() => {
                for (const t of transactions) {
                    t.isSynced = true;
                }
            });
        },

        async upsertTransactions(transactions: Transaction[]): Promise<void> {
            const db = await getDb();
            db.write(() => {
                for (const t of transactions) {
                    const existing = db.objectForPrimaryKey("Transaction", t.id);
                    // Check if we should overwrite:
                    // 1. If no existing record, write.
                    // 2. If existing record is older than incoming, write.
                    // 3. If existing record is newer or same, SKIP (server might be sending back what we just sent, or we have newer local changes).

                    if (existing) {
                        const existingUpdatedAt = (existing as any).updatedAt;
                        const incomingUpdatedAt = new Date(t.updatedAt);
                        if (existingUpdatedAt >= incomingUpdatedAt) {
                            // Local is newer or same, skip overwriting
                            continue;
                        }
                    }

                    // When pulling from server, we mark as synced
                    db.create("Transaction", { ...t, isSynced: true }, Realm.UpdateMode.Modified);
                }
            });
        }
    };
};
