import { Connection, EntityManager } from "typeorm"

import { generativeTokenFactory, marketStatsFactory } from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"
import { createMarketStatsGenTokLoader } from "./MarketStats"

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

const seedTokens = async () => {
  await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
  await generativeTokenFactory(0, GenerativeTokenVersion.V3)
  await generativeTokenFactory(1, GenerativeTokenVersion.V3)
}

describe("MarketStats dataloaders", () => {
  let dataloader

  describe("createMarketStatsGenTokLoader", () => {
    beforeAll(async () => {
      dataloader = createMarketStatsGenTokLoader()

      await seedTokens()

      // create some market stats
      await marketStatsFactory(0, GenerativeTokenVersion.PRE_V3)
      await marketStatsFactory(1, GenerativeTokenVersion.V3)
    })

    it("should return the correct generative tokens", async () => {
      const result = await dataloader.loadMany([
        { id: 0, version: "PRE_V3" },
        { id: 1, version: "V3" },
      ])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        {
          id: 0,
          version: "PRE_V3",
        },
        {
          id: 1,
          version: "V3",
        },
      ])
    })
  })
})
