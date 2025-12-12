import { Platform } from "react-native";
import { TransactionRepository } from "../domain/transaction/transactionRepository";
import { createMobileTransactionRepository } from "../infrastructure/local/transactionRepository.mobile";
import { createWebTransactionRepository } from "../infrastructure/api/transactionRepository.web";
import * as TransactionUseCases from "../app/transaction";
import { Transaction } from "../domain/transaction/transaction";

let repository: TransactionRepository;

if (Platform.OS === 'web') {
    repository = createWebTransactionRepository();
} else {
    repository = createMobileTransactionRepository();
}

export const transactionService = {
    addTransaction: (
        userId: string,
        type: "income" | "expense",
        description: string,
        amount: number,
        category: string,
        date: Date,
        currency: "ars" | "usd",
        installments?: number
    ) => TransactionUseCases.addTransaction(repository, userId, type, description, amount, category, date, currency, installments),
    listTransactions: () => TransactionUseCases.listTransactions(repository),
    editTransaction: (transaction: Transaction) => TransactionUseCases.editTransaction(repository, transaction),
    deleteTransaction: (id: string) => TransactionUseCases.deleteTransaction(repository, id),
    deleteTransactionsByInstallmentGroup: (installmentGroupId: string) => TransactionUseCases.deleteTransactionsByInstallmentGroup(repository, installmentGroupId),
    updateTransaction: (transaction: Transaction, updateStrategy?: 'single' | 'all-installments') => TransactionUseCases.updateTransaction(repository, transaction, updateStrategy),
};
