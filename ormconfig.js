module.exports = [
  {
    name: "default",
    type: process.env.DATABASE_TYPE,
    url: process.env.DATABASE_URL,
    logging: process.env.TYPEORM_LOGGING === "true",
    synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
    entities: [process.env.TYPEORM_ENTITIES],
    cache: true,
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      rejectUnauthorized: false,
    },
  },
  {
    name: "test",
    type: process.env.DATABASE_TYPE,
    url: process.env.TEST_DATABASE_URL,
    logging: process.env.TYPEORM_LOGGING === "true",
    synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
    entities: [process.env.TYPEORM_ENTITIES],
    cache: true,
    ssl: false,
    extra: {
      rejectUnauthorized: false,
    },
  },
]
