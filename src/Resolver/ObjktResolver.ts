import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from "type-graphql"
import { ApolloError } from "apollo-server-express"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Listing } from "../Entity/Listing"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { Split } from "../Entity/Split"
import { FiltersOffer, Offer } from "../Entity/Offer"
import { objktQueryFilter } from "../Query/Filters/Objkt"
import { ObjktsSortInput, OffersSortInput } from "./Arguments/Sort"
import { MediaImage } from "../Entity/MediaImage"
import { Redemption } from "../Entity/Redemption"
import { Redeemable } from "../Entity/Redeemable"
import { ObjktId } from "../Scalar/ObjktId"
import { fetchRetry } from "../Utils/Fetch"

const GENTK_CONTRACT_VERSION_MAP = {
  [0]: process.env.TZ_CT_ADDRESS_GENTK_V1,
  [1]: process.env.TZ_CT_ADDRESS_GENTK_V2,
  [2]: process.env.TZ_CT_ADDRESS_GENTK_V3,
}

@Resolver(Objkt)
export class ObjktResolver {
  @FieldResolver(returns => ObjktId, {
    description: "The unique identifier of the objkt.",
  })
  id(@Root() objkt: Objkt) {
    return new ObjktId(objkt)
  }

  @FieldResolver(returns => Int, {
    description: "The on-chain id of the gentk for passing to contract calls.",
  })
  onChainId(@Root() objkt: Objkt) {
    return objkt.id
  }

  @FieldResolver(returns => String, {
    description:
      "The hash which represents the seed used by the Generative Token to generate the unique output",
    nullable: true,
  })
  async generationHash(@Root() objkt: Objkt) {
    if (objkt.generationHash) return objkt.generationHash
    try {
      const { finalSeedBase58check } = await fetchRetry(
        `${process.env.SEED_AUTHORITY_API}/seed/gentk/${objkt.version}/${objkt.id}`
      )
      return finalSeedBase58check
    } catch (_) {
      // we shouldn't reach this, but if we do we have no generation hash to return
      return null
    }
  }

  @FieldResolver(returns => String, {
    description:
      "The address of the gentk contract that this gentk was minted on.",
  })
  gentkContractAddress(@Root() objkt: Objkt) {
    return GENTK_CONTRACT_VERSION_MAP[objkt.version]
  }

  @FieldResolver(returns => Int, {
    description: "The last price this gentk was sold for.",
    nullable: true,
  })
  lastSoldPrice(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    return ctx.objktLastSoldPriceLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => User, {
    description:
      "The current owner of this gentk. The fxhash marketplace contracts are ignored when there's a transfer of ownerhsip to their contracts.",
  })
  owner(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.owner) return objkt.owner
    return ctx.usersLoader.load(objkt.ownerId)
  }

  @FieldResolver(returns => User, {
    description: "The user who originally minted this gentk.",
  })
  minter(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.minter) return objkt.minter
    return ctx.usersLoader.load(objkt.minterId)
  }

  @FieldResolver(returns => GenerativeToken, {
    description: "The generative token from which this gentk was generated.",
  })
  issuer(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.issuer) return objkt.issuer
    return ctx.genTokLoader.load(objkt.issuerId)
  }

  @FieldResolver(returns => [Split], {
    description: "A list of the royalties split for this gentk.",
  })
  royaltiesSplit(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.royaltiesSplit) return objkt.royaltiesSplit
    return ctx.objktRoyaltiesSplitsLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => [Listing], {
    nullable: true,
    description:
      "All the listings for the gentk. Includes all the listings related to the gentk, even those which were cancelled / accepted.",
  })
  listings(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    return ctx.objktListingsLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => Listing, {
    nullable: true,
    description: "The Listing currently active for the gentk, if any.",
  })
  activeListing(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    return ctx.objktActiveListingsLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => MediaImage, {
    description:
      "The media entity associated with the capture image taken by signer module, provides additional informations on the capture such as resolution, base64 placeholder and media type.",
    nullable: true,
  })
  captureMedia(@Root() token: Objkt, @Ctx() ctx: RequestContext) {
    if (!token.captureMediaId) return null
    if (token.captureMedia) return token.captureMedia
    return ctx.mediaImagesLoader.load(token.captureMediaId)
  }

  @FieldResolver(returns => [Offer], {
    nullable: true,
    description: "All the offers for this gentk. Can be filtered.",
  })
  offers(
    @Root() objkt: Objkt,
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

    return ctx.objktOffersLoader.load({
      ...new ObjktId(objkt),
      filters: filters,
      sort: sort,
    })
  }

  @FieldResolver(returns => [Action], {
    description:
      "The full history of the actions related to the gentk. **Note: this is not optimized for being run on multiple gentks at once, please run it only on endpoints who fetch a single gentk**.",
  })
  actions(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.actions) return objkt.actions
    return ctx.objktActionsLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => [Redemption], {
    description:
      "All the single redemption events which occured on this gentk.",
  })
  redemptions(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.redemptions) return objkt.redemptions
    return ctx.objktRedemptionsLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => [Redeemable], {
    description:
      "A list of the Redeemables for which the token can be redeemed",
  })
  availableRedeemables(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    if (objkt.issuer && objkt.issuer.redeemables?.length === 0) return []
    return ctx.objktAvailableRedeemablesLoader.load(new ObjktId(objkt))
  }

  @FieldResolver(returns => Number)
  async mintedPrice(@Root() objkt: Objkt, @Ctx() ctx: RequestContext) {
    return ctx.objktMintedPriceLoader.load(new ObjktId(objkt))
  }

  @Query(returns => [Objkt], {
    description: "Generic paginated endpoint to query the gentks. Filtrable.",
  })
  async objkts(
    @Args() { skip, take }: PaginationArgs,
    @Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
    @Arg("sort", { nullable: true }) sort: ObjktsSortInput
  ): Promise<Objkt[]> {
    // default pagination
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])
    // default sort
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        id: "DESC",
      }
    }

    let query = Objkt.createQueryBuilder("objkt")
      .select()
      .leftJoin("objkt.issuer", "issuer")

    // FILTER
    query = await objktQueryFilter(
      query,
      {
        general: filters,
      },
      sort
    )

    // pagination
    query.skip(skip)
    query.take(take)

    return query.getMany()
  }

  @Query(returns => Objkt, {
    nullable: true,
    description:
      "Endpoint to query a single gentk, using different trivial search criteria (id, hash or slug).",
  })
  async objkt(
    @Arg("id", { nullable: true }) id: ObjktId,
    @Arg("hash", { nullable: true }) hash: string,
    @Arg("slug", { nullable: true }) slug: string
  ): Promise<Objkt | undefined> {
    if (id == null && hash == null && slug == null) return undefined
    let args: Record<string, any> = {}
    if (!(id == null)) {
      args.id = id.id
      args.issuerVersion = id.issuerVersion
    }
    if (!(hash == null)) args.generationHash = hash
    if (!(slug == null)) args.slug = slug
    return Objkt.findOne({
      where: args,
      // cache: 10000
    })
  }

  @Query(returns => String, {
    description:
      "Endpoint to reveal the seed of a gentk from the hash of the mint transaction.",
  })
  async reveal(@Arg("hash") hash: string): Promise<string> {
    try {
      const response = await fetchRetry(
        `${process.env.SEED_AUTHORITY_API}/seed/${hash}`
      )
      return response.finalSeed.b58
    } catch (err: any) {
      console.error(err)
      throw new ApolloError(
        `Failed to fetch the seed. Error: ${err?.message ?? "Unknown"}`
      )
    }
  }
}
