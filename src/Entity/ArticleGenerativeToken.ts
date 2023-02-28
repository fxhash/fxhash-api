import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
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

  @PrimaryColumn({
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  generativeTokenVersion: GenerativeTokenVersion

  @Field({
    description:
      "The line in the Markdown file at which the Generative Token is linked by the article.",
  })
  @Column({ type: "integer" })
  line: number
}
