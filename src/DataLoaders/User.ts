import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { Objkt } from "../Entity/Objkt"
import { User, UserType } from "../Entity/User"
import { Collaboration } from "../Entity/Collaboration"
import { Offer } from "../Entity/Offer"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { generativeQueryFilter } from "../Query/Filters/GenerativeToken"
import { Action, TokenActionType } from "../Entity/Action"
import { offerQueryFilter } from "../Query/Filters/Offer"
import { Article } from "../Entity/Article"
import { articleQueryFilter } from "../Query/Filters/Article"
import { ArticleLedger } from "../Entity/ArticleLedger"
import { matchesEntityTokenIdAndVersion } from "../Utils/GenerativeToken"
import { TokenId } from "../Scalar/TokenId"

/**
 * Given a list of user IDs, resolves with an array of Users matching those
 * IDs
 */
const batchUsers = async userIds => {
  const users = await User.find({
    where: {
      id: In(userIds),
    },
    // cache: 10000
  })
  return userIds.map(id => users.find(user => user.id === id))
}
export const createUsersLoader = () => new DataLoader(batchUsers)

/**
 * Given a list of user IDs, returns a list of Users of type
 * UserType.COLLAB_CONTRACT_V1 which are contracts in which the given users
 * are part of.
 */
const batchUsersCollabContracts = async ids => {
  const collabs = await Collaboration.createQueryBuilder("collab")
    .select()
    .leftJoinAndSelect("collab.collaborationContract", "contract")
    .where("collab.collaboratorId IN(:...ids)", { ids })
    .orderBy("contract.createdAt", "DESC")
    .getMany()

  return ids.map(id =>
    collabs
      .filter(collab => collab.collaboratorId === id)
      .map(collab => collab.collaborationContract)
  )
}
export const createUsersCollabContractsLoader = () =>
  new DataLoader(batchUsersCollabContracts)

/**
 * Given a list of user IDs, returns a list of Users of type
 * UserType.REGULAR which are collaborators in the provided list of
 * collaboration contracts/
 */
const batchCollabCollaborators = async ids => {
  const collabs = await Collaboration.createQueryBuilder("collab")
    .select()
    .leftJoinAndSelect("collab.collaborator", "user")
    .where("collab.collaborationContractId IN(:...ids)", { ids })
    .orderBy("user.createdAt", "DESC")
    .getMany()

  return ids.map(id =>
    collabs
      .filter(collab => collab.collaborationContractId === id)
      .map(collab => collab.collaborator)
  )
}
export const createCollabCollaboratorsLoader = () =>
  new DataLoader(batchCollabCollaborators)

/**
 * Given a list of users, outputs a list of the objkts they own
 */
const batchUsersObjkt = async userIds => {
  const objkts = await Objkt.find({
    relations: ["owner"],
    where: {
      ownerId: In(userIds),
    },
    order: {
      id: "DESC",
    },
    // cache: 10000
  })
  return userIds.map((id: string) =>
    objkts.filter(objkt => objkt.owner?.id === id)
  )
}
export const createUsersObjktLoader = () => new DataLoader(batchUsersObjkt)

/**
 * Given a list of user IDs, returns a list of offers
 */
const batchUserOffersSent = async (inputs: any) => {
  // we extract the ids and the filters if any
  const ids = inputs.map(input => input.id)
  const filters = inputs[0]?.filters
  const sort = inputs[0]?.sort

  const query = Offer.createQueryBuilder("offer")
    .select()
    .where("offer.buyerId IN(:...ids)", { ids })

  // filter/sort options
  offerQueryFilter(query, filters, sort)

  const offers = await query.getMany()
  return ids.map(id => offers.filter(l => l.buyerId === id))
}
export const createUsersOffersSentLoader = () =>
  new DataLoader(batchUserOffersSent)

/**
 * Given a list of user IDs, returns a list of offers
 */
const batchUserOffersReceived = async (inputs: any) => {
  // we extract the ids and the filters if any
  const ids = inputs.map(input => input.id)
  const filters = inputs[0]?.filters
  const sort = inputs[0]?.sort

  const query = Offer.createQueryBuilder("offer")
    .select()
    .leftJoinAndSelect("offer.objkt", "objkt")
    .where("objkt.ownerId IN(:...ids)", { ids })

  // filter/sort options
  offerQueryFilter(query, filters, sort)

  const offers = await query.getMany()
  return ids.map(id => offers.filter(l => l.objkt.ownerId === id))
}
export const createUsersOffersReceivedLoader = () =>
  new DataLoader(batchUserOffersReceived)

/**
 * Given a list of user ids, outputs a list of list of Generative Tokens,
 * in which each user has its generative tokens
 */
const batchUsersGenerativeTokens = async (users: any) => {
  // we extract the IDs, filters & sort arguments
  const ids = users.map(u => u.id)
  const filters = users[0]?.filters
  const sort = users[0]?.sort
  const take = users[0]?.take
  const skip = users[0]?.skip

  let query = GenerativeToken.createQueryBuilder("token")
    .select()
    .leftJoinAndSelect("token.author", "author")
    .leftJoinAndSelect("author.collaborationContracts", "collabs")
    .leftJoinAndSelect("collabs.collaborator", "collaborator")
    .andWhere(
      new Brackets(qb => {
        qb.where("token.authorId IN(:...ids)", { ids }).orWhere(
          "collaborator.id IN(:...ids)",
          { ids }
        )
      })
    )

  // add filters / sorts
  query = await generativeQueryFilter(query, filters, sort)

  // add pagination
  if (take) {
    query.take(take)
  }
  if (skip) {
    query.skip(skip)
  }

  const results = await query.getMany()

  // map user to their work (either direct or collab)
  return ids.map(id =>
    results.filter(
      tok =>
        tok.author!.id === id ||
        (tok.author!.type === UserType.COLLAB_CONTRACT_V1 &&
          tok.author!.collaborationContracts.find(
            collab => collab.collaborator.id === id
          ))
    )
  )
}
export const createUsersGenerativeTokensLoader = () =>
  new DataLoader(batchUsersGenerativeTokens)

/**
 * Given a list of user ids, outputs a list of list of Articles authored by
 * the user.
 */
const batchUsersArticles = async (users: any) => {
  // we extract the IDs, filters & sort arguments
  const ids = users.map(u => u.id)
  const filters = users[0]?.filters
  const sort = users[0]?.sort
  const take = users[0]?.take
  const skip = users[0]?.skip

  let query = Article.createQueryBuilder("article")
    .select()
    .where("article.authorId IN(:...ids)", { ids })

  // add filters / sorts
  query = await articleQueryFilter(query, filters, sort)

  // add pagination
  if (take) {
    query.take(take)
  }
  if (skip) {
    query.skip(skip)
  }

  const results = await query.getMany()

  // map user to their work (either direct or collab)
  return ids.map(id => results.filter(article => article.authorId === id))
}
export const createUsersArticlesLoader = () =>
  new DataLoader(batchUsersArticles)

/**
 * Given a list of user ids, outputs a list of a list of actions of type
 * "LISTING_ACCEPTED" in which the user is either the direct seller or
 * an artist who authored the project.
 * TODO: find a way to handle many user IDs while keeping the requests
 * TODO: optimized (right now it's already slow with a single ID)
 */
const batchUsersSales = async (inputs: any) => {
  // get the user ids from the inputs
  const userIds = inputs.map((i: any) => i.id)
  // the skip, take arguments
  const { skip, take } = inputs[0]
  // for now it can only be optimized by taking a single user:
  const id = userIds[0]

  //
  // Get the sales in which the user is a direct seller
  //
  const sellerActions = await Action.createQueryBuilder("action")
    .select()
    // find the listings where user is seller
    .where(
      new Brackets(qb =>
        qb
          .where(
            new Brackets(qb =>
              qb
                .where({ type: TokenActionType.LISTING_V1_ACCEPTED })
                .orWhere({ type: TokenActionType.LISTING_V2_ACCEPTED })
            )
          )
          .andWhere("action.targetId = :id", { id })
      )
    )
    // find the offers where user is seller
    .orWhere(
      new Brackets(qb =>
        qb
          .where({ type: TokenActionType.OFFER_ACCEPTED })
          .andWhere("action.issuerId = :id", { id })
      )
    )
    .getMany()

  //
  // Get the sales for which the user is an author
  // To optimize, we first query the Generative Tokens in which the user is
  // an author, and then only we query the actions associated with it
  //
  const tokens = await GenerativeToken.createQueryBuilder("token")
    .leftJoin("token.author", "author")
    .leftJoin("author.collaborationContracts", "collabs")
    .leftJoin("collabs.collaborator", "collaborator")
    .where("author.id = :id", { id })
    .orWhere("collaborator.id = :id", { id })
    .getMany()

  let tokenActions: Action[] = []
  if (tokens.length > 0) {
    tokenActions = await Action.createQueryBuilder("action")
      .where(
        new Brackets(qb =>
          qb
            .where({ type: TokenActionType.LISTING_V1_ACCEPTED })
            .orWhere({ type: TokenActionType.LISTING_V2_ACCEPTED })
            .orWhere({ type: TokenActionType.OFFER_ACCEPTED })
        )
      )
      .andWhere(
        matchesEntityTokenIdAndVersion(
          tokens.map(t => new TokenId(t)),
          "action"
        )
      )
      .getMany()
  }

  // join all the actions, without duplicates
  let actions: Action[] = sellerActions
  const actionsMap: Record<string, boolean> = {}
  for (const action of sellerActions) {
    actionsMap[action.id] = true
  }
  for (const action of tokenActions) {
    if (!actionsMap[action.id]) {
      actionsMap[action.id] = true
      actions.push(action)
    }
  }

  // finally sort the actions
  actions.sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  )

  // pagination
  // todo: doing pagination this way is bad but no idea how to proceed otherwise
  // because of the multiple queries involved
  actions = actions.slice(skip, skip + take)

  // map each user to its results
  // return userIds.map(
  // 	(id: any) => actions.filter(
  // 		action => action.targetId === id
  // 			|| action.token?.authorId === id
  // 			|| action.token?.author?.collaborationContracts.find(c => c.collaboratorId === id)
  // 	)
  // )
  return [actions]
}
export const createUsersSalesLoader = () => new DataLoader(batchUsersSales)

/**
 * Given a list of user ids, outputs a list of Article Ledger entries where the
 * user is the owner key
 */
const batchUsersArticleLedgers = async ids => {
  const ledgers = await ArticleLedger.find({
    where: {
      ownerId: In(ids),
    },
  })
  return ids.map(id => ledgers.filter(ledger => ledger.ownerId === id))
}
export const createUsersArticleLedgersLoader = () =>
  new DataLoader(batchUsersArticleLedgers)
