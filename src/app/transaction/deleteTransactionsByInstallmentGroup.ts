import { TransactionRepository } from "../../domain/transaction/transactionRepository";

export const deleteTransactionsByInstallmentGroup = (
    repo: TransactionRepository,
    installmentGroupId: string
) => {
    return repo.deleteTransactionsByInstallmentGroup(installmentGroupId);
};
