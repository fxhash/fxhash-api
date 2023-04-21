import DataLoader from "dataloader"
import { ModerationReason } from "../Entity/ModerationReason"


/**
 * Given a list of ModerationReason string IDs, outputs a list of Moderation
 * Reasons corresponding to those IDs.
 */
const batchModerationReasons = async (ids) => {
  const reasons = await ModerationReason.createQueryBuilder("reason")
    .select()
    .whereInIds(ids)
    .getMany()

  return ids.map(
    id => reasons.find(reason => reason.id === id)?.reason || null
  )
}
export const createModerationReasonsLoader = () => new DataLoader(
  batchModerationReasons
)