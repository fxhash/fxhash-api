import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  generativeTokenFactory,
  mintTicketFactory,
  mintTicketSettingsFactory,
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
  await manager.query("DELETE FROM mint_ticket")
  await manager.query("DELETE FROM mint_ticket_settings")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("MintTicketSettingsResolver", () => {
  describe("field resolvers", () => {
    describe("generativeToken", () => {
      beforeAll(async () => {
        await generativeTokenFactory(0)
        await mintTicketSettingsFactory(0)
        await mintTicketFactory(0, 0)
      })

      it("returns the correct token", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: Float!) { mintTicket(id: $id) { settings { generativeToken { id } } } }",
          variables: {
            id: 0,
          },
        })

        expect(result).toMatchObject({
          data: {
            mintTicket: {
              settings: {
                generativeToken: {
                  id: "1-0",
                },
              },
            },
          },
        })
      })
    })
  })
})
