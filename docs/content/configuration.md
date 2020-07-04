# Configuration

Configuration is split among both env vars, specified in `.env`, and yml configuration files, specified in `config/yml/*.yml`.

Environment variables are given higher precedence, so if an option is specified in both environment and yml, the environment one will override the latter.

## Configuration Options

There are three required configuration options in order to start rCTF.

Option|Description
-|-
`RCTF_DATABASE_URL`|A [postgreSQL connection URI](https://www.postgresql.org/docs/current/libpq-connect.html) that represents the backing SQL database for rCTF.  
`RCTF_REDIS_URL`|A [redis connection URI](https://metacpan.org/pod/URI::redis#SYNOPSIS) that represents the backing redis database for rCTF. 
`RCTF_TOKEN_KEY`|A 32 byte base64 encoded secret. To generate, run `head -c32 < /dev/urandom | base64 -w0`

## Configuration Example

```shell
RCTF_DATABASE_URL=postgres://username:password@example.com/database
RCTF_REDIS_URL=redis://:password@example.com/0
RCTF_TOKEN_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```
