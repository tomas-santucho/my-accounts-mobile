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
            const results = db.objects<Transaction>("Transaction");
            return results.map(t => ({...t}));
        },

        async getTransaction(id: string): Promise<Transaction | null> {
            const db = await getDb();
            const transaction = db.objectForPrimaryKey<Transaction>("Transaction", id);
            return transaction ? {...transaction} : null;
        },

        async addTransaction(transaction: Transaction): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Transaction", transaction);
            });
        },

        async updateTransaction(transaction: Transaction): Promise<void> {
            const db = await getDb();
            db.write(() => {
                db.create("Transaction", transaction, Realm.UpdateMode.Modified);
            });
        },

        async deleteTransaction(id: string): Promise<void> {
            const db = await getDb();
            const transaction = db.objectForPrimaryKey("Transaction", id);
            if (transaction) {
                db.write(() => {
                    db.delete(transaction);
                });
            }
        },
    };
};
