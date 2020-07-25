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

## Client Configuration

There are additional client specific configuration options, located in `config/yml/client.yml`. 

Option|Description
-|-
`meta.description` | A description for your ctf. This is rendered into the HTML as the `description`,  `og:description`, and `twitter:description` meta tags. 
`meta.imageUrl` | A url that points to an image. This is rendered into the HTML as the `og:mage` and `twitter:image` meta tags. 
`homeContent` | The content displayed on `/` for your CTF. This supports markdown, as well as many custom elements. 
`showUserMembers` | A boolean representing if the client should render the "Team Information" card on `/profile`. 
`ctfTitle` | The content for the HTML title. If not specified, will be auto generated as `' | ' + shared.ctfName`.
`globalSiteTag` | Used to support collecting Google Analytics data. This should look something like `UA-XXXXXX-X`. 
`apiEndpoint` | The api endpoint that the client should interact with. You should not change this unless you know what you are doing. 

The `homeContent` config option represents the content of `/`. This supports Markdown, as well as many custom elements. 

```md
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2053 840" style="width: 300px; margin: 20px auto; display: block;"><rect width="840" height="840" rx="195.6"/><path fill="#0e3f4a" d="M199 683l315 84 253-255-84-312zm442-526L326 73 73 328l84 313z"/><path fill="#bc2226" d="M504 294h-33a74 74 0 0022-52c0-41-33-74-73-74s-73 33-73 74a74 74 0 0022 52h-33a20 20 0 00-20 20v3a20 20 0 0020 20h168a20 20 0 0020-20v-3a20 20 0 00-20-20zM319 544h198c9 0 16 7 16 16v18c0 8-7 15-16 15H319c-8 0-15-7-15-15v-18c0-9 7-16 15-16zm-31 65h264c10 0 18 8 18 17v29c0 9-8 17-18 17H288c-10 0-18-8-18-17v-29c0-9 8-17 18-17zm40-80c54-99 35-177 35-177h114s-19 78 35 177z"/><path fill="#ffffff" d="M1275 473a88 88 0 11-1-105l86-65a195 195 0 100 234zm103-248v106h124v285h105V331h123V225h-228zm383 0v391h106V493h121V387h-121v-56h186V225h-187z"/></svg>

### What is redpwnCTF?
redpwnCTF is a cybersecurity competition hosted by the [redpwn CTF team](https://ctftime.org/team/59759). We have over $3000 worth of prizes to distribute to top teams. Please check out our [landing page](https://ctf.redpwn.net/) and join our [Discord](https://discord.gg/25fu2Xd) server for more information!

<action-button href="/register">
  <span>Register Now</span>
  <svg viewBox="4 4 16 16"><path fill="#ffffff" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"></path></svg>
</action-button>
<timer></timer>

### Sponsors
Thank you to our wonderful sponsors for making this event possible!

<sponsors></sponsors>

<div style="text-align: center; opacity: 0.6;">
  <a href="https://ctf.redpwn.net/privacy.txt" target="_blank">Privacy Policy</a>
</div>
```

The `sponsors` config options represents a list of sponsor elements. Each sponsor element is defined as follows. 

Option|Description
-|-
`name` | Required. The name of the sponsor, rendered as the title. 
`description` | Required. A description of the sponsor, rendered as the card body.
`small` | Boolean. Render as sponsor card as small, without image. Can be used to distinguish between different sponsor levels. 
`icon` | Required if `small` is not specified. A url pointing to an image to use for the sponsor card. 

## Server Configuration

There are additional server specific configuration options, located in `config/yml/server.yml`. 

Option|Description
-|-
`divisionACLs`|Optional. Rules to assign default and allowed divisions.
`defaultDivision`|Optional. The default division to assign if ACLs are not specified. 

The `divisionACLs` object is a list of division assignments, and only applies if email verification is on. Each one is defined as follows.

Option|Description
-|-
`match`|Required. Which part of the email to match; can be `domain`, `email`, `regex`, or `any`.
`value`|Required. The value to match against. 
`divisions`|Required. A list of divisions (by id) that the user is allowed to be in. The default division is the first in the list. 

If a user does not match any rules in `divisionACLs`, then they are not allowed to register. Evaluating entries is done in the order they are configured, and only the first matching entry applies. If `divisionACLs` are not specified, then no restrictions are applied. 

The `defaultDivision` option is only used if `divisionACLs` does not exist or if email verification is off. If this is not configured either, a division will be picked to be default (most likely, but not guaranteed to be, the first). 

## Shared Configuration

There are additional shared configuration options, located in `config/yml/shared.yml`. 

Option|Description
-|-
`divisions` | Required. A map of `id:division_name` pairs. 
`ctfName` | Required. The name of the CTF, should look something like `xxxCTF`. 
`origin` | Required. The origin of the CTF. This is used for sending emails and is rendered into the HTML. 
`startTime` | Required. The start time of the CTF in UTC milliseconds. You can generate this by running `+new Date("your date")`.
`endTime` | Required. The end time of the CTF in UTC milliseconds. 
