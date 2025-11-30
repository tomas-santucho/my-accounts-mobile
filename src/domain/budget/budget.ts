import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import 'react-native-get-random-values';

export const BudgetSchema = z.object({
    id: z.string().uuid(),
    categoryId: z.string(),
    month: z.number().int().min(0).max(11),
    year: z.number().int().min(2000),
    amount: z.number().min(0),
    currency: z.enum(["ars", "usd"]),
    updatedAt: z.date(),
});

export type Budget = z.infer<typeof BudgetSchema>;

export const createBudget = (
    categoryId: string,
    month: number,
    year: number,
    amount: number,
    currency: "ars" | "usd"
): Budget => {
    const budget = {
        id: uuidv4(),
        categoryId,
        month,
        year,
        amount,
        currency,
        updatedAt: new Date(),
    };

    return BudgetSchema.parse(budget);
};
