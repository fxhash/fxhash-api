import type { ApolloServerPlugin, BaseContext } from "apollo-server-plugin-base"
import { performance } from "perf_hooks"
import { QueryMetric } from "../EntityMetrics/QueryMetric"

export const ApolloMetricsPlugin: ApolloServerPlugin<BaseContext> = {
  async requestDidStart() {
    return {
      async didResolveOperation(context) {
        // inject in the context the beginning of the performances measurements
        context.context._metricsStart = performance.now()
      },
      async willSendResponse(context) {
        // read the start timer within the context
        const duration = performance.now() - context.context._metricsStart
        QueryMetric.addMetric(context.source, context.queryHash, duration)
      }
    }
  },
}