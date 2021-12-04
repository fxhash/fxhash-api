require('dotenv').config()
import 'reflect-metadata'
import express from 'express'
import cors from "cors"
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { ResolverCollection } from './Resolver/Collection'
import { createServer } from './Server/Http'
import { ApolloServer } from 'apollo-server-express'
import { createContext } from './Utils/Context'
import { routeGraphiql } from './routes/graphiql'


const main = async () => {
  // connect to the DB
  const connection = await createConnection({
		type: process.env.DATABASE_TYPE,
		url: process.env.DATABASE_URL,
		logging: process.env.TYPEORM_LOGGING === "true",
		synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
		entities: [ process.env.TYPEORM_ENTITIES ],
		cache: {
			type: "ioredis",
			options: {
				port: process.env.REDIS_URL
			}
		},
		ssl: {
			rejectUnauthorized: false
		},
		extra: {
			rejectUnauthorized: false
		}
	})

	// now bootstrap the rest of the server (gQL API)
	const schema = await buildSchema({
		resolvers: [ ...ResolverCollection ]
	})
	const app = express()
	app.use(express.json())
	app.use(cors())
	const httpServer = createServer(app)

	// apolllo server
	const server = new ApolloServer({
		schema: schema,
		context: ({ req, res }) => createContext(req, res),
		introspection: true
	})
	await server.start()
	server.applyMiddleware({ 
		app, 
		path: '/graphql',
		cors: {
			credentials: true,
			origin: process.env.CORS_ALLOWED_ORIGINS,
		}
	})

	// graphql interface
	routeGraphiql(app)
	
	httpServer.listen(process.env.PORT, async () => {
		console.log(`--------`)
		console.log(`--------`)
		console.log(`🚀 Server running at http://localhost:${process.env.PORT}  `)
		console.log(`--------`)
		console.log(`--------`)
	})
}

main()