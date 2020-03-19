# Contributing to rCTF

## Workflow

Development primarily occurs with `yarn`. While there are docker containers avalible, these are meant more for production environments.

You should first clone the repository and `yarn install`.

The frontend and backend need to be built separately. You can do this by running two commands in separate terminal windows.

```bash
$ yarn dev
$ yarn dev:client
```

These will automatically watch the filesystem for changes, and restart when needed.

Before commiting your changes, you should run `yarn lint --fix` to fix any linting errors.

You should also use `yarn test` to ensure there are no regressions.

## Commits

Finally, you can commit with `git commit`. Note that we have [commitizen](https://github.com/commitizen/cz-cli) setup so just fill in the prompts!

For the commitizen scope prompt, you should put in the name of the filename/path of the least common ancestor of your major changes.

> What is the scope of this change (e.g. component or file name)

For example, if you made substantial changes to only one file, the scope would be that file's name, e.g. `package.json`.

If you made significant changes to the api handlers in `server/api`, the scope would be `server/api`.

If you made changes to everywhere, you should leave the scope blank.

Of course, these are just general guidelines and not strict rules.

## Branches

You should follow the examples below as a guideline for how to name your branches.

```
feature/brief-description-here
fix/bug-description
style/some-frontend-component
refactor/some-component
add/contributing-md
```