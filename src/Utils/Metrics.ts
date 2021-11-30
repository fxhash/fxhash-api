import { performance } from "perf_hooks"
import { v4 } from "uuid"
import { arrayRemove } from "../Utils/Array"

export interface MetricStarted {
  id: string
  name: string
  startedAt: number
  shouldSave: boolean
  end: () => void
}

class MetricsManagerClass {
  pile: MetricStarted[] = []
  logging: boolean = true //process.env.DEBUG_METRICS === "1"

  /**
   * Starts to measure a metric
   * @returns ID of generated metric
   */
  start(name: string, save: boolean = false, id?: string): MetricStarted {
    const started = performance.now()
    id = id || v4()
    const metric: MetricStarted = {
      id, 
      name,
      startedAt: started,
      shouldSave: save,
      end: () => this.end(id as string)
    }
    this.pile.push(metric)
    return metric
  }

  end = (id: string) => {
    const ended = performance.now()
    const metricStarted = this.pile.find(m => m.id === id)
    if (metricStarted) {
      arrayRemove(this.pile, metricStarted)
      const metric = {
        id: metricStarted.id,
        name: metricStarted.name,
        startedAt: metricStarted.startedAt,
        endedAt: ended
      }
      if (this.logging) {
        console.log(`⏲️  METRIC [${metric.name}]: ${metric.endedAt-metric.startedAt}ms`)
      }
    }
  }
}

export const Metrics = new MetricsManagerClass()