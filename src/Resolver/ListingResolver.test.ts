import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  generativeTokenFactory,
  listingFactory,
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
  await manager.query("DELETE FROM listing")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("ListingResolver", () => {
  describe("field resolvers", () => {
    describe("objkt", () => {
      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create an objkt
        await objktFactory(0, GenerativeTokenVersion.V3)

        // create a listing matching the objkt
        await listingFactory(0, 0, GenerativeTokenVersion.V3)
      })

      it("returns the correct objkt", async () => {
        const result = await testServer.executeOperation({
          query: "query TestQuery { listings { objkt { id }}}",
          variables: {},
        })

        expect(result).toMatchObject({
          data: {
            listings: [
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
