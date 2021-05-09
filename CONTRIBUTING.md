# Contributing to rCTF

## Workflow

Development primarily occurs with `yarn`. While there are docker containers available, these are meant for production environments.

You should first clone the repository and run:

```bash
yarn install
```

Next, run a build of everything to ensure that generated files are where all components expect them to be:

```bash
yarn build
```

Most development work happens on either the frontend (`@rctf/client`) or the backend (`@rctf/server`).

To bring up the full stack in development mode, run:

```bash
yarn dev
```

These will automatically watch the filesystem for changes, and restart when needed.

**Note that this will start two servers**. The API listens on `http://localhost:3000` by default while the frontend is served on `http://localhost:8080`.

There are also two development settings you have to change to develop the frontend.

Before committing your changes, you should run `yarn lint --fix` to fix any lint errors and run `yarn test` to ensure there are no regressions.

## Commits

Finally when it's all done, you can commit with `git commit`. Our commit message conventions are based on those from [Angular](https://github.com/angular/angular/blob/65f7d53/CONTRIBUTING.md#commit-message-header). Your commit must start with a header matching the following format:

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ (Optional) Commit Scope: what area of the project the change affects - use the
  │                        package name (using its directory name under packages/, e.g.
  │                        'api-types'), 'deps', 'docs', or 'ci'.
  │
  └─⫸ Commit Type: feat|fix|refactor|docs|chore|build|test|ci|style|perf
```

## Branches

You should follow the examples below as a guideline for how to name your branches.

```
feature/brief-description-here
fix/bug-description
refactor/some-component
docs/some-component
```
