import { TransactionRepository } from "../../domain/transaction/transactionRepository";
import { Transaction } from "../../domain/transaction/transaction";
import { fetchAuthSession } from 'aws-amplify/auth';
import * as Sentry from '@sentry/react-native';

const API_URL = `${process.env["EXPO_PUBLIC_API_URL"]}api/transactions`;

const getAuthHeaders = async () => {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const createWebTransactionRepository = (): TransactionRepository => ({
    async getTransactions(): Promise<Transaction[]> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(API_URL, {
                headers
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.statusText}`);
            }
            const data = await response.json();
            // Ensure dates are parsed correctly
            return data.map((t: any) => ({
                ...t,
                date: new Date(t.date),
                createdAt: new Date(t.createdAt)
            }));
        } catch (error) {
            console.error(`Error fetching transactions. Ensure backend is running at ${process.env["EXPO_PUBLIC_API_URL"]} and CORS is configured.`, error);
            Sentry.captureException(error);
            return [];
        }
    },

    async getTransaction(id: string): Promise<Transaction | null> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/${id}`, {
                headers
            });
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch transaction: ${response.statusText}`);
            }
            const t = await response.json();
            return {
                ...t,
                date: new Date(t.date),
                createdAt: new Date(t.createdAt)
            };
        } catch (error) {
            console.error(`Error fetching transaction ${id}:`, error);
            Sentry.captureException(error);
            return null;
        }
    },

    async addTransaction(transaction: Transaction): Promise<void> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(API_URL, {
                method: "POST",
                headers,
                body: JSON.stringify(transaction),
            });
            if (!response.ok) {
                throw new Error(`Failed to add transaction: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
            Sentry.captureException(error);
            throw error;
        }
    },

    async updateTransaction(transaction: Transaction): Promise<void> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/${transaction.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(transaction),
            });
            if (!response.ok) {
                throw new Error(`Failed to update transaction: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
            Sentry.captureException(error);
            throw error;
        }
    },

    async deleteTransaction(id: string): Promise<void> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers
            });
            if (!response.ok) {
                throw new Error(`Failed to delete transaction: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Sentry.captureException(error);
            throw error;
        }
    },

    async deleteTransactionsByInstallmentGroup(installmentGroupId: string): Promise<void> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/installment-group/${installmentGroupId}`, {
                method: "DELETE",
                headers
            });
            if (!response.ok) {
                throw new Error(`Failed to delete installment group: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting installment group:", error);
            Sentry.captureException(error);
            throw error;
        }
    },
});
