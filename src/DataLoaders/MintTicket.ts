import DataLoader from "dataloader"
import { MintTicket } from "../Entity/MintTicket"

/**
 * Given a list of mint ticket IDs, outputs a list of MintTicket entities
 */
const batchMintTickets = async ids => {
  const tickets = await MintTicket.createQueryBuilder("mintTicket")
    .select()
    .whereInIds(ids)
    .cache(10000)
    .getMany()

  return ids.map(id => tickets.find(t => t.id === id))
}
export const createMintTicketsLoader = () => new DataLoader(batchMintTickets)
