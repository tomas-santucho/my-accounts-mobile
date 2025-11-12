import { z } from "zod";

export const ExpenseSchema = z.object({
    _id: z.string(),
    title: z.string().min(1, "Title required"),
    amount: z.number().positive("Amount must be positive"),
    date: z.date(),
});

export const ExpenseRealmSchema: Realm.ObjectSchema = {
    name: "Expense",
    primaryKey: "_id",
    properties: {
        _id: "objectId",
        title: "string",
        amount: "double",
        date: "date",
    },
};

export type Expense = z.infer<typeof ExpenseSchema>;

export const createExpense = (title: string, amount: number): Expense => {
    const expense = {
        _id: crypto.randomUUID(),
        title,
        amount,
        date: new Date(),
    };

    // runtime validation — ensures even if inputs come from unsafe places, domain stays consistent
    return ExpenseSchema.parse(expense);
};