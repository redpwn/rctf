# Contributing to rCTF

## Workflow

Development primarily occurs with `yarn`. While there are docker containers avalible, these are meant more for production environments.

You should first clone the repository and `yarn install`.

The frontend and backend need to be built separately. You can do run these two operations concurrently for development by running `yarn dev`.

```bash
$ yarn dev
```

These will automatically watch the filesystem for changes, and restart when needed.

**Note that this will start two servers**. The API listens on `http://localhost:3000` by default while the frontend is served by Preact on `http://localhost:8080`. You should connect to Preact to debug the frontend.

There are also two development settings you have to change to develop the frontend.

In `config/client.js`, you should update `apiEndpoint` and `staticEndpoint`.

```
  apiEndpoint: 'http://localhost:3000/api/v1',
  staticEndpoint: 'http://localhost:3000/static',
```

Then, modify `.env` to update `RCTF_ORIGIN`, which will tell the API to allow requests from the new origin.``

```
RCTF_ORIGIN=http://localhost:8080
```

Before commiting your changes, you should run `yarn lint --fix` to fix any linting errors.

You should also use `yarn test` to ensure there are no regressions.

## Commits

Finally when it's all done, you can commit with `git commit`. Note that we have [commitizen](https://github.com/commitizen/cz-cli) setup so just fill in the prompts!

For the commitizen scope prompt, you should use `client/server/[empty]`.

> What is the scope of this change (e.g. component or file name)

You should also make sure that the commit message is entirely lowercase.

## Branches

You should follow the examples below as a guideline for how to name your branches.

```
feature/brief-description-here
fix/bug-description
refactor/some-component
docs/some-component
```
