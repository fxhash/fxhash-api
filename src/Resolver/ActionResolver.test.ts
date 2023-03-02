import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  actionFactory,
  generativeTokenFactory,
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
  await manager.query("DELETE FROM action")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("ActionResolver", () => {
  describe("field resolvers", () => {
    describe("token", () => {
      let actionId

      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create an action matching the generative token
        const action = await actionFactory({
          tokenId: 0,
          tokenVersion: GenerativeTokenVersion.V3,
        })
        actionId = action.id
      })

      it("returns actions with the correct token", async () => {
        const result = await testServer.executeOperation({
          query: "query TestQuery { actions { token { id } } }",
          variables: {},
        })

        expect(result).toMatchObject({
          data: {
            actions: [
              {
                token: {
                  id: "1-0",
                },
              },
            ],
          },
        })
      })
    })

    describe("objkt", () => {
      let actionId

      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create an objkt
        await objktFactory(0, GenerativeTokenVersion.V3)

        // create an action matching the generative token
        const action = await actionFactory({
          objktId: 0,
          objktIssuerVersion: GenerativeTokenVersion.V3,
        })
        actionId = action.id
      })

      it("returns actions with the correct objkt", async () => {
        const result = await testServer.executeOperation({
          query: "query TestQuery { actions { objkt { id } } }",
          variables: {},
        })

        console.log(result)

        expect(result).toMatchObject({
          data: {
            actions: [
              {
                objkt: {
                  id: "1-0",
                },
              },
            ],
          },
        })
      })
    })
  })
})
