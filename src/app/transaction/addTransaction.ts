import { TransactionRepository } from "../../domain/transaction/transactionRepository";
import { createTransaction } from "../../domain/transaction/transaction";

export const addTransaction = (
    repo: TransactionRepository,
    userId: string,
    type: "income" | "expense",
    description: string,
    amount: number,
    category: string,
    date: Date,
    currency: "ars" | "usd",
    installments?: number
) => {
    const newTransaction = createTransaction(
        userId,
        type,
        description,
        amount,
        category,
        date,
        currency,
        installments
    );
    return repo.addTransaction(newTransaction);
};
