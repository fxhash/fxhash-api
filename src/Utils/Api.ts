/**
 * Utility wrappers to simplify the usage of tztk.io API
 */

const API_ROOT = process.env.TZTK_API_ROOT

export const API_CONTRACT = (address: string) => `${API_ROOT}contracts/${address}`

export const API_CONTRACT_UPDATE = (hash: string, level: number) => 
  `${API_ROOT}bigmaps/updates?contract=${hash}&level.gt=${level}&sort.asc=id`
export const API_PROTOCOL = `${API_ROOT}protocols/current`
export const API_HEAD = `${API_ROOT}head`

// get the Gentk mint transaction
export const API_GENTK_MINT_TRANSACTION = (id: number) =>
  `${API_ROOT}operations/transactions?target=${process.env.TZ_CT_ADDRESS_OBJKT}&entrypoint=mint&parameter.token_id=${id}`

// get the Gentk metadata assign transaction
export const API_GENTK_ASSIGN_TRANSACTION = (id: number) =>
  `${API_ROOT}operations/transactions?target=${process.env.TZ_CT_ADDRESS_OBJKT}&entrypoint=assign_metadata&parameter.token_id=${id}`

// get an operation by its hash
export const API_OPERATION_BY_HASH = (hash: string) =>
  `${API_ROOT}operations/${hash}`

export const API_GENTK_GENERATE_METADATA = `${process.env.API_FILE_ROOT}gentk-metadata`