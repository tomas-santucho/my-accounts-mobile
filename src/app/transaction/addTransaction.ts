import {TransactionRepository} from "../../domain/transaction/transactionRepository";
import {createTransaction} from "../../domain/transaction/transaction";
import {v4 as uuidv4} from 'uuid';

export const addTransaction = async (
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
    if (!installments || installments === 1) {
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
    }


    const installmentGroupId = uuidv4();
    const amountPerInstallment = amount / installments;

    const transactions = [];
    for (let i = 0; i < installments; i++) {
        const installmentDate = new Date(date);
        installmentDate.setMonth(installmentDate.getMonth() + i);

        const installmentTransaction = createTransaction(
            userId,
            type,
            `${description} (${i + 1}/${installments})`,
            amountPerInstallment,
            category,
            installmentDate,
            currency,
            installments,
            installmentGroupId,
            i + 1
        );

        transactions.push(installmentTransaction);
    }


    for (const transaction of transactions) {
        await repo.addTransaction(transaction);
    }

    return transactions[0]; // Return the first transaction
};
