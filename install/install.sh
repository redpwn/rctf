#!/bin/sh
# rCTF installation script
# Supports Debian-like distros and Arch Linux

set -e


# define functions


fg_cyan="\e[36m"
bold_fg_white="\e[1;37m"
bg_red="\e[41m"
reset="\e[0m"

error() {
    /bin/echo -e "${bg_red}${bold_fg_white}[-]" "$@" "$reset" 1>&2
}

info() {
    /bin/echo -e "${fg_cyan}[*]" "$@" "$reset"
}


# check environment


info "Checking environment..."


if [ "$EUID" -ne 0 ]; then
    error "You must run this script as root."
    exit 1
fi


PACKAGE_MANAGER="x"

if [ -x "$(command -v apt-get)" ]; then
    PACKAGE_MANAGER="apt-get"
elif [ -x "$(command -v yum)" ]; then
    error "Warning: Support for RHEL-like distros is experimental and things might break. Giving you 10 seconds to change your mind (by presing Ctrl+C)..."
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


INSTALL_PATH=${INSTALL_PATH:-'/opt/rctf'}

if [ ! -d "$(dirname "$INSTALL_PATH")" ]; then
    error "The parent of \$INSTALL_PATH ('$(dirname "$INSTALL_PATH")') does not exist."
    exit 1
fi


if [ -d "$INSTALL_PATH" ]; then
    error "rCTF appears to already be installed in ${INSTALL_PATH}"

    info "- If you're trying to start rCTF, 'cd $INSTALL_PATH' and run 'docker-compose up'."
    info "- If you're trying to reinstall rCTF, 'rm -rf $INSTALL_PATH' then re-run this script."

    exit 1
fi


REPOSITORY_URL=${REPOSITORY_URL:-"https://github.com/redpwn/rctf.git"}
REPOSITORY_BRANCH=${REPOSITORY_BRANCH:-"master"}


# install dependencies


info "Installing dependencies..."


if [ "$PACKAGE_MANAGER" = "apt-get" ]; then
    apt-get install --yes docker.io docker-compose git
elif [ "$PACKAGE_MANAGER" = "yum" ]; then
    info "We are about to install docker via https://get.docker.com/. Please follow along the steps to ensure it is configured properly."
    
    # pass Ctrl+C / SIGINT to inside script
    sh -c '
        trap break INT
        curl -fsSL https://get.docker.com/ | sh
    '

    yum install git
elif [ "$PACKAGE_MANAGER" = "pacman" ]; then
    pacman -S docker docker-compose git
fi


info "Enabling docker..."


systemctl enable docker || true # XXX: Debian "masks" docker.service
systemctl start docker


# clone repository


info "Cloning repository to ${INSTALL_PATH}..."


git clone "$REPOSITORY_URL" "$INSTALL_PATH"
cd "$INSTALL_PATH"
git checkout "$REPOSITORY_BRANCH"


# configure rctf


info "Configuring rCTF..."

/bin/echo -ne "Enter the CTF name: "
read RCTF_NAME

RCTF_TOKEN=${RCTF_SECRET_KEY:-"$(head -c 32 /dev/urandom | base64 -w 0)"}

cp .env.example .env

sed -i.bak "s/RCTF_NAME=.*$/RCTF_NAME=$RCTF_NAME/g" .env
sed -i.bak "s/RCTF_TOKEN=.*$/RCTF_TOKEN=$RCTF_TOKEN/g" .env


# start docker


info "Finished installation to ${INSTALL_PATH}."


/bin/echo -ne "Would you like to run 'docker-compose up' and start rCTF now (y/N)? "
read result

if [ "$result" = "y" ]; then
    docker-compose up
    exit 0
else
    echo "Installation complete."
    exit 0
fi
