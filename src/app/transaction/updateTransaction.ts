import { TransactionRepository } from "../../domain/transaction/transactionRepository";
import { Transaction } from "../../domain/transaction/transaction";

export const updateTransaction = async (
    repo: TransactionRepository,
    transaction: Transaction,
    updateStrategy: 'single' | 'all-installments' = 'single'
): Promise<void> => {
    if (updateStrategy === 'single' || !transaction.installmentGroupId) {
        return repo.updateTransaction(transaction);
    }

    // Handle updating all installments in the group
    const allTransactions = await repo.getTransactions();
    const groupTransactions = allTransactions.filter(
        t => t.installmentGroupId === transaction.installmentGroupId
    );

    const updates = groupTransactions.map(t => {
        // Update shared fields
        const updatedTransaction: Transaction = {
            ...t,
            category: transaction.category,
            description: transaction.description,
            amount: transaction.amount, // Assuming amount is per-installment and should be same for all
            currency: transaction.currency,
            // Date is NOT updated for all installments to preserve monthly spread
        };
        return repo.updateTransaction(updatedTransaction);
    });

    await Promise.all(updates);
};
