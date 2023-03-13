import { ApolloServer } from "apollo-server"
import { Connection, EntityManager } from "typeorm"
import { createTestServer } from "../tests/apollo"
import {
  articleFactory,
  articleMentionFactory,
  generativeTokenFactory,
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
  await manager.query("DELETE FROM article_generative_token")
  await manager.query("DELETE FROM article")
  await manager.query("DELETE FROM generative_token")
}

beforeAll(cleanup)
afterEach(cleanup)

describe("ArticleGenerativeTokenResolver", () => {
  describe("field resolvers", () => {
    describe("generativeToken", () => {
      beforeAll(async () => {
        // create an article
        await articleFactory(0)

        // create a generative token
        await generativeTokenFactory(0, GenerativeTokenVersion.V3)

        // create a mention matching the generative token
        await articleMentionFactory(0, 0, GenerativeTokenVersion.V3)
      })

      it("returns the correct token", async () => {
        const result = await testServer.executeOperation({
          query:
            "query TestQuery($id: Int) { article(id: $id) { generativeTokenMentions { generativeToken { id } } } }",
          variables: {
            id: 0,
          },
        })

        expect(result).toMatchObject({
          data: {
            article: {
              generativeTokenMentions: [
                {
                  generativeToken: {
                    id: 0,
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
