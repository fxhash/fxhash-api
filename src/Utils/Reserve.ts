import { EReserveMethod } from "../Entity/Reserve"


type TReserveMethodIDS = 0 | 1

const mappingReserveMethodsToEnum: Record<TReserveMethodIDS, EReserveMethod> = {
  0: EReserveMethod.WHITELIST,
  1: EReserveMethod.TOKEN_STAKERS,
}

/**
 * Given a Reserve Method ID, outputs the corresponding enum value
 */
export function mapReserveMethodIdToEnum(method: number): EReserveMethod {
  return mappingReserveMethodsToEnum[method]
}