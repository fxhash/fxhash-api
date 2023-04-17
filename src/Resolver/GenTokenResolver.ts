import { ApolloError } from "apollo-server-errors"
import { GraphQLJSONObject } from "graphql-type-json"
import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql"
import { Action, FiltersAction } from "../Entity/Action"
import { ArticleGenerativeToken } from "../Entity/ArticleGenerativeToken"
import { Codex } from "../Entity/Codex"
import {
  GenerativeFilters,
  GenerativeToken,
  GenTokFlag,
} from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { MarketStatsHistory } from "../Entity/MarketStatsHistory"
import { MediaImage } from "../Entity/MediaImage"
import {
  FiltersMintTicket,
  MintTicket,
  MintTicketState,
} from "../Entity/MintTicket"
import { MintTicketSettings } from "../Entity/MintTicketSettings"
import { ModerationReason } from "../Entity/ModerationReason"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { FiltersOffer, Offer } from "../Entity/Offer"
import { PricingDutchAuction } from "../Entity/PricingDutchAuction"
import { PricingFixed } from "../Entity/PricingFixed"
import { Redeemable } from "../Entity/Redeemable"
import { Report } from "../Entity/Report"
import { Reserve } from "../Entity/Reserve"
import { Split } from "../Entity/Split"
import { User } from "../Entity/User"
import { generativeQueryFilter } from "../Query/Filters/GenerativeToken"
import { mintTicketQueryFilter } from "../Query/Filters/MintTicket"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { FeatureFilter } from "./Arguments/Filter"
import { MarketStatsHistoryInput } from "./Arguments/MarketStats"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import {
  ActionsSortInput,
  defaultSort,
  GenerativeSortInput,
  MintTicketSortInput,
  ObjktsSortInput,
  OffersSortInput,
} from "./Arguments/Sort"
import { AnyOfferUnion } from "../types/AnyOffer"
import { CollectionOffer } from "../Entity/CollectionOffer"

@Resolver(GenerativeToken)
export class GenTokenResolver {
  @FieldResolver(returns => String, {
    description:
      "The address of the issuer contract that this token was issued from.",
  })
  issuerContractAddress(@Root() token: GenerativeToken) {
    return token.version === GenerativeTokenVersion.V3
      ? process.env.TZ_CT_ADDRESS_ISSUER_V3
      : process.env.TZ_CT_ADDRESS_ISSUER_V2
  }

  @FieldResolver(returns => Codex, {
    description: "The Codex of the token.",
  })
  codex(@Root() token: GenerativeToken, @Ctx() ctx: RequestContext) {
    return (
      token.codex ||
      ctx.genTokCodexLoader.load({
        id: token.id,
        version: token.version,
      })
    )
  }

  @FieldResolver(returns => [Objkt], {
    description:
      "Get the unique iterations generated from the Generative Token. This is the go-to endpoint to get the gentks as it's the most optimized and is built to support sort and filter options.",
  })
  async objkts(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
    @Arg("featureFilters", type => [FeatureFilter], { nullable: true })
    featureFilters: FeatureFilter[],
    @Arg("sort", { nullable: true }) sort: ObjktsSortInput,
    @Args() { skip, take }: PaginationArgs
  ) {
    // defaults
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        iteration: "ASC",
      }
    }
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])

    // we parse the feature filters
    if (token.objkts) return token.objkts
    return ctx.genTokObjktsLoader.load({
      id: token.id,
      filters,
      featureFilters,
      sort,
      skip,
      take,
    })
  }

  @FieldResolver(returns => MediaImage, {
    description:
      "The media entity associated with the capture image taken by the artists, provides additional informations on the capture such as resolution, base64 placeholder and mime type.",
    nullable: true,
  })
  captureMedia(@Root() token: GenerativeToken, @Ctx() ctx: RequestContext) {
    if (!token.captureMediaId) return null
    if (token.captureMedia) return token.captureMedia
    return ctx.mediaImagesLoader.load(token.captureMediaId)
  }

  @FieldResolver(returns => [Objkt], {
    description:
      "The whole gentks belonging to the Generative Token. **This endpoint must be used with moderation as the fetch can be expensive if ran on many Generative Tokens**.",
  })
  async entireCollection(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    if (token.objkts) return token.objkts
    return ctx.genTokObjktsLoader.load({ id: token.id })
  }

  @FieldResolver(returns => [Objkt], {
    description:
      "The list of gentks on which a listing is currently active. *Due to some optimization factors, this endpoint can't be called on multiple Generative Tokens at once*.",
  })
  async activeListedObjkts(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sort: ObjktsSortInput,
    @Args() { skip, take }: PaginationArgs
  ) {
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])
    // we force the filter to have an existing activeListing
    filters = {
      ...filters,
      activeListing_exist: true,
    }
    if (token.objkts) return token.objkts
    return ctx.genTokObjktsLoader.load({
      id: token.id,
      filters,
      sort,
      skip,
      take,
    })
  }

  @FieldResolver(() => [Offer], {
    description:
      "Returns a list of offers on individual gentks associated with a collection",
  })
  offers(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", FiltersOffer, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sort: OffersSortInput
  ) {
    // default sort
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        createdAt: "DESC",
      }
    }

    return ctx.genTokOffersLoader.load({
      id: token.id,
      filters: filters,
      sort: sort,
    })
  }

  @FieldResolver(() => [CollectionOffer], {
    description: "Returns a list of collection offers for the token",
  })
  collectionOffers(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", FiltersOffer, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sort: OffersSortInput
  ) {
    // default sort
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        createdAt: "DESC",
      }
    }

    return ctx.genTokCollectionOffersLoader.load({
      id: token.id,
      filters: filters,
      sort: sort,
    })
  }

  @FieldResolver(returns => [AnyOfferUnion], {
    description:
      "Returns all the offers and collection offers associated with a generative token",
  })
  allOffers(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", FiltersOffer, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sort: OffersSortInput
  ) {
    // default sort
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        createdAt: "DESC",
      }
    }

    return ctx.genTokOffersAndCollectionOffersLoader.load({
      id: token.id,
      filters: filters,
      sort: sort,
    })
  }

  /**
   * Pricing resolvers.
   * Generative Tokens can have different pricing strategy, each one is stored
   * in its own table and responds to its own logic. At least one of the pricing
   * fields should be defined for a token
   */
  @FieldResolver(returns => PricingFixed, {
    description:
      "The PricingFixed entity associated with the Generative Token. *It can be null if the Generative Token uses a different pricing strategy*.",
    nullable: true,
  })
  async pricingFixed(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return token.pricingFixed || ctx.gentkTokPricingFixedLoader.load(token.id)
  }

  @FieldResolver(returns => PricingDutchAuction, {
    description:
      "The PricingDutchAuction entity associated with the Generative Token. *It can be null if the Generative Token uses a different pricing strategy*.",
    nullable: true,
  })
  async pricingDutchAuction(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return (
      token.pricingDutchAuction ||
      ctx.gentkTokPricingDutchAuctionLoader.load(token.id)
    )
  }

  @FieldResolver(returns => [Split], {
    description: "The list of splits on the primary market",
  })
  async splitsPrimary(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.gentTokSplitsPrimaryLoader.load(token.id)
  }

  @FieldResolver(returns => [Split], {
    description: "The list of splits on the secondary market",
  })
  async splitsSecondary(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.gentTokSplitsSecondaryLoader.load(token.id)
  }

  @FieldResolver(returns => [Reserve], {
    description:
      "The reserves of the Generative Token. Artists can define reserves to control the distribution of their tokens.",
  })
  reserves(@Root() token: GenerativeToken, @Ctx() ctx: RequestContext) {
    return ctx.genTokReservesLoader.load(token.id)
  }

  @FieldResolver(returns => Number, {
    description: "The number of objkts generated by the Generative Token",
  })
  async objktsCount(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.genTokObjktsCountLoader.load(token.id)
  }

  @FieldResolver(() => [Redeemable], {
    description:
      "A list of Redeemable Smart Contracts associated with this token",
  })
  async redeemables(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    if (token.redeemables) return token.redeemables
    return ctx.genTokRedeemablesLoader.load(token.id)
  }

  @FieldResolver(returns => [Report], {
    description: "A list of the reports made on the Generative Token",
  })
  reports(@Root() token: GenerativeToken, @Ctx() ctx: RequestContext) {
    if (token.reports) return token.reports
    return ctx.genTokReportsLoader.load(token.id)
  }

  @FieldResolver(returns => User, {
    description:
      "The account who authored the Generative Token. Due to how collaborations are handled, it is also required to fetch the eventual collaborators on the account to know if it's a single or multiple authors.",
  })
  author(@Root() token: GenerativeToken, @Ctx() ctx: RequestContext) {
    if (token.author) return token.author
    return ctx.usersLoader.load(token.authorId)
  }

  @FieldResolver(returns => [Action], {
    description:
      "A list of all the actions related to the Generative Token. **Not optimized to be run on multiple generative tokens at once, please use carefully*.",
  })
  actions(
    @Root() token: GenerativeToken,
    @Arg("filters", FiltersAction, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sortArgs: ActionsSortInput,
    @Args() { skip, take }: PaginationArgs
  ): Promise<Action[]> {
    // default arguments
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])
    sortArgs = defaultSort(sortArgs, {
      createdAt: "DESC",
    })

    // create the query
    let query = Action.createQueryBuilder("action").select()

    // add the generic filters
    query.where(processFilters(filters))

    // add the filters to target the token only
    query.andWhere("action.tokenId = :id", {
      id: token.id,
    })

    // add the sort arguments
    for (const sort in sortArgs) {
      query.addOrderBy(`action.${sort}`, sortArgs[sort])
    }

    // add pagination
    query.skip(skip)
    query.take(take)

    return query.getMany()
  }

  @FieldResolver(returns => MarketStats, {
    nullable: true,
    description:
      "The pre-computed marketstats of the Generative Token. *Please note that those stats may not be in perfect sync with up-to-date data due to optimization reasons*. Please refer to the **{ to }** field to see when the data was last computed.",
  })
  async marketStats(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ): Promise<MarketStats> {
    if (token.marketStats) return token.marketStats
    return ctx.genTokMarketStatsLoader.load(token.id)
  }

  @FieldResolver(returns => [MarketStatsHistory], {
    description:
      "The history of the market stats over time. Can be used to build **GGGG-G-GG-GGGRAPH**",
  })
  async marketStatsHistory(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", { nullable: false }) filters: MarketStatsHistoryInput
  ) {
    return ctx.genTokMarketStatsHistoryLoader.load({
      id: token.id,
      from: filters.from,
      to: filters.to,
    })
  }

  @FieldResolver(returns => [GraphQLJSONObject], {
    nullable: true,
    description:
      "**[HEAVY - please no abuse]** Returns a list of the different features and their possible values",
  })
  async features(@Root() token: GenerativeToken, @Ctx() ctx: RequestContext) {
    return ctx.genTokObjktFeaturesLoader.load(token.id)
  }

  @FieldResolver(returns => [ArticleGenerativeToken], {
    description: "The Articles in which this Generative Token is mentionned",
  })
  async articleMentions(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.genTokArticleMentionsLoader.load(token.id)
  }

  @FieldResolver(returns => String, {
    nullable: true,
    description:
      "If any, returns the moderation reason associated with the Generative Token",
  })
  async moderationReason(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    if (token.moderationReasonId == null) return null
    if (token.moderationReason) return token.moderationReason
    return ctx.moderationReasonsLoader.load(token.moderationReasonId)
  }

  @Query(returns => [GenerativeToken], {
    description:
      "Generic endpoint to query the Generative Tokens. Go-to endpoint to explore the Generative Tokens published on the platform, requires pagination and provides sort and filter options. *Flagged tokens are NOT excluded by this endpoint*.",
  })
  async generativeTokens(
    @Args() { skip, take }: PaginationArgs,
    @Arg("sort", { nullable: true }) sortArgs: GenerativeSortInput,
    @Arg("filters", GenerativeFilters, { nullable: true }) filters: any
  ): Promise<GenerativeToken[]> {
    // default arguments
    if (!sortArgs || Object.keys(sortArgs).length === 0) {
      sortArgs = {
        mintOpensAt: "DESC",
      }
    }
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])

    let query = GenerativeToken.createQueryBuilder("token").select()

    // apply the filters/sort
    query = await generativeQueryFilter(query, filters, sortArgs)

    // add pagination
    query.take(take)
    query.skip(skip)

    return query.getMany()
  }

  @Query(returns => GenerativeToken, {
    nullable: true,
    description:
      "Get a Generative Token by its ID or SLUG. One of those 2 must be provided for the endpoint to perform a search in the DB.",
  })
  async generativeToken(
    @Arg("id", { nullable: true }) id: number,
    @Arg("slug", { nullable: true }) slug: string
  ): Promise<GenerativeToken | undefined> {
    if (id == null && slug == null) {
      throw new ApolloError("Either ID or SLUG must be supllied.")
    }
    if (id != null) {
      return GenerativeToken.findOne(id)
    } else {
      return GenerativeToken.findOne({
        where: { slug },
      })
    }
  }

  @Query(returns => GenerativeToken, {
    nullable: true,
    description:
      "Returns a random Generative Token among all the available Generative Tokens. This implementation does not guarantee that a Generative Token will be outputted altough the chances for a NULL value to be returned are really low.",
  })
  async randomGenerativeToken(): Promise<GenerativeToken | undefined> {
    const highest = await GenerativeToken.createQueryBuilder("token")
      .orderBy("token.id", "DESC")
      .limit(1)
      .getOne()
    const count = highest?.id
    let token: GenerativeToken | undefined = undefined
    if (count) {
      let id: number
      let i = 0
      while (
        !token ||
        (token.flag !== GenTokFlag.CLEAN &&
          token.flag !== GenTokFlag.NONE &&
          token.flag !== undefined)
      ) {
        id = (Math.random() * count) | 0
        // figure out how to return different token versions with equal probability
        token = await GenerativeToken.findOne({ id })
        if (++i > 6) {
          return undefined
        }
      }
    }
    return token
  }

  @Query(returns => GenerativeToken, {
    description:
      "Returns a random Generative Token among the 20 most successful tokens by tezos volume on the marketplace in the last 24h",
  })
  async randomTopGenerativeToken(): Promise<GenerativeToken> {
    const stats = await MarketStats.createQueryBuilder("stat")
      .leftJoinAndSelect("stat.token", "token")
      .addOrderBy("stat.secVolumeTz24", "DESC")
      .limit(20)
      .getMany()
    return stats[Math.floor(Math.random() * stats.length)].token
  }

  @FieldResolver(returns => MintTicketSettings, {
    description: "The settings for the mint tickets of a Generative Token.",
    nullable: true,
  })
  async mintTicketSettings(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    // if the token doesn't have an inputBytesSize, it won't have mint tickets
    if (!token.inputBytesSize) return null
    if (token.mintTicketSettings) return token.mintTicketSettings
    return ctx.genTokMintTicketSettingsLoader.load(token.id)
  }

  @FieldResolver(returns => [MintTicket], {
    description: "Get the unique mint tickets for a Generative Token.",
  })
  async mintTickets(
    @Root() token: GenerativeToken,
    @Ctx() ctx: RequestContext,
    @Arg("filters", FiltersMintTicket, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sort: MintTicketSortInput,
    @Args() { skip, take }: PaginationArgs
  ) {
    // if the token doesn't have an inputBytesSize, it won't have mint tickets
    if (!token.inputBytesSize) return []

    // defaults
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        id: "ASC",
      }
    }
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])

    // build the mint ticket query
    let query = MintTicket.createQueryBuilder("mintTicket")
      .select()
      .where("mintTicket.state != :state", { state: MintTicketState.CONSUMED })

    // add the filters to target the token only
    query.andWhere("mintTicket.tokenId = :id", {
      id: token.id,
    })

    // we apply the filters and the sort arguments
    query = await mintTicketQueryFilter(query, filters, sort)

    // add pagination
    query.take(take)
    query.skip(skip)

    return query.getMany()
  }

  @FieldResolver(returns => Boolean, {
    nullable: true,
    description: "Whether the supplied address holds a gentk for this token.",
  })
  async isHolder(
    @Root() token: GenerativeToken,
    @Arg("userId", _type => String, { nullable: true }) userId: string
  ) {
    if (!userId) return null

    const gentksHeldForCollectionCount = await Objkt.createQueryBuilder("objkt")
      .select()
      .where("objkt.issuerId = :tokenId", { tokenId: token.id })
      .andWhere("objkt.ownerId = :userId", { userId })
      .getCount()

    return gentksHeldForCollectionCount > 0
  }
}
