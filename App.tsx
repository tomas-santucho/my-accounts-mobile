import { useEffect, useState } from "react"
import { View, Text, Button, StyleSheet, FlatList, TextInput } from "react-native"
import { Expense } from "./src/data/realm/schemas"
import {
  clearExpenses as clearExpensesService,
  getExpenses,
  saveExpense,
} from "./src/services/expenseService"
import FinanceHeader from "./src/ui/lib/FinanceHeader";
import FinanceSummaryScreen from "./src/ui/screens/FinanceSummaryScreen";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    const allExpenses = await getExpenses()
    setExpenses(allExpenses)
  }

  // add a new expense
  const addExpense = async () => {
    if (!title || !amount) return

    await saveExpense({
      title,
      amount: parseFloat(amount),
    })

    setTitle("")
    setAmount("")
    await loadExpenses()
  }

  // delete all (for testing)
  const clearExpenses = async () => {
    await clearExpensesService()
    setExpenses([])
  }

  return (
    <View style={styles.container}>
      <FinanceSummaryScreen/>

      <TextInput
        placeholder="Expense name"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <View style={styles.buttonRow}>
        <Button title="Add Expense" onPress={addExpense} />
        <Button title="Clear All" color="red" onPress={clearExpenses} />
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id?.toHexString?.() || item._id?.toString() || String(item._id)}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.expenseText}>
              {item.title} — ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.expenseDate}>{item.date.toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#111",
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#222",
    color: "white",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  expenseItem: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  expenseText: {
    color: "white",
    fontSize: 16,
  },
  expenseDate: {
    color: "#888",
    fontSize: 12,
  },
})
