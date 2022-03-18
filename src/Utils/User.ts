import { UserAuthorization } from "../Entity/User"


type TUserAuthorizationIDS = 10 | 20 | 30

const mappingUserAuthToEnum: Record<TUserAuthorizationIDS, UserAuthorization> = {
  10: UserAuthorization.TOKEN_MODERATION,
  20: UserAuthorization.USER_MODERATION,
  30: UserAuthorization.GOVERNANCE_MODERATION,
}

/**
 * Given an authorization ID, outputs the corresponding enum value
 */
export function mapUserAuthorizationIdToEnum(auth: number): UserAuthorization {
  return mappingUserAuthToEnum[auth]
}

/**
 * Given a list of authorization IDs, outputs a corresponding list of
 * authorization enum values
 */
export function mapUserAuthorizationIdsToEnum(authIds: number[]) {
  return authIds.map(mapUserAuthorizationIdToEnum)
}