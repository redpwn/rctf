# rctf - RedpwnCTF's CTF Platform

rctf is RedpwnCTF's CTF platform. It is developed and maintained by the [redpwn](https://redpwn.net) CTF team.

## Design Goals

We have designed rctf with the following attributes in mind:

* scalability
* simplicity
* "modernness" (no PHP)

## Main Features

* simple integration with redpwn's [CTF deployment framework](https://github.com/redpwn/rdeploy)
* dynamic scoring

## Deployment

### Problem Data

To build, simply copy the exported directory from [rDeploy](https://github.com/redpwn/rdeploy) to `config.rDeployDirectory` (defaults to `.rdeploy`). 

```bash
~ $ ls
rdeploy rctf
~ $ cd rdeploy
~/rdeploy $ python main.py build
~/rdeploy $ cp -r export ../rctf/.rdeploy
```

## Installation

### Environment

You should copy the `.env.example` to `.env`. 

```
~/rctf $ cp .env.example .env
```

Note that the `APP_TOKEN_KEY` should be a base64 encoded string of length 32 bytes. You can generate one with the following command.  

```
$ openssl rand -base64 32
j9qpC+J9lrvx/F7uQ9wGKawhzfPyPb1aM+JPeLfsFX8=
```

### Database

The application is built on a PostgreSQL database. You should add the appropriate connection string in `.env`. Then run the following command to setup the database. 

```
yarn run migrate up
```

## Development

For hot reloading, use nodemon.

```javascript
yarn dev
```

To fix style errors, use standard. 

```
yarn lint --fix
```
