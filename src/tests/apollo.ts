import "reflect-metadata"

import { ApolloServer } from "apollo-server"
import { buildSchema } from "type-graphql"
import { ResolverCollection } from "../Resolver/Collection"
import { ScalarCollection } from "../Scalar/Collection"
import { createContext } from "../Utils/Context"

export const createTestServer = async () => {
  const schema = await buildSchema({
    resolvers: [...ResolverCollection],
    scalarsMap: [...ScalarCollection],
  })

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => createContext(req, res),
  })
  return server
}
