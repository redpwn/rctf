# rCTF - RedpwnCTF's CTF Platform

rCTF is RedpwnCTF's CTF platform. It is developed and maintained by the [redpwn](https://redpwn.net) CTF team.

## Design Goals

We have designed rCTF with a focus on these attributes:

* scalability
* simplicity
* customizability

To read more about our motivations for creating this project, see [here](https://github.com/redpwn/rctf/wiki/Purpose-of-rCTF).

## Getting Started

### Installation

#### Automatic
The automatic installation script works on Debian-based distributions and Arch Linux. It depends on `curl`. Feel free to [read the script](https://get.rctf.redpwn.net/) before running this command as root (it's fairly short).

```
# curl https://get.rctf.redpwn.net | sh
```

#### Manual

For instructions on manual installations and deployments, see the [wiki page](https://github.com/redpwn/rctf/wiki/Manual-Deployment).

### Management

The rCTF CLI management tool [install/rctf.py](`rctf`) (installed in `/usr/bin/` by default by the automatic installation script) makes management of your rCTF installation simple.

To read more about its usage, see the [wiki page](https://github.com/redpwn/rctf/wiki/Managing-rCTF-through-the-CLI).

#### Starting rCTF

```
# rctf up
```

#### Stopping rCTF

```
# rctf down
```

#### Upgrading rCTF

```
# rctf update
```

#### Deploying Challenges to rCTF

##### Using rDeploy

If you use [rDeploy](https://github.com/redpwn/rdeploy), you can automatically import the problem data using the below command:

```
# rctf deploy /path/to/challenge/directory/
```

##### Without rDeploy

This is currently not supported, but it will be in the near future.
