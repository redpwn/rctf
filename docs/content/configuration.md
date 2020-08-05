# Configuration

You can specify configuration to rCTF through `conf.d` or environment variables. Most values can be set through either.

YAML and JSON files in the `conf.d` directory are sorted alphabetically. Files later alphabetically have higher priority when merging config. Environment variables are always given highest priority.

In general, all config should be specified via YAML/JSON when possible as they provide the most flexibility.

For example, if `00-example.yaml` contained:
```yaml
meta:
  description: abc
  imageUrl: https://example.com
```

and `99-example.yml` contained:
```yaml
ctfName: foo
meta:
  description: xyz
```

and the environment contained:
```shell
RCTF_NAME=bar
```

The resulting config would be:
```yaml
ctfName: bar
meta:
  description: xyz
  imageUrl: https://example.com
```

## Configuration

YAML/JSON name|environment name|required|default value|type|description
-|-|-|-|-|-
`database.sql`|`RCTF_DATABASE_URL`|either `database.sql` or `database.sql.*`|_(none)_|string|`postgres://` connection URI
`database.sql.host`|`RCTF_DATABASE_HOST`|either `database.sql` or `database.sql.*`|_(none)_|string|hostname of a postgreSQL server
`database.sql.port`|`RCTF_DATABASE_PORT`|either `database.sql` or `database.sql.*`|_(none)_|string|port number that postgreSQL is running on
`database.sql.user`|`RCTF_DATABASE_USERNAME`|either `database.sql` or `database.sql.*`|_(none)_|string|postgreSQL username to authenticate with
`database.sql.password`|`RCTF_DATABASE_PASSWORD`|either `database.sql` or `database.sql.*`|_(none)_|string|postgreSQL password to authenticate with
`database.sql.database`|`RCTF_DATABASE_DATABASE`|either `database.sql` or `database.sql.*`|_(none)_|string|postgreSQL database to use
`database.redis`|`RCTF_REDIS_URL`|either `database.redis` or `database.redis.*`|_(none)_|string|`redis://` connection URI
`database.redis.host`|`RCTF_REDIS_HOST`|either `database.sql` or `database.sql.*`|_(none)_|string|hostname of a redis server
`database.redis.post`|`RCTF_REDIS_PORT`|either `database.sql` or `database.sql.*`|_(none)_|string|port number that redis is running on
`database.redis.password`|`RCTF_REDIS_PASSWORD`|either `database.sql` or `database.sql.*`|_(none)_|string|redis password to authenticate with
`database.redis.database`|`RCTF_REDIS_DATABASE`|either `database.sql` or `database.sql.*`|_(none)_|string|redis numerical database ID to use
`database.migrate`|`RCTF_DATABASE_MIGRATE`|yes|`never`|`before | only | never`|how to run postgreSQL migrations. [See migration doc for more](../management/migration)
`instanceType`|`RCTF_INSTANCE_TYPE`|yes|`all`|`all | frontend | leaderboard`|what type of instance to run. [See scaling doc for more](../management/scaling)
`tokenKey`|`RCTF_TOKEN_KEY`|yes|_(none)_|string|base64 encoded 32 byte key used for encrypting tokens
`origin`|`RCTF_ORIGIN`|yes|_(none)_|string|public URL of the rCTF instance
`ctftime.clientId`|`RCTF_CTFTIME_CLIENT_ID`|no|_(none)_|string|CTFtime OAuth client ID. [See CTFtime doc for more](../integrations/ctftime)
`ctftime.clientSecret`|`RCTF_CTFTIME_CLIENT_SECRET`|no|_(none)_|string|CTFtime OAuth client secret. [See CTFtime doc for more](../integrations/ctftime)
`userMembers`|`RCTF_USER_MEMBERS`|yes|`true`|boolean|whether to allow a user to set emails for individual members
`sponsors`|_(none)_|yes|`[]`|array|list of CTF sponsors. [See home doc for more](../management/home)
`homeContent`|`RCTF_HOME_CONTENT`|yes|`''`|string|markdown content for the homepage of the CTF. [See home doc for more](../management/home)
`ctfName`|`RCTF_NAME`|yes|_(none)_|string|name of the CTF throughout the UI
`meta.description`|`RCTF_META_DESCRIPTION`|yes|`''`|string|OpenGraph and Twitter embed description
`meta.imageUrl`|`RCTF_IMAGE_URL`|yes|`''`|string|OpenGraph and Twitter embed image URL
`logoUrl`|`RCTF_LOGO_URL`|no|_(none)_|string|URL to raster image of the CTF's logo. used in emails
`globalSiteTag`|`RCTF_GLOBAL_SITE_TAG`|no|_(none)_|string|Google Analytics site tag
`challengeProvider`|_(none)_|yes|`database`|provider|provider for challenges. [See challenge provider doc for more](../providers/challenges/index)
`uploadProvider`|_(none)_|yes|`local`|provider|provider for challenge file uploads. [See upload provider doc for more](../providers/uploads/index)
`email.provider`|_(none)_|no|_(none)_|provider|provider for email sending. [See email doc for more](../providers/emails/index)
`email.from`|_(none)_|no|_(none)_|provider|`from:` address when sending email. [See email doc for more](../providers/emails/index)
`divisions`|_(none)_|yes|_(none)_|object|division IDs and their respective names. [See division doc for more](../management/divisions)
`defaultDivision`|_(none)_|no|_(none)_|string|default division ID. [See division doc for more](../management/divisions)
`divisionACLs`|_(none)_|no|_(none)_|array|ACLs for restricting division access. [See division doc for more](../management/divisions)
`startTime`|`RCTF_START_TIME`|yes|_(none)_|integer|time at which the CTF starts, in milliseconds since the epoch
`endTime`|`RCTF_END_TIME`|yes|_(none)_|integer|time at which the CTF ends, in milliseconds since the epoch
`leaderboard.maxLimit`|`RCTF_LEADERBOARD_MAX_LIMIT`|yes|100|integer|maximum number of users retrievable in a single leaderboard request
`leaderboard.maxOffset`|`RCTF_LEADERBOARD_MAX_OFFSET`|yes|4294967296|integer|maximum offset from the beginning of the leaderboard
`leaderboard.updateInterval`|`RCTF_LEADERBOARD_UPDATE_INTERVAL`|yes|10000|integer|interval at which the leaderboard is recalculated, in milliseconds
`leaderboard.graphMaxTeams`|`RCTF_LEADERBOARD_GRAPH_MAX_TEAMS`|yes|10|integer|maximum number of users retrievable in a graph request
`leaderboard.graphSampleTime`|`RCTF_LEADERBOARD_GRAPH_SAMPLE_TIME`|yes|1800000|integer|interval at which the score graph is sampled, in milliseconds
`loginTimeout`|`RCTF_LOGIN_TIMEOUT`|yes|3600000|integer|lifetime of registration, email update, and recovery links, in milliseconds

## Custom `conf.d` location

The `conf.d` directory can be renamed or moved elsewhere.

To do so, set the `RCTF_CONF_PATH` environment variable to the location of a directory of YAML or JSON configuration files. If specified as a relative path, the path is evaluated from the current working directory.
