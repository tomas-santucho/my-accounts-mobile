import { Platform } from "react-native"
import { apiClient } from "../data/rest/apiClient"
import { Expense, ExpenseSchema } from "../data/realm/schemas"
import Realm from "../data/realm/realmWrapper"
import {addExpense} from "../app/expense/addExpense";

export type ExpenseInput = {
  title: string
  amount: number
}

export async function saveExpense(expense: ExpenseInput) {
  if (Platform.OS === "web") {
    // hit backend
    await apiClient.post("/expenses", expense)
    return
  }

  // local Realm
  const realm = await Realm.open({ schema: [ExpenseSchema] })
  realm.write(() => {
    realm.create("Expense", {
      _id: new Realm.BSON.ObjectId(),
      ...expense,
      date: new Date(),
    })
  })
  realm.close()
}

export async function getExpenses(): Promise<Expense[]> {
  if (Platform.OS === "web") {
    // hit backend
    // const response = await apiClient.get("/expenses")
    // return response.data
    return []
  }

  // local Realm
  const realm = await Realm.open({ schema: [ExpenseSchema] })
  const expenses = realm.objects<Expense>("Expense")
  const expensesArray = Array.from(expenses)
  realm.close()
  return expensesArray
}

export async function clearExpenses() {
  if (Platform.OS === "web") {
    // hit backend
    await apiClient.post("/expenses/clear", {})
    return
  }

  // local Realm
  const realm = await Realm.open({ schema: [ExpenseSchema] })
  realm.write(() => {
    const all = realm.objects("Expense")
    realm.delete(all)
  })
  realm.close()
}
