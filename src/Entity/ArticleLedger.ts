import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryColumn } from "typeorm"
import { Article } from "./Article"
import { User } from "./User"

@Entity()
@ObjectType({
  description: "Articles are semi-fungible FA2 assets, and as such different editions can be owned by different owners. This Object represents an article's on chain ledger."
})
export class ArticleLedger extends BaseEntity {
  @ManyToOne(() => Article, article => article.ledgers)
  article: Article

  @Index()
  @PrimaryColumn()
  articleId: number

  @ManyToOne(() => User, user => user.articlesLedger)
  owner: User

  @Index()
  @PrimaryColumn()
  ownerId: string

  @Field({
    description: "Amount of editions owned."
  })
  @Column({ type: "integer" })
  amount: number
}