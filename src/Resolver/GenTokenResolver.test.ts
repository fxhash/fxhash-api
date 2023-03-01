import { ApolloServer } from "apollo-server"
import { Connection, createConnection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"

let testServer: ApolloServer

let manager: EntityManager
let connection: Connection

beforeAll(async () => {
  connection = await createConnection()
  manager = new EntityManager(connection)
  testServer = await createTestServer()
})

afterAll(() => {
  connection.close()
  // sandbox.restore()
})

const cleanup = async () => {
  await manager.query("DELETE FROM codex")
  await manager.query("DELETE FROM split")
  await manager.query("DELETE FROM action")
  await manager.query("DELETE FROM generative_token")
}

describe("GenTokenResolver", () => {
  it("does stuff", async () => {
    const response = await testServer.executeOperation({
      query: "query SayHelloWorld($name: String) { hello(name: $name) }",
      variables: { name: "world" },
    })

    console.log(response)
  })
})
