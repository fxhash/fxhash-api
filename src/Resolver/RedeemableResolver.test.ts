import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import { generativeTokenFactory, redeemableFactory } from "../tests/factories"
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
  await manager.query("DELETE FROM redeemable")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("RedeemableResolver", () => {
  describe("field resolvers", () => {
    describe("token", () => {
      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create a redeemable matching the generative token
        await redeemableFactory(0, GenerativeTokenVersion.V3, {
          address: "KT1",
        })
      })

      it("returns the correct token", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($address: String!) { redeemable(address: $address) { token { id } } }",
          variables: {
            address: "KT1",
          },
        })

        console.log(result)

        expect(result).toMatchObject({
          data: {
            redeemable: {
              token: {
                id: "1-0",
              },
            },
          },
        })
      })
    })
  })
})
