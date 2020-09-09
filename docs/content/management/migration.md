# Migration

To support database format changes, rCTF uses migrations to update the postgreSQL structure.

The initial database structure also relies on migrations. Therefore, if automatic migrations aren't enabled, you must run manual migrations before rCTF starts up for the first time.

## Automatic migrations

If you want migrations to be run automatically at server startup, set `database.migrate` or `RCTF_DATABASE_MIGRATE` to `before`.

```yaml
database:
  migrate: before
```

Automatic migrations incur a startup cost, which can be significant if running at scale. Therefore, for large deployments, manual migrations should be used.

## Manual migrations

If you want to disable automatic migrations, set `database.migrate` or `RCTF_DATABASE_MIGRATE` to `never`.

```yaml
database:
  migrate: never
```

Then, when you need to run migrations, run:

```shell
yarn migrate
```

Alternatively, you can set `database.migrate` or `RCTF_DATABASE_MIGRATE` to `only` and run rCTF. rCTF will exit when migrations are complete.
