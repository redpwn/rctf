# rCTF - RedpwnCTF's CTF Platform

rCTF is RedpwnCTF's CTF platform. It is developed and maintained by the [redpwn](https://redpwn.net) CTF team.

## Design Goals

We have designed rCTF with the following attributes in mind:

* scalability
* simplicity
* "modernness" (no PHP)

## Installation

### Automatic

The automatic installation script works on Debian-based distributions and Arch Linux. It depends on `curl`.

```bash
# curl https://get.rctf.redpwn.net | sh
```

### Manual

#### Environment

You should copy the `.env.example` to `.env`. 

```bash
$ cp .env.example .env
```

Note that the `RCTF_TOKEN_KEY` should be a base64 encoded string of length 32 bytes. You can generate one with the following command.  

```bash
$ openssl rand -base64 32
j9qpC+J9lrvx/F7uQ9wGKawhzfPyPb1aM+JPeLfsFX8=
```

#### Database

The application is built on a PostgreSQL database. You should add the appropriate connection string in `.env`. Then run the following command to setup the database. 

```bash
$ yarn run migrate up
```

## Development

### Backend

For hot reloading, use nodemon.

```bash
$ yarn dev
```

There is a precommit hook that will block commits that fail to meet the style guide. To fix style errors, use standard. 

```bash
$ yarn lint --fix
```

### Frontend

The frontend is built on [Preact](https://preactjs.com/) and [Cirrus](https://spiderpig86.github.io/Cirrus/). 

All of the frontend code is in `/client`. To automatically watch the directory for changes, use the `watch` command. 

```bash
$ yarn watch
```

## Deployment

### Problem Data

To build, simply copy the exported directory from [rDeploy](https://github.com/redpwn/rdeploy) to `config.rDeployDirectory` (defaults to `.rdeploy`). 

```bash
$ cd rdeploy
$ python main.py build
$ cp -r export ../rctf/.rdeploy
```

