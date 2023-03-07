import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import { generativeTokenFactory, objktFactory } from "../tests/factories"
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
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("ObjktResolver", () => {
  describe("objkts", () => {
    describe("filtering by issuer_in", () => {
      let result

      beforeAll(async () => {
        // create some generative tokens
        await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)
        await generativeTokenFactory(1, GenerativeTokenVersion.V3)

        // create some objkts matching the ids we'll use in the query
        await objktFactory(0, GenerativeTokenVersion.PRE_V3)
        await objktFactory(0, GenerativeTokenVersion.V3)

        // and an objkt with a different issuer
        await objktFactory(1, GenerativeTokenVersion.V3, { tokenId: 1 })

        result = await testServer.executeOperation({
          query:
            "query TestQuery($ids: [TokenId!]!) { objkts(filters: { issuer_in: $ids }) { id } }",
          // use mix of legacy and v3 ids
          variables: { ids: [0, 26000] },
        })
      })

      it("returns the correct objkts", () => {
        expect(result).toMatchObject({
          data: {
            objkts: [
              {
                id: "FX1-0",
              },
              {
                id: "FX2-0",
              },
            ],
          },
        })
      })
    })
  })
})
