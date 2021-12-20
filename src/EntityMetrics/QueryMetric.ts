import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, RelationId, getRepository, getConnection } from 'typeorm'
import { Query } from './Query'

@Entity()
export class QueryMetric {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "integer" })
  time: number

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: string

  @ManyToOne(() => Query, query => query.metrics)
  query?: Query

  @RelationId((metric: QueryMetric) => metric.query)
	queryId: number

  static async addMetric(query: string, queryHash: string, time: number) {
    const connection = getConnection("metrics")

    // get the query for which we have a metric
    let queryEnt = await connection.getRepository(Query).findOne({ hash: queryHash })
    // if no query, register it
    if (!queryEnt) {
      queryEnt = connection.getRepository(Query).create({
        hash: queryHash,
        query: query,
      })
      await connection.getRepository(Query).save(queryEnt)
    }
    // save the metric
    const metric = connection.getRepository(QueryMetric).create({
      query: queryEnt,
      time: time|0,
    })
    connection.getRepository(QueryMetric).save(metric)
  }
}