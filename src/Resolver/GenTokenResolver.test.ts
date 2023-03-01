import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { createTestServer } from "../tests/apollo"
import { codexFactory, generativeTokenFactory } from "../tests/factories"
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
}

afterEach(cleanup)

describe("GenTokenResolver", () => {
  describe("actions", () => {})

  describe("generativeToken", () => {
    describe("using legacy id", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)

        result = await testServer.executeOperation({
          query:
            "query TestQuery($id: TokenId!) { generativeToken(id: $id) { id } }",
          variables: { id: 0 },
        })
      })

      it("returns a generative token", () => {
        expect(result).toMatchObject({
          data: {
            generativeToken: {
              id: "0-0",
            },
          },
        })
      })
    })

    describe("using TokenId", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        result = await testServer.executeOperation({
          query:
            "query TestQuery($id: TokenId!) { generativeToken(id: $id) { id } }",
          variables: { id: "1-0" },
        })
      })

      it("returns a generative token", () => {
        expect(result).toMatchObject({
          data: {
            generativeToken: {
              id: "1-0",
            },
          },
        })
      })
    })
  })

  describe("generativeTokens", () => {
    describe("filtering by id", () => {
      let result

      beforeAll(async () => {
        await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)
        await generativeTokenFactory(1, GenerativeTokenVersion.V3)

        result = await testServer.executeOperation({
          query:
            "query TestQuery($ids: [TokenId!]!) { generativeTokens(filters: { id_in: $ids }) { id } }",
          // use mix of legacy and TokenId
          variables: { ids: [0, "1-0", "1-1"] },
        })
      })

      it("returns the correct generative tokens", () => {
        expect(result).toMatchObject({
          data: {
            generativeTokens: [
              {
                id: "1-1",
              },
              {
                id: "1-0",
              },
              {
                id: "0-0",
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
              id: expect.any(String),
            },
          },
        })
      })
    })
  })
})
