import { Platform } from "react-native";
import Realm from "./realmWrapper";

// Type for web compatibility
export type Transaction = {
    id: string;
    userId: string;
    type: "income" | "expense";
    description: string;
    amount: number;
    category: string;
    currency: "ars" | "usd";
    installments?: number;
    date: Date;
    createdAt: Date;
}

// Realm class for mobile only
export const TransactionSchema = Platform.OS !== "web" ? class Transaction extends Realm.Object<Transaction> {
    id!: string;
    userId!: string;
    type!: "income" | "expense";
    description!: string;
    amount!: number;
    category!: string;
    currency!: "ars" | "usd";
    installments?: number;
    date!: Date;
    createdAt!: Date;

    static readonly schema: Realm.ObjectSchema = {
        name: "Transaction",
        properties: {
            id: "string",
            userId: "string",
            type: "string",
            description: "string",
            amount: "double",
            category: "string",
            currency: "string",
            installments: "int?",
            date: "date",
            createdAt: "date",
        },
        primaryKey: "id",
    }
} : null;
