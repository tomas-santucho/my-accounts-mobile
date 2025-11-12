import { Platform } from "react-native"

let Realm: any
if (Platform.OS !== "web") {
  Realm = require("realm")
} else {
  console.warn("Realm not supported on web, using mock.")
  Realm = class {
    static open() {
      return Promise.resolve({
        write: () => {},
        objects: () => [],
        create: () => {},
        delete: () => {},
        close: () => {},
      })
    }
    static BSON = {
      ObjectId: class {
        toHexString() {
          return ""
        }
      },
    }
  }
}

export default Realm
