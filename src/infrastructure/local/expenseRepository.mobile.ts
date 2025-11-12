import Realm from "realm";
import {ExpenseRepository} from "../../domain/expense/expenseRepository";
import {ExpenseRealmSchema, Expense, ExpenseSchema} from "../../domain/expense/expense";


export const createMobileExpenseRepository = (): ExpenseRepository => {
    let realm: Realm | null = null;

    // Open realm lazily
    const openRealm = async (): Promise<Realm> => {
        if (!realm || realm.isClosed) {
            realm = await Realm.open({ schema: [ExpenseRealmSchema] });
        }
        return realm;
    };

    const validateExpense = (data: unknown): Expense => {
        const parsed = ExpenseSchema.safeParse(data);
        if (!parsed.success) throw new Error("Invalid expense data");
        return parsed.data;
    };

    return {
        save: async (expense: Expense): Promise<void> => {
            const validExpense = validateExpense(expense);
            const db = await openRealm();

            db.write(() => {
                db.create(
                    "Expense",
                    {
                        _id: new Realm.BSON.ObjectId(validExpense._id),
                        title: validExpense.title,
                        amount: validExpense.amount,
                        date: validExpense.date,
                    },
                    Realm.UpdateMode.Modified
                );
            });
        },

        findAll: async (): Promise<Expense[]> => {
            const db = await openRealm();
            const results = db.objects<any>("Expense");
            // Realm objects are live — clone them to plain JS
            const plain = results.map((e) => ({
                _id: e._id.toHexString(),
                title: e.title,
                amount: e.amount,
                date: new Date(e.date),
            }));

            return plain;
        },

        findById: async (id: string): Promise<Expense | null> => {
            const db = await openRealm();
            const expense = db.objectForPrimaryKey<any>("Expense", new Realm.BSON.ObjectId(id));
            return expense
                ? {
                    _id: expense._id.toHexString(),
                    title: expense.title,
                    amount: expense.amount,
                    date: new Date(expense.date),
                }
                : null;
        },
    };
};
