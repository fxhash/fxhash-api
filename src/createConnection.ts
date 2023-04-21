import {
  getConnectionOptions,
  createConnection as createTypeormConnection,
} from "typeorm"

export const createConnection = async () => {
  const opts = await getConnectionOptions(
    process.env.NODE_ENV === "test" ? "test" : "default"
  )
  return createTypeormConnection({ ...opts, name: "default" })
}
