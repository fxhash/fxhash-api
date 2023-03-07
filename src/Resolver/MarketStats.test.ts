import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import { generativeTokenFactory, marketStatsFactory } from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"
import { offsetV3TokenId } from "../Scalar/TokenId"

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
  await manager.query("DELETE FROM market_stats")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("MarketStatsResolver", () => {
  describe("field resolvers", () => {
    describe("generativeToken", () => {
      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create market stats matching the generative token
        await marketStatsFactory(0, GenerativeTokenVersion.V3)
      })

      it("returns the correct objkt", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: TokenId!) { generativeToken(id: $id) { marketStats { generativeToken { id }}}}",
          variables: {
            id: offsetV3TokenId(0),
          },
        })

        expect(result).toMatchObject({
          data: {
            generativeToken: {
              marketStats: {
                generativeToken: {
                  id: offsetV3TokenId(0),
                },
              },
            },
          },
        })
      })
    })
  })
})
