import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, BaseEntity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import { GenerativeToken } from './GenerativeToken'
import { DateTransformer } from './Transformers/DateTransformer'
import { User } from './User'


@Entity()
@ObjectType()
export class Report extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => User, user => user.reports)
  user?: User

  @RelationId((report: Report) => report.user)
	userId: number

  @ManyToOne(() => GenerativeToken, token => token.actions, { onDelete: "CASCADE" })
  token?: GenerativeToken

  @RelationId((report: Report) => report.token)
	tokenId: number

  @Field()
  @Column({ type: 'timestamptz', transformer: DateTransformer })
  createdAt: string
}