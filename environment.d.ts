declare global {
  namespace NodeJS {
    interface ProcessEnv {
			NODE_ENV: string
			PORT: number

			FRONT_URL: string
			CORS_ALLOWED_ORIGINS: string

			DATABASE_URL: string
			DATABASE_TYPE: "postgres"

			TYPEORM_SYNCHRONIZE: string
			TYPEORM_LOGGING: string
			TYPEORM_ENTITIES: string

			REDIS_URL?: string

			AWS_ACCESS_KEY_ID: string
			AWS_ACCESS_KEY_SECRET: string
			AWS_S3_REGION: string
			AWS_S3_BUCKET: string

			TZ_CT_ADDRESS_ISSUER: string 
			TZ_CT_ADDRESS_MARKETPLACE: string 
			TZ_CT_ADDRESS_OBJKT: string 
			TZ_CT_ADDRESS_USERREGISTER: string

			TZTK_API_ROOT: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}