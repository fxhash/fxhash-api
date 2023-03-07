import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  generativeTokenFactory,
  objktFactory,
  offerFactory,
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
  await manager.query("DELETE FROM offer")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("OfferResolver", () => {
  describe("field resolvers", () => {
    describe("objkt", () => {
      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create an objkt
        await objktFactory(0, GenerativeTokenVersion.V3)

        // create an offer matching the objkt
        await offerFactory(0, 0, GenerativeTokenVersion.V3)
      })

      it("returns the correct objkt", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: ObjktId!) { objkt(id: $id) { offers { objkt { id }}}}",
          variables: {
            id: "FX2-0",
          },
        })

        expect(result).toMatchObject({
          data: {
            objkt: {
              offers: [
                {
                  objkt: {
                    id: "FX2-0",
                  },
                },
              ],
            },
          },
        })
      })
    })
  })
})
