import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  generativeTokenFactory,
  reserveFactory,
  userFactory,
} from "../tests/factories"
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
})

const cleanup = async () => {
  await manager.query("DELETE FROM reserve")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("UserResolver", () => {
  describe("field resolvers", () => {
    describe("reserves", () => {
      beforeAll(async () => {
        // create some generative tokens
        await generativeTokenFactory(0)
        await generativeTokenFactory(1)
        await generativeTokenFactory(2)

        // create a user
        await userFactory("tz1")

        // create some active reserves
        await reserveFactory(0, {
          amount: 10,
          data: { tz1: 1 },
        })
        await reserveFactory(1, {
          amount: 10,
          data: { tz1: 2 },
        })

        // create a reserve with amount = 0
        await reserveFactory(2, {
          amount: 0,
          data: { tz1: 0 },
        })

        // create a reserve for a different user
        await reserveFactory(2, {
          amount: 10,
          data: { tz2: 1 },
        })
      })

      it("returns the correct tokens", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($address: String!) { user(id: $address) { reserves { id } } }",
          variables: {
            address: "tz1",
          },
        })

        console.log(JSON.stringify(result))

        expect(result).toMatchObject({
          data: {
            user: {
              reserves: [
                {
                  id: 0,
                },
                {
                  id: 1,
                },
              ],
            },
          },
        })
      })
    })
  })
})
