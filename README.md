fxhash API
==========

Not ready for contribution yet, please wait a little bit more.

# Opensource API

* provide regular snapshots of the database
* write installation guide
* give some stack / architecture overview
* write contribution doc
* write list of features


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