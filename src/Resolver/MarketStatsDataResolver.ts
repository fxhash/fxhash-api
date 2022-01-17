import { Arg, Args, Ctx, Field, FieldResolver, ObjectType, Query, Resolver, Root } from "type-graphql"
import { MarketStats } from "../Entity/MarketStats"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { StatsGenTokSortInput } from "./Arguments/Sort"

/**
 * The MarketStats resolver doesn't directly expose the MarketStats object, but exposes
 * an endpoint that facilitates access to this data through some fiels of the following
 * object
 */
@ObjectType()
class MarketStatsData {
}

@Resolver(MarketStatsData)
export class MarketStatsDataResolver {
  @Query(returns => MarketStatsData)
  marketStats() {
    return new MarketStatsData()
  }

  @FieldResolver(returns => [MarketStats], { nullable: true })
  generativeTokens(
    @Args() { skip, take }: PaginationArgs,
    @Arg("sort", { nullable: true }) sort: StatsGenTokSortInput,
  ) {
    // default arguments
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				secVolumeTz: "DESC"
			}
		}
		[skip, take] = useDefaultValues([skip, take], [0, 20])

    let query = MarketStats.createQueryBuilder("stat")
      .select()

    // add the sort arguments
		for (const field in sort) {
			query = query.addOrderBy(`stat.${field}`, sort[field], "NULLS LAST")
		}

    // add pagination
    query = query.skip(skip)
    query = query.take(take)

    // cache
    // query = query.cache(100000) // 100 sec

    return query.getMany()
  }
}