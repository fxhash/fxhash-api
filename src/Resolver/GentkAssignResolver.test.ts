import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  generativeTokenFactory,
  gentkAssignFactory,
  objktFactory,
} from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"

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
  await manager.query("DELETE FROM gentk_assign")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("GentkAssignResolver", () => {
  describe("field resolvers", () => {
    describe("gentkId", () => {
      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create an objkt
        await objktFactory(0, GenerativeTokenVersion.V3)

        // create a gentk assign matching the objkt
        await gentkAssignFactory(0, GenerativeTokenVersion.V3)
      })

      it("returns the serialized token id", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: TokenId!) { statusGentkAssignation(id: $id) { gentkId } }",
          variables: {
            id: "1-0",
          },
        })

        expect(result).toMatchObject({
          data: {
            statusGentkAssignation: {
              gentkId: "1-0",
            },
          },
        })
      })
    })
  })
})
