# Manual Installation

Manual installation of rCTF is useful to develop and modify the project.

If you want to install rCTF on your local machine, you will need `yarn` installed. rCTF currently targets node 12, so you should either install that version locally or use nvm, for example with `nvm use --delete-prefix v12.16.1`. 

```shell
git clone https://github.com/redpwn/rCTF.git && cd rCTF
```

After cloning, you will need to setup the configuration files.

```shell
cp -nR config/yml.example config/yml
cp .env.example .env
```

Before you run rCTF for the first time, set the [mandatory configuration options](../configuration.md#configuration-options).

To develop rCTF, run:

```shell
yarn dev
```

To simulate a full production build, run:

```shell
yarn build && yarn start
``` 
