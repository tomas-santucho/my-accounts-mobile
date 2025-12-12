import { Transaction } from "./transaction";

export interface TransactionRepository {
    getTransactions(): Promise<Transaction[]>;
    getTransaction(id: string): Promise<Transaction | null>;
    addTransaction(transaction: Transaction): Promise<void>;
    updateTransaction(transaction: Transaction): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
    deleteTransactionsByInstallmentGroup(installmentGroupId: string): Promise<void>;
    getDirtyTransactions?(): Promise<Transaction[]>;
    markAsSynced?(ids: string[]): Promise<void>;
    upsertTransactions?(transactions: Transaction[]): Promise<void>;
}
