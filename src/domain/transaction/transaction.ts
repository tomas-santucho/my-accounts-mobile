import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import 'react-native-get-random-values';

export const TransactionSchema = z.object({
    id: z.string().uuid(),
    userId: z.string(),
    type: z.enum(["income", "expense"]),
    description: z.string().min(1, "Description required"),
    amount: z.number().positive("Amount must be positive"),
    category: z.string().min(1, "Category required"),
    currency: z.enum(["ars", "usd"]),
    installments: z.number().int().positive().optional(),
    installmentGroupId: z.string().uuid().optional(),
    installmentNumber: z.number().int().positive().optional(),
    date: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional().nullable(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const createTransaction = (
    userId: string,
    type: "income" | "expense",
    description: string,
    amount: number,
    category: string,
    date: Date,
    currency: "ars" | "usd",
    installments?: number,
    installmentGroupId?: string,
    installmentNumber?: number
): Transaction => {
    const transaction = {
        id: uuidv4(),
        userId: userId,
        type,
        description,
        amount,
        category,
        currency,
        installments,
        installmentGroupId,
        installmentNumber,
        date,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return TransactionSchema.parse(transaction);
};
