# Contributing to rCTF

## Workflow

Development primarily occurs with `yarn`. While there are docker containers avalible, these are meant more for production environments.

You should first clone the repository and run:
```bash
yarn
```

The frontend and backend need to be built separately. You can do run these two operations concurrently for development by running `yarn dev`.

```bash
yarn dev
```

These will automatically watch the filesystem for changes, and restart when needed.

**Note that this will start two servers**. The API listens on `http://localhost:3000` by default while the frontend is served by Preact on `http://localhost:8080`.

There are also two development settings you have to change to develop the frontend.

Before commiting your changes, you should run `yarn lint` to fix any linting errors.

You should also use `yarn test` to ensure there are no regressions.

## Commits

Finally when it's all done, you can commit with `git commit`.

Make sure to follow the [commit message guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

## Branches

You should follow the examples below as a guideline for how to name your branches.

```
feature/brief-description-here
fix/bug-description
style/some-frontend-component
refactor/some-component
add/contributing-md
```
