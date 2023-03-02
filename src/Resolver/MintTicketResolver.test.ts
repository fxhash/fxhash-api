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
  await manager.query("DELETE FROM mint_ticket_settings")
  await manager.query("DELETE FROM mint_ticket")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("MintTicketResolver", () => {
  describe("field resolvers", () => {
    describe("token", () => {
      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)
        await mintTicketFactory(0, 0)
      })

      it("returns the correct token", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: Float!) { mintTicket(id: $id) { token { id } } }",
          variables: {
            id: 0,
          },
        })

        expect(result).toMatchObject({
          data: {
            mintTicket: {
              token: {
                id: "1-0",
              },
            },
          },
        })
      })
    })

    describe("settings", () => {
      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create the mint ticket settings
        await mintTicketSettingsFactory(0, { gracingPeriod: 999 })

        // create the mint ticket
        await mintTicketFactory(0, 0)
      })

      it("returns the correct settings", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: Float!) { mintTicket(id: $id) { settings { gracingPeriod } } }",
          variables: {
            id: 0,
          },
        })

        expect(result).toMatchObject({
          data: {
            mintTicket: {
              settings: {
                gracingPeriod: 999,
              },
            },
          },
        })
      })
    })

    describe("taxationPaidUntil", () => {
      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)
        await mintTicketFactory(0, 0, {
          price: 1000,
          taxationLocked: "196",
          taxationStart: new Date("2023-01-01T00:00:00.000Z"),
        })
      })

      it("returns the correct taxationPaidUntil", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: Float!) { mintTicket(id: $id) { taxationPaidUntil } }",
          variables: {
            id: 0,
          },
        })

        expect(result).toMatchObject({
          data: {
            mintTicket: {
              taxationPaidUntil: "2023-01-15T00:00:00.000Z",
            },
          },
        })
      })
    })
  })

  describe("mintTickets", () => {
    describe("filtering by createdAt_gt", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0)

        // create some mint tickets
        await mintTicketFactory(0, 0, { createdAt: new Date("2023-01-01") })
        await mintTicketFactory(1, 0, { createdAt: new Date("2023-01-02") })
        await mintTicketFactory(2, 0, { createdAt: new Date("2023-01-03") })

        result = await testServer.executeOperation({
          query:
            "query TestQuery($filters: MintTicketFilter) { mintTickets(filters: $filters) { id } }",
          variables: { filters: { createdAt_gt: "2023-01-01" } },
        })
      })

      it("returns the correct mint tickets", () => {
        expect(result).toMatchObject({
          data: {
            mintTickets: [
              {
                id: 1,
              },
              {
                id: 2,
              },
            ],
          },
        })
      })
    })
  })
})
