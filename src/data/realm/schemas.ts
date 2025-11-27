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
    installmentGroupId?: string; // Groups related installment transactions
    installmentNumber?: number; // Which installment this is (1/12, 2/12, etc.)
    date: Date;
    createdAt: Date;
}

export type Category = {
    id: string;
    name: string;
    icon: string;
    type: "income" | "expense";
    color?: string;
    isDefault?: boolean;
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
    installmentGroupId?: string;
    installmentNumber?: number;
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
            installmentGroupId: "string?",
            installmentNumber: "int?",
            date: "date",
            createdAt: "date",
        },
        primaryKey: "id",
    }
} : null;

export const CategorySchema = Platform.OS !== "web" ? class Category extends Realm.Object<Category> {
    id!: string;
    name!: string;
    icon!: string;
    type!: "income" | "expense";
    color?: string;
    isDefault?: boolean;

    static readonly schema: Realm.ObjectSchema = {
        name: "Category",
        properties: {
            id: "string",
            name: "string",
            icon: "string",
            type: "string",
            color: "string?",
            isDefault: "bool?",
        },
        primaryKey: "id",
    }
} : null;
