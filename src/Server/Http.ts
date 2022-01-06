import { createServer as createHttpsServer } from "https"
import { createServer as createHttpServer, RequestListener } from "http"
import fs from "fs"

export const createServer = (app: RequestListener) => createHttpServer(app)