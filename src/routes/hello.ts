import { Express } from "express"

export function routeGetHello(app: Express) {
  app.get("/hello", async (req, res) => {
    res.status(200).send("hello")
  })
}