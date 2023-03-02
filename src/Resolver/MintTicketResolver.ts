import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { FiltersMintTicket, MintTicket } from "../Entity/MintTicket"
import { MintTicketSettings } from "../Entity/MintTicketSettings"
import { User } from "../Entity/User"
import { mintTicketQueryFilter } from "../Query/Filters/MintTicket"
import { TokenId } from "../Scalar/TokenId"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { MintTicketSortInput } from "./Arguments/Sort"

const TAX_FEES = 14 / 1000

@Resolver(MintTicket)
export class MintTicketResolver {
  @FieldResolver(returns => GenerativeToken)
  token(@Root() mintTicket: MintTicket, @Ctx() ctx: RequestContext) {
    return (
      mintTicket.token ||
      ctx.genTokLoader.load(
        new TokenId({
          id: mintTicket.tokenId,
          version: mintTicket.tokenVersion,
        })
      )
    )
  }

  @FieldResolver(returns => User)
  owner(@Root() mintTicket: MintTicket, @Ctx() ctx: RequestContext) {
    return mintTicket.owner || ctx.usersLoader.load(mintTicket.ownerId)
  }

  @FieldResolver(returns => MintTicketSettings)
  settings(@Root() mintTicket: MintTicket, @Ctx() ctx: RequestContext) {
    return ctx.genTokMintTicketSettingsLoader.load(
      new TokenId({
        id: mintTicket.tokenId,
        version: mintTicket.tokenVersion,
      })
    )
  }

  @FieldResolver(returns => Date)
  async taxationPaidUntil(
    @Root() { price, taxationLocked, taxationStart }: MintTicket
  ) {
    const numberOfDaysCovered = Number(taxationLocked) / (TAX_FEES * price)
    return new Date(
      taxationStart.getTime() + numberOfDaysCovered * 24 * 60 * 60 * 1000
    )
  }

  @Query(returns => MintTicket, {
    nullable: true,
    description: "Get a Mint Ticket by its ID",
  })
  async mintTicket(@Arg("id") id: number): Promise<MintTicket | undefined> {
    return MintTicket.findOne(id)
  }

  @Query(returns => [MintTicket], {
    description:
      "Generic endpoint to query Mint Tickets, requires pagination and provides sort and filter options.",
  })
  async mintTickets(
    @Args() { skip, take }: PaginationArgs,
    @Arg("sort", { nullable: true }) sort: MintTicketSortInput,
    @Arg("filters", FiltersMintTicket, { nullable: true }) filters: any
  ): Promise<MintTicket[]> {
    // default arguments
    if (!sort || Object.keys(sort).length === 0) {
      sort = {
        id: "ASC",
      }
    }
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])

    let query = MintTicket.createQueryBuilder("mintTicket").select()

    // apply the filters/sort
    query = await mintTicketQueryFilter(query, filters, sort)

    // add pagination
    query.take(take)
    query.skip(skip)

    return query.getMany()
  }
}
