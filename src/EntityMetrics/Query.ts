import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, OneToMany } from 'typeorm'
import { QueryMetric } from './QueryMetric'

@Entity()
export class Query {
  // the hash of the query
  @PrimaryColumn()
  hash: string

  // the query itself
  @Column()
  query: string

  @OneToMany(() => QueryMetric, metric => metric.query)
  metrics: QueryMetric[]
}