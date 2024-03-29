require("dotenv").config()
import "reflect-metadata"
import express from "express"
import cors from "cors"
import { buildSchema } from "type-graphql"
import { ResolverCollection } from "./Resolver/Collection"
import { createServer } from "./Server/Http"
import { ApolloServer } from "apollo-server-express"
import { createContext } from "./Utils/Context"
import { routeGraphiql } from "./routes/graphiql"
import { ApolloMetricsPlugin } from "./Plugins/MetricsPlugin"
import { routeGetHello } from "./routes/hello"
import { createConnection } from "./createConnection"
import { ScalarCollection } from "./Scalar/Collection"

const main = async () => {
  // connect to the DB
  await createConnection()

  // now bootstrap the rest of the server (gQL API)
  const schema = await buildSchema({
    resolvers: [...ResolverCollection],
    scalarsMap: [...ScalarCollection],
  })
  const app = express()
  app.use(express.json())
  app.use(cors())
  const httpServer = createServer(app)

  // increase keep live timeout for ELB
  httpServer.keepAliveTimeout = 61 * 1000
  httpServer.headersTimeout = 65 * 1000

  // define the plugins
  const plugins =
    process.env.RECORD_METRICS === "1" ? [ApolloMetricsPlugin] : []

  // apolllo server
  const server = new ApolloServer({
    schema: schema,
    context: ({ req, res }) => createContext(req, res),
    introspection: true,
    plugins: plugins,
  })
  await server.start()
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      credentials: true,
      origin: process.env.CORS_ALLOWED_ORIGINS,
    },
  })

  // graphql interface
  routeGraphiql(app)
  routeGetHello(app)

  httpServer.listen(process.env.PORT, async () => {
    console.log(`--------`)
    console.log(`--------`)
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}  `)
    console.log(`--------`)
    console.log(`--------`)
  })
}

main()
