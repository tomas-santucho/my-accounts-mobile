import { Platform } from "react-native"
import Realm from "./realmWrapper"

// Type for web compatibility
export type Expense = {
  _id: any
  title: string
  amount: number
  date: Date
}

// Realm class for mobile only
export const ExpenseSchema = Platform.OS !== "web" ? class Expense extends Realm.Object<Expense> {
  _id!: any
  title!: string
  amount!: number
  date!: Date

  static readonly schema = {
    name: "Expense",
    properties: {
      _id: "objectId",
      title: "string",
      amount: "double",
      date: "date",
    },
    primaryKey: "_id",
  }
} : null
