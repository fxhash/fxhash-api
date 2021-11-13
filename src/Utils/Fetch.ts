import request from 'request-promise'
import { sleep } from './Helpers'


export const fetchRetry = async (url: string, maxRetries: number = 5, delay: number = 200) => {
  let error: any
  for (let i = 0; i < maxRetries; i++) {
    try {
      const data = await request(url)
      return JSON.parse(data)
    } 
    catch (err) {
      error = err
    }
    await sleep(delay)
  }
  throw error
}