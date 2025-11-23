import { TransactionRepository } from "../../domain/transaction/transactionRepository";

export const listTransactions = (repo: TransactionRepository) => {
    return repo.getTransactions();
};
