import { TransactionRepository } from "../../domain/transaction/transactionRepository";
import { Transaction } from "../../domain/transaction/transaction";

export const editTransaction = (
    repo: TransactionRepository,
    transaction: Transaction
) => {
    return repo.updateTransaction(transaction);
};
