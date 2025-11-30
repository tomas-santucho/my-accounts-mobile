import { budgetRepository } from '../infrastructure/repositories/budgetRepository';
import { Budget, createBudget } from '../domain/budget/budget';

export const budgetService = {
    async getBudgetsForMonth(month: number, year: number): Promise<Budget[]> {
        return await budgetRepository.getBudgets(month, year);
    },

    async setBudget(
        categoryId: string,
        month: number,
        year: number,
        amount: number,
        currency: "ars" | "usd"
    ): Promise<Budget> {
        const budget = createBudget(categoryId, month, year, amount, currency);
        await budgetRepository.saveBudget(budget);
        return budget;
    }
};
