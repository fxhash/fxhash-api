import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from "typeorm"
import { Article } from "./Article"
import { GenerativeToken } from "./GenerativeToken"

/**
 * Ensures the ManyToMany relationship between Articles and Generative Tokens
 */
@ObjectType({
  description:
    "Maps articles with Generative Tokens when they're mentionned in an article.",
})
@Entity()
export class ArticleGenerativeToken extends BaseEntity {
  @OneToMany(() => Article, article => article.generativeTokenJointures)
  article: Article

  @Index()
  @PrimaryColumn()
  articleId: number

  @OneToMany(() => GenerativeToken, token => token.articleJointures)
  generativeToken: GenerativeToken

  @Index()
  @PrimaryColumn()
  generativeTokenId: number

  @Field({
    description:
      "The line in the Markdown file at which the Generative Token is linked by the article.",
  })
  @Column({ type: "integer" })
  line: number
}
