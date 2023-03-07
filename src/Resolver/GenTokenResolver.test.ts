import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import { actionFactory, generativeTokenFactory } from "../tests/factories"
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
  await manager.query("DELETE FROM generative_token")
  await manager.query("DELETE FROM codex")
  await manager.query("DELETE FROM action")
}

afterEach(cleanup)

describe("GenTokenResolver", () => {
  describe("field resolvers", () => {
    describe("actions", () => {
      let result
      let expectedIds

      beforeAll(async () => {
        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create some actions matching the generative token
        const action1 = await actionFactory({
          tokenId: 0,
        })
        const action2 = await actionFactory({
          tokenId: 0,
        })
        const action3 = await actionFactory({
          tokenId: 0,
        })

        expectedIds = [action3.id, action2.id, action1.id]

        // create some actions for a different token
        await generativeTokenFactory(1, GenerativeTokenVersion.PRE_V3)
        await actionFactory({
          tokenId: 1,
          tokenVersion: GenerativeTokenVersion.PRE_V3,
        })
        await actionFactory({
          tokenId: 1,
          tokenVersion: GenerativeTokenVersion.PRE_V3,
        })

        result = await testServer.executeOperation({
          query:
            "query TestQuery($id: Float!) { generativeToken(id: $id) { actions { id } } }",
          variables: { id: 0 },
        })
      })

      it("returns the correct actions", () => {
        expect(result).toMatchObject({
          data: {
            generativeToken: {
              actions: expectedIds.map(id => ({ id })),
            },
          },
        })
      })
    })
  })

  describe("generativeToken", () => {
    let result

    beforeAll(async () => {
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)

      result = await testServer.executeOperation({
        query:
          "query TestQuery($id: Float!) { generativeToken(id: $id) { id } }",
        variables: { id: 0 },
      })
    })

    it("returns a generative token", () => {
      expect(result).toMatchObject({
        data: {
          generativeToken: {
            id: 0,
          },
        },
      })
    })
  })

  describe("generativeTokens", () => {
    describe("filtering by id", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
        await generativeTokenFactory(1, GenerativeTokenVersion.V3)
        await generativeTokenFactory(2, GenerativeTokenVersion.V3)

        result = await testServer.executeOperation({
          query:
            "query TestQuery($ids: [Int!]!) { generativeTokens(filters: { id_in: $ids }) { id } }",
          variables: { ids: [0, 1, 2] },
        })
      })

      it("returns the correct generative tokens", () => {
        expect(result).toMatchObject({
          data: {
            generativeTokens: [
              {
                id: 2,
              },
              {
                id: 1,
              },
              {
                id: 0,
              },
            ],
          },
        })
      })
    })
  })

  describe("randomGenerativeToken", () => {
    describe("when there are no generative tokens", () => {
      let result

      beforeAll(async () => {
        result = await testServer.executeOperation({
          query: "query TestQuery { randomGenerativeToken { id } }",
        })
      })

      it("returns null", () => {
        expect(result).toMatchObject({
          data: {
            randomGenerativeToken: null,
          },
        })
      })
    })

    describe("when there are generative tokens", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)
        await generativeTokenFactory(1, GenerativeTokenVersion.V3)

        result = await testServer.executeOperation({
          query: "query TestQuery { randomGenerativeToken { id } }",
        })
      })

      it("returns a random generative token", () => {
        expect(result).toMatchObject({
          data: {
            randomGenerativeToken: {
              id: expect.any(Number),
            },
          },
        })
      })
    })
  })
})
