declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string
			PORT: number

			FRONT_URL: string
			CORS_ALLOWED_ORIGINS: string

			DATABASE_TYPE: "postgres"
			DATABASE_URL: string
			DATABASE_METRICS_URL: string

			TYPEORM_SYNCHRONIZE: string
			TYPEORM_LOGGING: string
			TYPEORM_ENTITIES: string
			TYPEORM_ENTITIES_METRICS: string

			RECORD_METRICS: "0" | "1"

			REDIS_URL?: string

			ALGOLIA_APP_ID: string
			ALGOLIA_SEARCH_KEY: string
			ALGOLIA_INDEX_GENERATIVE: string
			ALGOLIA_INDEX_MARKETPLACE: string
	}
}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }