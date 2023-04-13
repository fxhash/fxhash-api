import { Connection, EntityManager } from "typeorm"

import {
  actionFactory,
  collectionOfferFactory,
  generativeTokenFactory,
  mintTicketFactory,
  objktFactory,
  offerFactory,
  transactionFactory,
  userFactory,
} from "../tests/factories"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { createConnection } from "../createConnection"
import {
  createUsersGenerativeTokensLoader,
  createUsersGentkMinLastSoldPriceLoader,
  createUsersMintTicketsLoader,
  createUsersOffersAndCollectionOffersReceivedLoader,
  createUsersOffersAndCollectionOffersSentLoader,
  createUsersSalesLoader,
} from "./User"
import { TokenActionType } from "../Entity/Action"
import { ETransationType } from "../Entity/Transaction"

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
  await manager.query("DELETE FROM transaction")
  await manager.query("DELETE FROM collection_offer")
  await manager.query("DELETE FROM offer")
  await manager.query("DELETE FROM objkt")
  await manager.query("DELETE FROM mint_ticket")
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
      await generativeTokenFactory(1, GenerativeTokenVersion.V3, {
        authorId: user.id,
      })
      await generativeTokenFactory(2, GenerativeTokenVersion.V3, {
        authorId: user2.id,
      })
    })

    it("should return the correct generative tokens", async () => {
      const result = await dataloader.loadMany([{ id: "tz1" }, { id: "tz2" }])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject([
        [
          {
            id: 1,
          },
          {
            id: 0,
          },
        ],
        [
          {
            id: 2,
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
      await generativeTokenFactory(1, GenerativeTokenVersion.V3, {
        authorId: user.id,
      })
      await generativeTokenFactory(2, GenerativeTokenVersion.V3, {
        authorId: user2.id,
      })

      // create some sale actions
      await actionFactory({
        tokenId: 0,
        tokenVersion: GenerativeTokenVersion.PRE_V3,
        type: TokenActionType.LISTING_V1_ACCEPTED,
      })
      await actionFactory({
        tokenId: 1,
        tokenVersion: GenerativeTokenVersion.V3,
        type: TokenActionType.LISTING_V2_ACCEPTED,
      })
      await actionFactory({
        tokenId: 2,
        tokenVersion: GenerativeTokenVersion.V3,
        type: TokenActionType.LISTING_V2_ACCEPTED,
      })
    })

    it("should return actions for the correct tokens", async () => {
      const result = await dataloader.loadMany([
        { id: "tz1", skip: 0, take: 10 },
      ])
      expect(result).toHaveLength(1)
      expect(result).toEqual(
        expect.arrayContaining([
          [
            expect.objectContaining({
              tokenId: 1,
            }),
            expect.objectContaining({
              tokenId: 0,
            }),
          ],
        ])
      )
    })
  })

  describe("createUsersMintTicketsLoader", () => {
    beforeAll(async () => {
      dataloader = createUsersMintTicketsLoader()

      // create some users
      const user = await userFactory("tz1")
      const user2 = await userFactory("tz2")

      // create a token
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
      await generativeTokenFactory(1, GenerativeTokenVersion.PRE_V3)

      // create some mint tickets
      await mintTicketFactory(0, 0, { ownerId: user.id })
      await mintTicketFactory(1, 0, { ownerId: user.id })
      await mintTicketFactory(2, 1, { ownerId: user2.id })
    })

    it("should return the correct mint tickets", async () => {
      const result = await dataloader.loadMany(["tz1"])
      expect(result).toHaveLength(1)
      expect(result).toEqual(
        expect.arrayContaining([
          [
            expect.objectContaining({
              id: 1,
            }),
            expect.objectContaining({
              id: 0,
            }),
          ],
        ])
      )
    })
  })

  describe("createUsersOffersAndCollectionOffersSentLoader", () => {
    beforeAll(async () => {
      dataloader = createUsersOffersAndCollectionOffersSentLoader()

      // create some users
      const user = await userFactory("tz1")
      const user2 = await userFactory("tz2")

      // create some tokens
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
      await generativeTokenFactory(1, GenerativeTokenVersion.V3)

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
        buyerId: user.id,
      })
      await objktFactory(1, GenerativeTokenVersion.V3, {
        tokenId: 1,
        buyerId: user2.id,
      })

      // create some offers
      await offerFactory(0, 0, GenerativeTokenVersion.PRE_V3, {
        buyerId: user.id,
      })
      await offerFactory(1, 1, GenerativeTokenVersion.V3, {
        buyerId: user2.id,
      })

      // create some collection offers
      await collectionOfferFactory(2, { tokenId: 0, buyerId: user.id })
      await collectionOfferFactory(3, { tokenId: 1, buyerId: user2.id })
    })

    it("returns the correct offers and collection offers", async () => {
      const result = await dataloader.loadMany([{ id: "tz1" }, { id: "tz2" }])
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

  describe("createUsersOffersAndCollectionOffersReceivedLoader", () => {
    beforeAll(async () => {
      dataloader = createUsersOffersAndCollectionOffersReceivedLoader()

      // create some users
      const user = await userFactory("tz1")
      const user2 = await userFactory("tz2")

      // create some tokens
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
      await generativeTokenFactory(1, GenerativeTokenVersion.V3)

      // create some objkts
      await objktFactory(0, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
        ownerId: user.id,
      })
      await objktFactory(1, GenerativeTokenVersion.V3, {
        tokenId: 1,
        ownerId: user2.id,
      })

      // create some offers
      await offerFactory(0, 0, GenerativeTokenVersion.PRE_V3, {
        buyerId: user2.id,
      })
      await offerFactory(1, 1, GenerativeTokenVersion.V3, {
        buyerId: user.id,
      })

      // create some collection offers
      await collectionOfferFactory(2, { tokenId: 0, buyerId: user2.id })
      await collectionOfferFactory(3, { tokenId: 1, buyerId: user.id })
    })

    it("returns the correct offers and collection offers", async () => {
      const result = await dataloader.loadMany([{ id: "tz1" }, { id: "tz2" }])
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

  describe("createUsersGentkMinLastSoldPriceLoader", () => {
    beforeAll(async () => {
      dataloader = createUsersGentkMinLastSoldPriceLoader()

      // create some users
      const userA = await userFactory("tz1")
      const userB = await userFactory("tz2")

      // create some tokens
      await generativeTokenFactory(0, GenerativeTokenVersion.PRE_V3)
      await generativeTokenFactory(1, GenerativeTokenVersion.V3)

      // create some objkts owned by userA
      const userAObjktA = await objktFactory(0, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
        ownerId: userA.id,
      })
      const userAObjktB = await objktFactory(1, GenerativeTokenVersion.PRE_V3, {
        tokenId: 0,
        ownerId: userA.id,
      })

      // create some transactions for userAObjktA
      await transactionFactory(0, ETransationType.PRIMARY, {
        tokenId: userAObjktA.issuerId,
        objktId: userAObjktA.id,
        objktIssuerVersion: userAObjktA.issuerVersion,
        price: "1",
      })
      await transactionFactory(1, ETransationType.SECONDARY, {
        tokenId: userAObjktA.issuerId,
        objktId: userAObjktA.id,
        objktIssuerVersion: userAObjktA.issuerVersion,
        price: "3",
      })

      // create some transactions for userAObjktB
      await transactionFactory(2, ETransationType.SECONDARY, {
        tokenId: userAObjktB.issuerId,
        objktId: userAObjktB.id,
        objktIssuerVersion: userAObjktB.issuerVersion,
        price: "4",
      })
      await transactionFactory(3, ETransationType.SECONDARY, {
        tokenId: userAObjktB.issuerId,
        objktId: userAObjktB.id,
        objktIssuerVersion: userAObjktB.issuerVersion,
        price: "5",
      })

      // create some objkts owned by userB
      const userBObjktA = await objktFactory(2, GenerativeTokenVersion.V3, {
        tokenId: 1,
        ownerId: userB.id,
      })
      const userBObjktB = await objktFactory(3, GenerativeTokenVersion.V3, {
        tokenId: 1,
        ownerId: userB.id,
      })

      // create some transactions for userBObjktA
      await transactionFactory(4, ETransationType.PRIMARY, {
        tokenId: userBObjktA.issuerId,
        objktId: userBObjktA.id,
        objktIssuerVersion: userBObjktA.issuerVersion,
        price: "5",
      })
      await transactionFactory(5, ETransationType.SECONDARY, {
        tokenId: userBObjktA.issuerId,
        objktId: userBObjktA.id,
        objktIssuerVersion: userBObjktA.issuerVersion,
        price: "4",
      })

      // create some transactions for userBObjktB
      await transactionFactory(6, ETransationType.SECONDARY, {
        tokenId: userBObjktB.issuerId,
        objktId: userBObjktB.id,
        objktIssuerVersion: userBObjktB.issuerVersion,
        price: "3",
      })
      await transactionFactory(7, ETransationType.SECONDARY, {
        tokenId: userBObjktB.issuerId,
        objktId: userBObjktB.id,
        objktIssuerVersion: userBObjktB.issuerVersion,
        price: "2",
      })
    })

    it("returns the correct min last sold price for each (owner, token)", async () => {
      const result = await dataloader.loadMany([
        { ownerId: "tz1", tokenId: 0 },
        { ownerId: "tz2", tokenId: 1 },
      ])
      expect(result).toHaveLength(2)
      expect(result).toMatchObject(["3", "2"])
    })
  })
})
