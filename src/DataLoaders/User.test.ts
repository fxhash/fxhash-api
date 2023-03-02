import { Connection, EntityManager } from "typeorm"

import {
  actionFactory,
  generativeTokenFactory,
  marketStatsFactory,
  userFactory,
} from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"
import { createMarketStatsGenTokLoader } from "./MarketStats"
import {
  createUsersGenerativeTokensLoader,
  createUsersSalesLoader,
} from "./User"
import { TokenActionType } from "../Entity/Action"

let manager: EntityManager
let connection: Connection

beforeAll(async () => {
  connection = await createConnection()
  manager = new EntityManager(connection)
})

afterAll(() => {
  connection.close()
  // sandbox.restore()
})

const cleanup = async () => {
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("User dataloaders", () => {
  let dataloader

  describe("createUsersGenerativeTokensLoader", () => {
    beforeAll(async () => {
      dataloader = createUsersGenerativeTokensLoader()

      // create some users
      const user = await userFactory("tz1")
      const user2 = await userFactory("tz2")

      // create some tokens
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3, {
        authorId: user.id,
      })
      await generativeTokenFactory(0, GenerativeTokenVersion.V3, {
        authorId: user.id,
      })
      await generativeTokenFactory(1, GenerativeTokenVersion.V3, {
        authorId: user2.id,
      })
    })

    it("should return the correct generative tokens", async () => {
      const result = await dataloader.loadMany([{ id: "tz1" }, { id: "tz2" }])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        [
          {
            id: 0,
            version: "V3",
          },
          {
            id: 0,
            version: "PRE_V3",
          },
        ],
        [
          {
            id: 1,
            version: "V3",
          },
        ],
      ])
    })
  })

  describe("createUsersSalesLoader", () => {
    beforeAll(async () => {
      dataloader = createUsersSalesLoader()

      // create some users
      const user = await userFactory("tz1")
      const user2 = await userFactory("tz2")

      // create some tokens
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3, {
        authorId: user.id,
      })
      await generativeTokenFactory(0, GenerativeTokenVersion.V3, {
        authorId: user.id,
      })
      await generativeTokenFactory(1, GenerativeTokenVersion.V3, {
        authorId: user2.id,
      })

      // create some sale actions
      await actionFactory({
        tokenId: 0,
        tokenVersion: GenerativeTokenVersion.PRE_V3,
        type: TokenActionType.LISTING_V1_ACCEPTED,
      })
      await actionFactory({
        tokenId: 0,
        tokenVersion: GenerativeTokenVersion.V3,
        type: TokenActionType.LISTING_V2_ACCEPTED,
      })
      await actionFactory({
        tokenId: 1,
        tokenVersion: GenerativeTokenVersion.V3,
        type: TokenActionType.LISTING_V2_ACCEPTED,
      })
    })

    it("should return actions for the correct tokens", async () => {
      const result = await dataloader.loadMany([
        { id: "tz1", skip: 0, take: 10 },
      ])
      expect(result).toHaveLength(1)
      expect(result).toMatchObject([
        [
          {
            tokenId: 0,
            tokenVersion: "V3",
          },
          {
            tokenId: 0,
            tokenVersion: "PRE_V3",
          },
        ],
      ])
    })
  })
})