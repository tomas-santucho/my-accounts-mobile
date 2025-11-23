import { TransactionRepository } from "../../domain/transaction/transactionRepository";

export const deleteTransaction = (repo: TransactionRepository, id: string) => {
    return repo.deleteTransaction(id);
};
