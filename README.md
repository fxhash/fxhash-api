fxhash API
==========

Not ready for contribution yet, please wait a little bit more.

# Opensource API

* provide regular snapshots of the database
* write installation guide
* give some stack / architecture overview
* write contribution doc
* write list of features

# development environment
docker-compose is set up with a postgres and redis container alongside the api

postgres is initialized with a dump from s3

the api hits postgres from the container network, but it is on the local network at port `5444` to avoid collisions

```shell
docker-compose up -d
```

# .env

```shell
NODE_ENV = dev
PORT = 4000

CORS_ALLOWED_ORIGINS = *
NODE_TLS_REJECT_UNAUTHORIZED = 0

TYPEORM_SYNCHRONIZE = false
TYPEORM_LOGGING = true
TYPEORM_ENTITIES = src/Entity/*.ts
TYPEORM_ENTITIES_METRICS = src/EntityMetrics/*.ts

DATABASE_TYPE = postgres
DATABASE_URL = postgres://fxhash:password@localhost:5432/fxhash_index
DATABASE_METRICS_URL = postgres://fxhash:password@localhost:5432/fxhash_metrics

RECORD_METRICS = 0

REDIS_URL = 
```