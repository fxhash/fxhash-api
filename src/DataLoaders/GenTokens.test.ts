import { Connection, EntityManager } from "typeorm"

import {
  articleFactory,
  articleMentionFactory,
  codexFactory,
  collectionOfferFactory,
  generativeTokenFactory,
  marketStatsFactory,
  marketStatsHistoryFactory,
  mintTicketFactory,
  mintTicketSettingsFactory,
  objktFactory,
  offerFactory,
  pricingDutchAuctionFactory,
  pricingFixedFactory,
  primarySplitFactory,
  redeemableFactory,
  reportFactory,
  reserveFactory,
  secondarySplitFactory,
} from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"
import {
  createGentkTokPrimarySplitsLoader,
  createGentkTokRedeemablesLoader,
  createGentkTokSecondarySplitsLoader,
  createGenTokArticleMentionsLoader,
  createGenTokCodexLoader,
  createGenTokCollectionOffersLoader,
  createGenTokLoader,
  createGenTokMarketStatsHistoryLoader,
  createGenTokMarketStatsLoader,
  createGenTokMintTicketSettingsLoader,
  createGenTokObjktFeaturesLoader,
  createGenTokObjktsCountLoader,
  createGenTokObjktsLoader,
  createGenTokOffersAndCollectionOffersLoader,
  createGenTokOffersLoader,
  createGenTokPricingDutchAuctionLoader,
  createGenTokPricingFixedLoader,
  createGenTokReportsLoader,
  createGenTokReservesLoader,
} from "./GenTokens"

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
  await manager.query("DELETE FROM report")
  await manager.query("DELETE FROM offer")
  await manager.query("DELETE FROM collection_offer")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM redeemable")
  await manager.query("DELETE FROM mint_ticket_settings")
  await manager.query("DELETE FROM mint_ticket")
  await manager.query("DELETE FROM generative_token")
  await manager.query("DELETE FROM codex")
}

const seedTokens = async () => {
  await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
  await generativeTokenFactory(1, GenerativeTokenVersion.V3)
  await generativeTokenFactory(2, GenerativeTokenVersion.V3)
}

describe("GenTokens dataloaders", () => {
  let dataloader

  describe("createGenTokLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokLoader()
      await seedTokens()
    })

    it("should return the correct generative tokens", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 0, version: "PRE_V3" }),
          expect.objectContaining({ id: 1, version: "V3" }),
        ])
      )
    })
  })

  describe("createGenTokObjktsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokObjktsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(1, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(2, GenerativeTokenVersion.V3, { tokenId: 1 })
    })

    it("should return the correct objkts", async () => {
      const result = await dataloader.loadMany([{ id: 0 }, { id: 1 }])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              issuerId: 0,
              issuerVersion: "PRE_V3",
            }),
            expect.objectContaining({
              id: 0,
              issuerId: 0,
              issuerVersion: "PRE_V3",
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              id: 2,
              issuerId: 1,
              issuerVersion: "V3",
            }),
          ]),
        ])
      )
    })
  })

  describe("createGenTokObjktsCountLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokObjktsCountLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(1, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(2, GenerativeTokenVersion.V3, { tokenId: 1 })
    })

    it("should return the correct objkts counts", async () => {
      const result = await dataloader.loadMany([0, 1, 2])
      expect(result).toHaveLength(3)
      expect(result).toEqual(expect.arrayContaining([2, 1, 0]))
    })
  })

  describe("createGenTokPricingFixedLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokPricingFixedLoader()

      await seedTokens()

      // create some fixed pricings
      await pricingFixedFactory(0, GenerativeTokenVersion.PRE_V3)
      await pricingFixedFactory(0, GenerativeTokenVersion.V3)
      await pricingFixedFactory(1, GenerativeTokenVersion.V3)
    })

    it("should return the correct pricings", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tokenId: 0 }),
          expect.objectContaining({ tokenId: 1 }),
        ])
      )
    })
  })

  describe("createGenTokPricingDutchAuctionLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokPricingDutchAuctionLoader()

      await seedTokens()

      // create some DA pricings
      await pricingDutchAuctionFactory(0, GenerativeTokenVersion.PRE_V3)
      await pricingDutchAuctionFactory(0, GenerativeTokenVersion.V3)
      await pricingDutchAuctionFactory(1, GenerativeTokenVersion.V3)
    })

    it("should return the correct pricings", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tokenId: 0 }),
          expect.objectContaining({ tokenId: 1 }),
        ])
      )
    })
  })

  describe("createGentkTokPrimarySplitsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGentkTokPrimarySplitsLoader()

      await seedTokens()

      // create some primary splits
      await primarySplitFactory(0, GenerativeTokenVersion.PRE_V3)
      await primarySplitFactory(0, GenerativeTokenVersion.V3)
      await primarySplitFactory(1, GenerativeTokenVersion.V3)
    })

    it("should return the correct splits", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              generativeTokenPrimaryId: 0,
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              generativeTokenPrimaryId: 1,
            }),
          ]),
        ])
      )
    })
  })

  describe("createGentkTokSecondarySplitsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGentkTokSecondarySplitsLoader()

      await seedTokens()

      // create some secondary splits
      await secondarySplitFactory(0, GenerativeTokenVersion.PRE_V3)
      await secondarySplitFactory(0, GenerativeTokenVersion.V3)
      await secondarySplitFactory(1, GenerativeTokenVersion.V3)
    })

    it("should return the correct splits", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              generativeTokenSecondaryId: 0,
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              generativeTokenSecondaryId: 1,
            }),
          ]),
        ])
      )
    })
  })

  describe("createGenTokArticleMentionsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokArticleMentionsLoader()

      await seedTokens()

      // create some article mentions
      await articleFactory(0)
      await articleMentionFactory(0, 0, GenerativeTokenVersion.PRE_V3)
      await articleMentionFactory(0, 1, GenerativeTokenVersion.V3)
      await articleMentionFactory(0, 2, GenerativeTokenVersion.V3)
    })

    it("should return the correct article mentions", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              articleId: 0,
              generativeTokenId: 0,
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              articleId: 0,
              generativeTokenId: 1,
            }),
          ]),
        ])
      )
    })
  })

  describe("createGenTokReportsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokReportsLoader()

      await seedTokens()

      // create some reports
      await reportFactory({
        tokenId: 0,
      })
      await reportFactory({
        tokenId: 1,
      })
      await reportFactory({
        tokenId: 2,
      })
    })

    it("should return the correct reports", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              tokenId: 0,
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              tokenId: 1,
            }),
          ]),
        ])
      )
    })
  })

  describe("createGenTokMarketStatsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokMarketStatsLoader()

      await seedTokens()

      // create some market stats
      await marketStatsFactory(0)
      await marketStatsFactory(1)
      await marketStatsFactory(2)
    })

    it("should return the correct market stats", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tokenId: 0,
          }),
          expect.objectContaining({
            tokenId: 1,
          }),
        ])
      )
    })
  })

  describe("createGenTokMarketStatsHistoryLoader", () => {
    const start = new Date("2021-01-01")
    const middle = new Date("2021-01-02")
    const end = new Date("2021-01-03")

    const config = { from: start, to: middle }

    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokMarketStatsHistoryLoader()

      await seedTokens()

      // create some market stats
      await marketStatsHistoryFactory(0, config)
      await marketStatsHistoryFactory(0, config)
      await marketStatsHistoryFactory(1, config)
    })

    it("should return the correct market stats histories", async () => {
      const result = await dataloader.loadMany([
        { id: 0, from: start, to: end },
        { id: 1, from: start, to: end },
      ])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              tokenId: 0,
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              tokenId: 1,
            }),
          ]),
        ])
      )
    })
  })

  describe("createGenTokObjktFeaturesLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokObjktFeaturesLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
        features: [{ name: "gralis", value: "yes" }],
      })
      await objktFactory(0, GenerativeTokenVersion.V3, {
        tokenId: 1,
        features: [{ name: "gralis", value: "yes" }],
      })
      await objktFactory(1, GenerativeTokenVersion.V3, {
        tokenId: 1,
        features: [{ name: "gralis", value: "no" }],
      })
    })

    it("should return the correct objkts", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              name: "gralis",
              values: expect.arrayContaining([
                expect.objectContaining({ occur: 1, value: "yes" }),
              ]),
            }),
          ]),
          expect.arrayContaining([
            expect.objectContaining({
              name: "gralis",
              values: expect.arrayContaining([
                expect.objectContaining({ occur: 1, value: "yes" }),
                expect.objectContaining({ occur: 1, value: "no" }),
              ]),
            }),
          ]),
        ])
      )
    })
  })

  describe("createGenTokOffersLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokOffersLoader()

      await seedTokens()

      // create some offers
      const objkt = await objktFactory(0, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
      })
      await offerFactory(0, objkt.id, objkt.issuerVersion)

      const objkt2 = await objktFactory(1, GenerativeTokenVersion.V3, {
        tokenId: 1,
      })
      await offerFactory(1, objkt2.id, objkt2.issuerVersion)
    })

    it("should return the correct offers", async () => {
      const result = await dataloader.loadMany([{ id: 0 }, { id: 1 }])

      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        [
          {
            objkt: {
              issuer: {
                id: 0,
                version: "PRE_V3",
              },
            },
          },
        ],
        [
          {
            objkt: {
              issuer: {
                id: 1,
                version: "V3",
              },
            },
          },
        ],
      ])
    })
  })

  describe("createGenTokCollectionOffersLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokCollectionOffersLoader()

      await seedTokens()

      // create some collection offers
      await collectionOfferFactory(0, { tokenId: 0 })
      await collectionOfferFactory(1, { tokenId: 1 })
    })

    it("should return the correct collection offers", async () => {
      const result = await dataloader.loadMany([{ id: 0 }, { id: 1 }])

      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        [
          {
            tokenId: 0,
          },
        ],
        [
          {
            tokenId: 1,
          },
        ],
      ])
    })
  })

  describe("createGenTokOffersAndCollectionOffersLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokOffersAndCollectionOffersLoader()

      await seedTokens()

      // create some offers
      const objkt = await objktFactory(0, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
      })
      await offerFactory(0, objkt.id, objkt.issuerVersion, {
        price: 3,
        createdAt: new Date("2023-01-02"),
        acceptedAt: new Date("2023-01-02"),
      })

      const objkt2 = await objktFactory(1, GenerativeTokenVersion.V3, {
        tokenId: 1,
      })
      await offerFactory(1, objkt2.id, objkt2.issuerVersion, {
        price: 2,
        createdAt: new Date("2023-01-04"),
      })

      // create some collection offers
      await collectionOfferFactory(2, {
        tokenId: 0,
        price: 4,
        createdAt: new Date("2023-01-01"),
        completedAt: new Date("2023-01-03"),
      })
      await collectionOfferFactory(3, {
        tokenId: 1,
        price: 1,
        createdAt: new Date("2023-01-03"),
      })
    })

    describe("filters", () => {
      describe("active_eq true", () => {
        it("should return the correct offers and collection offers", async () => {
          const result = await dataloader.loadMany([
            { id: 0, filters: { active_eq: true } },
            { id: 1 },
          ])
          expect(result).toHaveLength(2)
          expect(result).toMatchObject([
            [],
            [
              {
                id: 1,
                objkt: {
                  issuerId: 1,
                },
              },
              {
                id: 3,
                tokenId: 1,
              },
            ],
          ])
        })
      })

      describe("active_eq false", () => {
        it("should return the correct offers and collection offers", async () => {
          const result = await dataloader.loadMany([
            { id: 0, filters: { active_eq: false } },
            { id: 1 },
          ])
          expect(result).toHaveLength(2)
          expect(result).toMatchObject([
            [
              {
                id: 0,
                objkt: {
                  issuerId: 0,
                },
              },
              {
                id: 2,
                tokenId: 0,
              },
            ],
            [],
          ])
        })
      })
    })

    describe("sorting", () => {
      describe("createdAt", () => {
        it("returns offers in the correct order when ASC", async () => {
          const result = await dataloader.loadMany([
            { id: 0, sort: { createdAt: "ASC" } },
            { id: 1, sort: { createdAt: "ASC" } },
          ])
          expect(result).toHaveLength(2)
          expect(result).toMatchObject([
            [
              {
                id: 2,
              },
              {
                id: 0,
              },
            ],
            [
              {
                id: 3,
              },
              {
                id: 1,
              },
            ],
          ])
        })
        it("returns offers in the correct order when DESC", async () => {
          const result = await dataloader.loadMany([
            { id: 0, sort: { createdAt: "DESC" } },
            { id: 1, sort: { createdAt: "DESC" } },
          ])
          expect(result).toHaveLength(2)
          expect(result).toMatchObject([
            [
              {
                id: 0,
              },
              {
                id: 2,
              },
            ],
            [
              {
                id: 1,
              },
              {
                id: 3,
              },
            ],
          ])
        })
      })
      describe("price", () => {
        it("returns offers in the correct order when ASC", async () => {
          const result = await dataloader.loadMany([
            { id: 0, sort: { price: "ASC" } },
            { id: 1, sort: { price: "ASC" } },
          ])
          console.log(result)
          expect(result).toHaveLength(2)
          expect(result).toMatchObject([
            [
              {
                id: 0,
              },
              {
                id: 2,
              },
            ],
            [
              {
                id: 3,
              },
              {
                id: 1,
              },
            ],
          ])
        })

        it("returns offers in the correct order when DESC", async () => {
          const result = await dataloader.loadMany([
            { id: 0, sort: { price: "DESC" } },
            { id: 1, sort: { price: "DESC" } },
          ])
          expect(result).toHaveLength(2)
          expect(result).toMatchObject([
            [
              {
                id: 2,
              },
              {
                id: 0,
              },
            ],
            [
              {
                id: 1,
              },
              {
                id: 3,
              },
            ],
          ])
        })
      })
    })
  })

  describe("createGenTokReservesLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokReservesLoader()

      await seedTokens()

      // create some reserves
      await reserveFactory(0)
      await reserveFactory(1)
      await reserveFactory(2)
    })

    it("should return the correct reserves", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        [
          {
            tokenId: 0,
          },
        ],
        [
          {
            tokenId: 1,
          },
        ],
      ])
    })
  })

  describe("createGentkTokRedeemablesLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGentkTokRedeemablesLoader()

      await seedTokens()

      // create some redeemables
      await redeemableFactory(0)
      await redeemableFactory(1)
      await redeemableFactory(2)
    })

    it("should return the correct redeemables", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        [
          {
            tokenId: 0,
          },
        ],
        [
          {
            tokenId: 1,
          },
        ],
      ])
    })
  })

  describe("createGenTokMintTicketSettingsLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokMintTicketSettingsLoader()

      await seedTokens()

      // create some mint ticket settings
      await mintTicketSettingsFactory(0)
      await mintTicketSettingsFactory(1)
    })

    it("should return the correct mint ticket settings", async () => {
      const result = await dataloader.loadMany([0, 1])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        {
          tokenId: 0,
        },

        {
          tokenId: 1,
        },
      ])
    })
  })

  describe("createGenTokCodexLoader", () => {
    afterAll(cleanup)

    beforeAll(async () => {
      dataloader = createGenTokCodexLoader()

      await seedTokens()

      // create some codex
      await codexFactory(0, GenerativeTokenVersion.PRE_V3)
      await codexFactory(0)
      await codexFactory(1)
    })

    it("should return the correct codex", async () => {
      const result = await dataloader.loadMany([
        { id: 0, version: "PRE_V3" },
        { id: 1, version: "V3" },
      ])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        {
          id: 0,
          tokenVersion: "PRE_V3",
        },
        {
          id: 1,
          tokenVersion: "V3",
        },
      ])
    })
  })
})
