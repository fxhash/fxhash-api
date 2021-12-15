import { Max, Min } from "class-validator"
import { ArgsType, Field, Int } from "type-graphql"


@ArgsType()
export class PaginationArgs {
	@Field(type => Int, { defaultValue: 0 })
	@Min(0)
	skip: number

	@Field(type => Int, { defaultValue: 20 })
	@Min(1)
	@Max(50)
	take: number
}