import { Platform } from "react-native"
import { TransactionSchema, CategorySchema } from "./schemas"

let Realm: any
if (Platform.OS !== "web") {
  Realm = require("realm")
} else {
  console.warn("Realm not supported on web")
}

export const openRealm = async () => {
  if (Platform.OS === "web") {
    throw new Error("Realm not supported on web")
  }
  return await Realm.open({
    schema: [TransactionSchema, CategorySchema],
    schemaVersion: 4, // Incremented for CategorySchema sync fields
    migration: (_oldRealm: any, _newRealm: any) => {
      // No data transformation needed - new fields are optional
      // Realm will automatically add the new properties
    }
  })
}
