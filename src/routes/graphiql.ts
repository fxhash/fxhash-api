import { Express } from "express"
import path from "path"

export function routeGraphiql(app: Express) {
  app.get('/graphiql', function(req, res) {
    res.sendFile(path.join(__dirname, '../../public/graphiql.html'))
  })
}