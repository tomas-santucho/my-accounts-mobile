import { Platform } from "react-native"
import { TransactionSchema } from "./schemas"

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
  return await Realm.open({ schema: [TransactionSchema] })
}
