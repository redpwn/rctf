# Contributing to rCTF

## Workflow

Development primarily occurs with `yarn`. While there are docker containers available, these are meant for production environments. rCTF uses Yarn Berry and workspaces in a monorepo.

You should first clone the repository and run:

```bash
yarn install
```

Next, run a build of everything to ensure that generated files are where all components expect them to be:

```bash
yarn build
```

### Database setup

<!-- TODO -->

### Development servers

Most development work happens on either the frontend (`@rctf/client`) or the backend (`@rctf/server`).

To bring up the full stack in development mode, run:

```bash
yarn dev
```

This will automatically watch the filesystem for changes, and restart when needed.

**Note that this will start two servers**. The API listens on `http://localhost:3000` by default while the frontend is served on `http://localhost:8080`.

This full development stack is usually only needed for working on the frontend (in which case you would connect to `http://localhost:8080` only). For working on the backend server, it is sufficient to start only the backend in development mode via `yarn workspace @rctf/server dev` (or just `yarn dev` if your CWD is inside the server package).

rCTF also uses [Storybook](https://storybook.js.org/) for developing frontend UI components; start storybook via `yarn workspace @rctf/client storybook` (or just `yarn storybook` from within the client package). Running / developing the full frontend requires the backend server to be running, but working within Storybook does not.

### Lint

Pre-commit hooks are set up to catch most lint issues, but you can (and probably should) still run the checks manually: run `yarn lint --fix` to fix any lint errors, `yarn test` to ensure there are no regressions, and `yarn typecheck`. Editor integrations for TypeScript, ESLint, and Prettier are recommended.

## Commits

Finally when it's all done, you can commit with `git commit`. Our commit message conventions are based on those from [Angular](https://github.com/angular/angular/blob/65f7d53/CONTRIBUTING.md#commit-message-header). Your commit must start with a header matching the following format:

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─▶ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─▶ (Optional) Commit Scope: what area of the project the change affects - use the
  │                        package name (using its directory name under packages/, e.g.
  │                        'api-types'), 'deps', 'docs', or 'ci'.
  │
  └─▶ Commit Type: feat|fix|refactor|docs|chore|build|test|ci|style|perf
```

## Branches

You should follow the examples below as a guideline for how to name your branches.

```
feature/brief-description-here
fix/bug-description
refactor/some-component
docs/some-component
```
