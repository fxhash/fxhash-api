import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  actionFactory,
  generativeTokenFactory,
  objktFactory,
  redeemableFactory,
  userFactory,
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
  await manager.query("DELETE FROM redeemable")
  await manager.query("DELETE FROM objkt")
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

    describe("filtering by fxparams", () => {
      let result

      describe("when fxparams is true", () => {
        beforeAll(async () => {
          // create a token without params
          await generativeTokenFactory(0, GenerativeTokenVersion.V3, {
            inputBytesSize: 0,
          })
          // create a token with params
          await generativeTokenFactory(1, GenerativeTokenVersion.V3, {
            inputBytesSize: 7,
          })

          result = await testServer.executeOperation({
            query:
              "query TestQuery { generativeTokens(filters: { fxparams_eq: true }) { id } }",
            variables: {},
          })
        })

        it("returns the correct generative tokens", () => {
          expect(result).toMatchObject({
            data: {
              generativeTokens: [
                {
                  id: 1,
                },
              ],
            },
          })
        })
      })

      describe("when fxparams is false", () => {
        beforeAll(async () => {
          // create a token without params
          await generativeTokenFactory(0, GenerativeTokenVersion.V3, {
            inputBytesSize: 0,
          })
          // create a token with params
          await generativeTokenFactory(1, GenerativeTokenVersion.V3, {
            inputBytesSize: 7,
          })

          result = await testServer.executeOperation({
            query:
              "query TestQuery { generativeTokens(filters: { fxparams_eq: false }) { id } }",
            variables: {},
          })
        })

        it("returns the correct generative tokens", () => {
          expect(result).toMatchObject({
            data: {
              generativeTokens: [
                {
                  id: 0,
                },
              ],
            },
          })
        })
      })
    })
  })

  describe("filtering by redeemable", () => {
    let result

    describe("when redeemable is true", () => {
      beforeAll(async () => {
        // create a normal token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create a token with a redeemable
        await generativeTokenFactory(1, GenerativeTokenVersion.V3)
        await redeemableFactory(1)

        result = await testServer.executeOperation({
          query:
            "query TestQuery { generativeTokens(filters: { redeemable_eq: true }) { id } }",
          variables: {},
        })
      })

      it("returns the correct generative tokens", () => {
        expect(result).toMatchObject({
          data: {
            generativeTokens: [
              {
                id: 1,
              },
            ],
          },
        })
      })
    })

    describe("when redeemable is false", () => {
      beforeAll(async () => {
        // create a normal token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create a token with a redeemable
        await generativeTokenFactory(1, GenerativeTokenVersion.V3)
        await redeemableFactory(1)

        result = await testServer.executeOperation({
          query:
            "query TestQuery { generativeTokens(filters: { redeemable_eq: false }) { id } }",
          variables: {},
        })
      })

      it("returns the correct generative tokens", () => {
        expect(result).toMatchObject({
          data: {
            generativeTokens: [
              {
                id: 0,
              },
            ],
          },
        })
      })
    })
  })

  describe("filtering by labels", () => {
    let result

    beforeAll(async () => {
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
      await generativeTokenFactory(1, GenerativeTokenVersion.PRE_V3, {
        labels: [1, 2],
      })
      await generativeTokenFactory(2, GenerativeTokenVersion.V3, {
        labels: [1],
      })
      await generativeTokenFactory(3, GenerativeTokenVersion.V3, {
        labels: [1, 3],
      })

      result = await testServer.executeOperation({
        query:
          "query TestQuery($labels: [Int!]) { generativeTokens(filters: { labels_in: $labels }) { id } }",
        variables: { labels: [1] },
      })
    })

    it("returns the correct generative tokens", () => {
      expect(result).toMatchObject({
        data: {
          generativeTokens: [
            {
              id: 3,
            },
            {
              id: 2,
            },
            {
              id: 1,
            },
          ],
        },
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

  describe("isHolder", () => {
    describe("when the user is not a holder", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        result = await testServer.executeOperation({
          query: `query TestQuery { generativeToken(id: 0) { isHolder(userId: "tz1") } }`,
        })
      })

      it("returns false", () => {
        expect(result).toMatchObject({
          data: {
            generativeToken: {
              isHolder: false,
            },
          },
        })
      })
    })

    describe("when the user is a holder", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)
        await userFactory("tz1")
        await objktFactory(0, GenerativeTokenVersion.V3, {
          tokenId: 0,
          ownerId: "tz1",
        })

        result = await testServer.executeOperation({
          query: `query TestQuery { generativeToken(id: 0) { isHolder(userId: "tz1") } }`,
        })
      })

      it("returns true", () => {
        expect(result).toMatchObject({
          data: {
            generativeToken: {
              isHolder: true,
            },
          },
        })
      })
    })
  })
})
