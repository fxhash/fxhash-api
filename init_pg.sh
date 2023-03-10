#!/bin/sh

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER"  --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER fxhash WITH PASSWORD 'password';
  CREATE DATABASE fxhash_metrics;
  CREATE DATABASE restore;
  GRANT ALL PRIVILEGES ON DATABASE fxhash_metrics to fxhash;
EOSQL
wget -qO- https://fxh-dbsnapshots-prod.s3.amazonaws.com/indexer/latest.dump | pg_restore --verbose --no-acl --no-owner -C -d restore

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER"  --dbname "$POSTGRES_DB" <<-EOSQL
  ALTER DATABASE d1p7h8sr2cffkc RENAME TO fxhash_index;
  GRANT ALL PRIVILEGES ON DATABASE fxhash_index to fxhash;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER"  --dbname fxhash_index <<-EOSQL
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fxhash;
EOSQL