import { ObjktId } from "../Scalar/ObjktId"

/**
 * Given a list of ObjktIds, outputs a list of tuples of the form
 * (id, version) that can be used in a SQL query.
 */
export const formatObjktIdTuples = (ids: readonly ObjktId[]) =>
  ids.map(({ id, issuerVersion }) => `(${id}, '${issuerVersion}')`)

/**
 * Given a list of ObjktIds, outputs a SQL query that can be used to filter
 * entities by their objkt ID and issuerVersion.
 */
export const matchesEntityObjktIdAndIssuerVersion = (
  ids: readonly ObjktId[],
  entityName: string,
  idFieldName = "objkt",
  versionFieldName = idFieldName
) =>
  `(${entityName}."${idFieldName}Id", ${entityName}."${versionFieldName}IssuerVersion") IN (${formatObjktIdTuples(
    ids
  )})`
