import { Response } from "express"

export function sendEvent(res: Response, id: string, data: string) {
  res.write(`event: ${id}\n`)
  res.write(`data: ${data}\n\n`)
}