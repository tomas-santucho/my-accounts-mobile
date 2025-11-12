import Realm from "realm"
import { ExpenseRepository } from "../../domain/expense/expenseRepository"
import { Expense, ExpenseSchema } from "../../domain/expense/expense"
import { openRealm } from "../../data/realm/realm"

export const realmExpenseRepo = (): ExpenseRepository => ({
    async save(expense: Expense) {
        const realm = await openRealm()

        realm.write(() => {
            realm.create("Expense", {
                _id: new Realm.BSON.ObjectId(),
                title: expense.title,
                amount: expense.amount,
                date: expense.date ?? new Date(),
            })
        })

        realm.close()
    },

    async findAll() {
        const realm = await openRealm()
        const results = realm.objects<any>("Expense")

        const data = results.map((r) =>
            ExpenseSchema.parse({
                _id: r._id.toHexString(),
                title: r.title,
                amount: r.amount,
                date: new Date(r.date),
            }),
        )

        realm.close()
        return data
    },

    async findById(id: string) {
        const realm = await openRealm()
        const obj = realm.objectForPrimaryKey<any>("Expense", new Realm.BSON.ObjectId(id))

        if (!obj) {
            realm.close()
            return null
        }

        const expense = ExpenseSchema.parse({
            _id: obj._id.toHexString(),
            title: obj.title,
            amount: obj.amount,
            date: new Date(obj.date),
        })

        realm.close()
        return expense
    },
})
