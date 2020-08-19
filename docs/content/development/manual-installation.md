# Manual Installation

Manual installation of rCTF is useful to develop and modify the project.

To run rCTF locally, you'll need [node](https://nodejs.org/) and [yarn](https://yarnpkg.com/).

Clone the rCTF repository:

```bash
git clone https://github.com/redpwn/rctf
```

After cloning, you will need to setup the configuration files in the `rctf.d` directory. [An example `rctf.d`](https://github.com/redpwn/rctf/blob/next/server/test/data/rctf.d/conf-test.yaml) is used for testing.

To develop rCTF, run:

```bash
yarn dev
```

To simulate a full production build, run:

```bash
yarn build && yarn start
```
