import { Connection, EntityManager } from "typeorm"

import {
  actionFactory,
  generativeTokenFactory,
  listingFactory,
  objktFactory,
  objktSplitFactory,
  offerFactory,
  redeemableFactory,
  redemptionFactory,
} from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"
import {
  createObjktActionsLoader,
  createObjktActiveListingsLoader,
  createObjktAvailableRedeemablesLoader,
  createObjktListingsLoader,
  createObjktMintedPriceLoader,
  createObjktOffersLoader,
  createObjktRedemptionsLoader,
  createObjktRoyaltiesSplitsLoader,
  createObjktsLoader,
} from "./Objkt"
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
  await manager.query("DELETE FROM redemption")
  await manager.query("DELETE FROM redeemable")
  await manager.query("DELETE FROM listing")
  await manager.query("DELETE FROM offer")
  await manager.query("DELETE FROM action")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM generative_token")
}

afterEach(cleanup)

const seedTokens = async () => {
  await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
  await generativeTokenFactory(0, GenerativeTokenVersion.V3)
  await generativeTokenFactory(1, GenerativeTokenVersion.V3)
}

describe("Objkt dataloaders", () => {
  let dataloader

  describe("createObjktsLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(0, GenerativeTokenVersion.V3, { tokenId: 0 })
      await objktFactory(1, GenerativeTokenVersion.V3, { tokenId: 1 })
    })

    it("should return the correct objkts", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
    })
  })

  describe("createObjktActionsLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktActionsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktFactory(0, GenerativeTokenVersion.V3)
      await objktFactory(1, GenerativeTokenVersion.V3)

      // create some actions
      await actionFactory({
        objktId: 0,
        objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
      })
      await actionFactory({
        objktId: 0,
        objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
      })
      await actionFactory({
        objktId: 0,
        objktIssuerVersion: GenerativeTokenVersion.V3,
      })
    })

    it("should return actions with the correct objkts", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
        ],
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.V3,
          },
        ],
      ])
    })
  })

  describe("createObjktRoyaltiesSplitsLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktRoyaltiesSplitsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktFactory(0, GenerativeTokenVersion.V3)
      await objktFactory(1, GenerativeTokenVersion.V3)

      // create some royalty splits

      await objktSplitFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktSplitFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktSplitFactory(0, GenerativeTokenVersion.V3)
    })

    it("should return the correct royalty splits", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
        ],
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.V3,
          },
        ],
      ])
    })
  })

  describe("createObjktListingsLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktListingsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktFactory(0, GenerativeTokenVersion.V3)
      await objktFactory(1, GenerativeTokenVersion.V3)

      // create some listings
      await listingFactory(0, 0, GenerativeTokenVersion.PRE_V3)
      await listingFactory(1, 1, GenerativeTokenVersion.V3)
    })

    it("should return the correct listings", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
        ],
        [],
        [
          {
            objktId: 1,
            objktIssuerVersion: GenerativeTokenVersion.V3,
          },
        ],
      ])
    })
  })

  describe("createObjktActiveListingsLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktActiveListingsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktFactory(0, GenerativeTokenVersion.V3)
      await objktFactory(1, GenerativeTokenVersion.V3)

      // create some listings
      await listingFactory(0, 0, GenerativeTokenVersion.PRE_V3)
      await listingFactory(1, 1, GenerativeTokenVersion.V3)
    })

    it("should return the correct listings", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        {
          objktId: 0,
          objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        null,
        {
          objktId: 1,
          objktIssuerVersion: GenerativeTokenVersion.V3,
        },
      ])
    })
  })

  describe("createObjktOffersLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktOffersLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktFactory(0, GenerativeTokenVersion.V3)
      await objktFactory(1, GenerativeTokenVersion.V3)

      // create some offers
      await offerFactory(0, 0, GenerativeTokenVersion.PRE_V3)
      await offerFactory(1, 1, GenerativeTokenVersion.V3)
    })

    it("should return the correct offers", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
        ],
        [],
        [
          {
            objktId: 1,
            objktIssuerVersion: GenerativeTokenVersion.V3,
          },
        ],
      ])
    })
  })

  describe("createObjktRedemptionsLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktRedemptionsLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3)
      await objktFactory(0, GenerativeTokenVersion.V3)
      await objktFactory(1, GenerativeTokenVersion.V3)

      // create some redemptions
      await redemptionFactory(0, GenerativeTokenVersion.PRE_V3)
      await redemptionFactory(1, GenerativeTokenVersion.V3)
    })

    it("should return the correct redemptions", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        [
          {
            objktId: 0,
            objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
          },
        ],
        [],
        [
          {
            objktId: 1,
            objktIssuerVersion: GenerativeTokenVersion.V3,
          },
        ],
      ])
    })
  })

  describe("createObjktAvailableRedeemablesLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktAvailableRedeemablesLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(0, GenerativeTokenVersion.V3, { tokenId: 0 })
      await objktFactory(1, GenerativeTokenVersion.V3, { tokenId: 1 })

      // create some redeemables with defined max consumptions
      const redeemable = await redeemableFactory(0, {
        address: "KT1",
        maxConsumptionsPerToken: 10,
      })
      const redeemable2 = await redeemableFactory(1, {
        address: "KT2",
        maxConsumptionsPerToken: 10,
      })

      // create some redemptions
      await redemptionFactory(0, GenerativeTokenVersion.PRE_V3, {
        redeemableAddress: redeemable.address,
      })
      await redemptionFactory(1, GenerativeTokenVersion.V3, {
        redeemableAddress: redeemable2.address,
      })
    })

    it("should return the correct redeemables", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject([
        [
          {
            address: "KT1",
          },
        ],
        null,
        [
          {
            address: "KT2",
          },
        ],
      ])
    })
  })

  describe("createObjktMintedPriceLoader", () => {
    beforeAll(async () => {
      dataloader = createObjktMintedPriceLoader()

      await seedTokens()

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, { tokenId: 0 })
      await objktFactory(0, GenerativeTokenVersion.V3, { tokenId: 0 })
      await objktFactory(1, GenerativeTokenVersion.V3, { tokenId: 1 })

      // create some minted actions
      await actionFactory({
        objktId: 0,
        objktIssuerVersion: GenerativeTokenVersion.PRE_V3,
        type: TokenActionType.MINTED_FROM,
        numericValue: 100,
      })
      await actionFactory({
        objktId: 1,
        objktIssuerVersion: GenerativeTokenVersion.V3,
        type: TokenActionType.MINTED_FROM,
        numericValue: 200,
      })
    })

    it("should return the correct minted price", async () => {
      const results = await dataloader.loadMany([
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.PRE_V3,
        },
        {
          id: 0,
          issuerVersion: GenerativeTokenVersion.V3,
        },
        {
          id: 1,
          issuerVersion: GenerativeTokenVersion.V3,
        },
      ])
      expect(results).toMatchObject(["100", undefined, "200"])
    })
  })
})
