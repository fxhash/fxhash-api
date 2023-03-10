import DataLoader from "dataloader"
import { MarketStats } from "../Entity/MarketStats"

/**
 * Given a list of MarketStats ids, returns a list of Generative Tokens
 * associated
 */
const batchMarketStatsGenToken = async ids => {
  const stats = await MarketStats.createQueryBuilder("stat")
    .select()
    .whereInIds(ids)
    .leftJoinAndSelect("stat.token", "token")
    .getMany()

  return ids.map(id => stats.find(stat => stat.tokenId === id)?.token)
}
export const createMarketStatsGenTokLoader = () =>
  new DataLoader(batchMarketStatsGenToken)
