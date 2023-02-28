import DataLoader from "dataloader"
import { MarketStats } from "../Entity/MarketStats"
import { TokenId } from "../Scalar/TokenId"

/**
 * Given a list of MarketStats ids, returns a list of Generative Tokens
 * associated
 */
const batchMarketStatsGenToken = async (ids: readonly TokenId[]) => {
  const stats = await MarketStats.createQueryBuilder("stat")
    .select("stat.id")
    .whereInIds(ids)
    .leftJoinAndSelect("stat.token", "token")
    .getMany()

  return ids.map(
    ({ id, version }) =>
      stats.find(stat => stat.tokenId === id && stat.tokenVersion === version)
        ?.token
  )
}
export const createMarketStatsGenTokLoader = () =>
  new DataLoader(batchMarketStatsGenToken)
