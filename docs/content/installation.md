# Installation

## Automatic Installation

rCTF supports [one command installation](https://get.rctf.redpwn.net/).

```bash
curl https://get.rctf.redpwn.net/ | sh
```

You might want to check the script before running. 

```bash
curl https://get.rctf.redpwn.net/ -o rctf-install.sh && chmod +x ./rctf-install.sh && cat ./rctf-install.sh
./rctf-install.sh
```

## Manual Installation

If you want to install rCTF on your local machine, you will need `yarn` installed. rCTF currently targets node 12, so you should either install that version locally or use nvm, for example with `nvm use --delete-prefix v12.16.1`. 

```
git clone https://github.com/redpwn/rCTF.git && cd rCTF
```

After cloning, you will need to setup the configuration files.

```
cp -nR .rdeploy.example .rdeploy
cp -nR config/yml.example config/yml
cp .env.example .env
```

You will need to update three values to get the server running. `RCTF_DATABASE_URL`, `RCTF_REDIS_URL`, and `RCTF_TOKEN_KEY`.

To simulate a full production build, use `yarn build && yarn start`. Afterwards, your rCTF installation will be running at `localhost:3000`. 
