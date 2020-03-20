# Contributing to rCTF

## Workflow

Development primarily occurs with `yarn`. While there are docker containers avalible, these are meant more for production environments.

You should first clone the repository and `yarn install`.

The frontend and backend need to be built separately. You can do run these two operations concurrently for developmentby running `yarn dev`.

```bash
$ yarn dev
```

These will automatically watch the filesystem for changes, and restart when needed.

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
style/some-frontend-component
refactor/some-component
add/contributing-md
```
