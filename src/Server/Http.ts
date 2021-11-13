import { createServer as createHttpsServer } from "https"
import { createServer as createHttpServer, RequestListener } from "http"
import fs from "fs"

export const createServer = process.env.NODE_ENV === "dev" 
?
	(app: RequestListener) => createHttpsServer({
		key: fs.readFileSync(".ssl/server.key"),
		cert: fs.readFileSync(".ssl/server.crt"),
	}, app)
:
	(app: RequestListener) => createHttpServer(app)