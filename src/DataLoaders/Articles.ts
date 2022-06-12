import DataLoader from "dataloader"
import { In } from "typeorm"
import { ArticleLedger } from "../Entity/ArticleLedger"

/**
 * Given a list of article IDs, outputs their list of ledgers.
 */
const batchArticlesLedgers = async (ids): Promise<ArticleLedger[][]> => {
  const ledgers = await ArticleLedger.find({
    where: {
      articleId: In(ids)
    }
  })
  return ids.map(
    id => ledgers.filter(
      ledger => ledger.articleId === id
    )
  )
}
export const createArticlesLedgersLoader = () => new DataLoader(
	batchArticlesLedgers
)