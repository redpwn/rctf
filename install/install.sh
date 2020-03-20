#!/bin/sh
# rCTF installation script
# Supports Debian-like distros and Arch Linux

set -e


# define functions


fg_cyan="\033[36m"
bold_fg_white="\033[1;37m"
bg_red="\033[41m"
reset="\033[0m"

error() {
    printf "${bg_red}${bold_fg_white}[-] $@$reset\n" 1>&2
}

info() {
    printf "${fg_cyan}[*] $@$reset\n"
}


# check environment


info "Checking environment..."

if [ ! "$(id -u)" = 0 ]; then
    error "You must run this script as root."
    exit 1
fi

if [ -x "$(command -v apt-get)" ]; then
    PACKAGE_MANAGER="apt-get"
elif [ -x "$(command -v yum)" ]; then
    error "Warning: Support for RHEL-like distros is experimental and things might break. Giving you 10 seconds to change your mind (by pressing Ctrl+C)..."
    sleep 10

    PACKAGE_MANAGER="yum"
elif [ -x "$(command -v pacman)" ]; then
    info "redpwn uses arch too btw"

    PACKAGE_MANAGER="pacman"
else
    # XXX: should we stop the script here?
    error "Unable to identify usable package manager, ignoring dependencies for now.";
fi


# setup variables


info "Configuring installation..."

RCTF_CLI_INSTALL_PATH="${RCTF_CLI_INSTALL_PATH:-"/usr/bin/rctf"}"
INSTALL_PATH="${INSTALL_PATH:-"/opt/rctf"}"

if [ ! -d "$(dirname "$INSTALL_PATH")" ]; then
    error "The parent of \$INSTALL_PATH ($(dirname "$INSTALL_PATH")) does not exist."
    exit 1
fi

if [ -d "$INSTALL_PATH" ]; then
    error "rCTF appears to already be installed in ${INSTALL_PATH}"

    info "... If you're trying to start rCTF, run 'rctf start'."
    info "... If you're trying to reinstall rCTF, 'rm -rf $INSTALL_PATH' then re-run this script."

    exit 1
fi

REPOSITORY_URL="${REPOSITORY_URL:-"https://github.com/redpwn/rctf.git"}"
REPOSITORY_BRANCH="${REPOSITORY_BRANCH:-"master"}"


# install dependencies


info "Installing dependencies..."

if [ "$PACKAGE_MANAGER" = "apt-get" ]; then
    apt-get update
    apt-get install --yes docker.io docker-compose git python3
elif [ "$PACKAGE_MANAGER" = "yum" ]; then
    info "We are about to install docker via https://get.docker.com/. Please follow along the steps to ensure it is configured properly."
    
    # pass Ctrl+C / SIGINT to inside script
    sh -c '
        trap break INT
        curl -fsSL https://get.docker.com/ | sh
    '

    yum install git python3
elif [ "$PACKAGE_MANAGER" = "pacman" ]; then
    pacman -Sy --noconfirm --needed docker docker-compose git python
fi

info "Enabling docker..."

(systemctl enable docker || true) 2>/dev/null # XXX: Debian "masks" docker.service
(systemctl start docker || true) 2>/dev/null


# clone repository


info "Cloning repository to ${INSTALL_PATH} from repository ${REPOSITORY_URL} branch ${REPOSITORY_BRANCH}..."

git clone "$REPOSITORY_URL" "$INSTALL_PATH"
cd "$INSTALL_PATH"
git checkout "$REPOSITORY_BRANCH"


# configure rctf


info "Configuring rCTF..."

./install/config.sh

printf "Enter the CTF name: "
read -r RCTF_NAME </dev/tty

RCTF_TOKEN_KEY=${RCTF_TOKEN_KEY:-"$(head -c 32 /dev/urandom | base64 -w 0)"}

cp .env.example .env

sed -i.bak "s/RCTF_NAME=.*$/RCTF_NAME=$(echo "$RCTF_NAME"  | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')/g" .env
sed -i.bak "s/RCTF_TOKEN_KEY=.*$/RCTF_TOKEN_KEY=$(echo "$RCTF_TOKEN_KEY"  | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')/g" .env

info "Changing permissions of .env (chmod 600 .env)..."

chmod 600 .env .env.example


# copy over cli tool


info "Copying CLI tool from $INSTALL_PATH/install/rctf.py to $RCTF_CLI_INSTALL_PATH"

cp install/rctf.py "$RCTF_CLI_INSTALL_PATH"

info "Setting $RCTF_CLI_INSTALL_PATH as executable..."

chmod +x "$RCTF_CLI_INSTALL_PATH"


# start docker


info "Finished installation to ${INSTALL_PATH}."

printf "Would you like to start rCTF now (y/N)? "

# XXX: is this broken?
read -r result </dev/tty

if [ "$result" = "y" ]; then
    info "Running 'docker-compose up' in ${INSTALL_PATH}..."
    docker-compose up -d # XXX: is it a problem that this runs as root?
    exit 0
else
    info "Installation to $INSTALL_PATH complete."
    exit 0
fi
