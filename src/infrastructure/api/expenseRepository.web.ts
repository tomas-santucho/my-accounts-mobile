import {Expense} from "../../data/realm/schemas";
import {ExpenseRepository} from "../../domain/expense/expenseRepository";

const mockExpenses: Expense[] = [
    { _id: "1", title: "Home", planned: 1200, actual: 1150 },
    { _id: "2", title: "Utilities", planned: 250, actual: 280 },
    { _id: "3", title: "Food", planned: 600, actual: 650 },
    { _id: "4", title: "Delivery", planned: 150, actual: 120 },
    { _id: "5", title: "Shopping", planned: 300, actual: 420 },
];

export const createWebExpenseRepository = (): ExpenseRepository => ({
    save: async (expense: Expense) => {
        console.log("💾 Saving expense (web):", expense);
        await new Promise((r) => setTimeout(r, 300)); // simulate latency
    },

    findAll: async (): Promise<Expense[]> => {
        console.log("🌐 Fetching expenses from web mock");
        await new Promise((r) => setTimeout(r, 500));
        return mockExpenses;
    },

    findById: async (id: string): Promise<Expense | null> => {
        await new Promise((r) => setTimeout(r, 300));
        return mockExpenses.find((e) => e.id === id) ?? null;
    },
});
