import { Connection, EntityManager } from "typeorm"
import { createConnection } from "../../createConnection"
import { generativeTokenFactory, reserveFactory } from "../../tests/factories"
import { GenerativeTokenVersion } from "../../types/GenerativeToken"
import { GenerativeToken } from "../../Entity/GenerativeToken"
import { generativeQueryFilter } from "./GenerativeToken"

let manager: EntityManager
let connection: Connection

beforeAll(async () => {
  connection = await createConnection()
  manager = new EntityManager(connection)
})

afterAll(() => {
  connection.close()
})

const cleanup = async () => {
  await manager.query("DELETE FROM reserve")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

describe("generativeQueryFilter", () => {
  describe("when filtering on mintProgress_eq", () => {
    describe("ONGOING", () => {
      const filters = {
        mintProgress_eq: "ONGOING",
      }

      const tokenIds = {
        ZERO_BALANCE: 0,
        POSITIVE_BALANCE: 1,
        POSITIVE_BALANCE_WITH_RESERVES: 2,
        ALL_RESERVED: 3,
      }

      beforeEach(async () => {
        // Clean up the database before each test
        await cleanup()

        // create a generative token with 0 balance
        await generativeTokenFactory(
          tokenIds.ZERO_BALANCE,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 0,
          }
        )

        // create a generative token with > 0 balance
        await generativeTokenFactory(
          tokenIds.POSITIVE_BALANCE,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 50,
          }
        )

        // create a generative token with > 0 balance and some reserves
        await generativeTokenFactory(
          tokenIds.POSITIVE_BALANCE_WITH_RESERVES,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 50,
          }
        )
        await reserveFactory(tokenIds.POSITIVE_BALANCE_WITH_RESERVES, {
          amount: 25,
        })

        // create a generative token with all balance as reserves
        await generativeTokenFactory(
          tokenIds.ALL_RESERVED,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 50,
          }
        )
        await reserveFactory(tokenIds.ALL_RESERVED, {
          amount: 50,
        })
      })

      it("should return tokens with > 0 balance and balance - reserves > 0", async () => {
        let query = GenerativeToken.createQueryBuilder("token").select()
        query = await generativeQueryFilter(query, filters)
        const tokens = await query.getMany()

        const filteredTokens = tokens.filter(
          token =>
            token.id === tokenIds.POSITIVE_BALANCE ||
            token.id === tokenIds.POSITIVE_BALANCE_WITH_RESERVES
        )

        expect(filteredTokens.length).toEqual(2)
      })

      it("should exclude tokens with 0 balance", async () => {
        let query = GenerativeToken.createQueryBuilder("token").select()
        query = await generativeQueryFilter(query, filters)
        const tokens = await query.getMany()

        expect(
          tokens.some(token => token.id === tokenIds.ZERO_BALANCE)
        ).toBeFalsy()
      })

      it("should exclude tokens with all balance as reserves", async () => {
        let query = GenerativeToken.createQueryBuilder("token").select()
        query = await generativeQueryFilter(query, filters)
        const tokens = await query.getMany()

        expect(
          tokens.some(token => token.id === tokenIds.ALL_RESERVED)
        ).toBeFalsy()
      })
    })

    describe("ALMOST", () => {
      const filters = {
        mintProgress_eq: "ALMOST",
      }

      const tokenIds = {
        FIFTY_PERCENT_LEFT: 0,
        LESS_THAN_TEN_PERCENT_LEFT: 1,
        TEN_PERCENT_LEFT_WITH_RESERVES: 2,
        ALL_RESERVED: 3,
      }

      beforeEach(async () => {
        // Clean up the database before each test
        await cleanup()

        // create a generative token with 50% of the supply left
        await generativeTokenFactory(
          tokenIds.FIFTY_PERCENT_LEFT,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 50,
          }
        )

        // create a generative token with < 10% of the supply left
        await generativeTokenFactory(
          tokenIds.LESS_THAN_TEN_PERCENT_LEFT,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 9,
          }
        )

        // create a generative token with 10% of the supply left and a few reserves
        await generativeTokenFactory(
          tokenIds.TEN_PERCENT_LEFT_WITH_RESERVES,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 9,
          }
        )
        await reserveFactory(tokenIds.TEN_PERCENT_LEFT_WITH_RESERVES, {
          amount: 3,
        })

        // create a generative token with < 10% of the supply left as reserves
        await generativeTokenFactory(
          tokenIds.ALL_RESERVED,
          GenerativeTokenVersion.V3,
          {
            supply: 100,
            balance: 9,
          }
        )
        await reserveFactory(tokenIds.ALL_RESERVED, {
          amount: 9,
        })
      })

      it("should return tokens with < 10% of the supply left", async () => {
        let query = GenerativeToken.createQueryBuilder("token").select()
        query = await generativeQueryFilter(query, filters)
        const tokens = await query.getMany()

        const filteredTokens = tokens.filter(
          token =>
            token.id === tokenIds.LESS_THAN_TEN_PERCENT_LEFT ||
            token.id === tokenIds.TEN_PERCENT_LEFT_WITH_RESERVES
        )

        expect(filteredTokens.length).toEqual(2)
      })

      it("should exclude tokens with 50% of the supply left", async () => {
        let query = GenerativeToken.createQueryBuilder("token").select()
        query = await generativeQueryFilter(query, filters)
        const tokens = await query.getMany()

        expect(
          tokens.some(token => token.id === tokenIds.FIFTY_PERCENT_LEFT)
        ).toBeFalsy()
      })

      it("should exclude tokens with all supply left as reserves", async () => {
        let query = GenerativeToken.createQueryBuilder("token").select()
        query = await generativeQueryFilter(query, filters)
        const tokens = await query.getMany()

        expect(
          tokens.some(token => token.id === tokenIds.ALL_RESERVED)
        ).toBeFalsy()
      })
    })
  })
})
