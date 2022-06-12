import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm"
import { Article } from "./Article"
import { GenerativeToken } from "./GenerativeToken"


/**
 * Ensures the ManyToMany relationship between Articles and Generative Tokens
 */
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

  @Column({ type: "integer" })
  line: number
}