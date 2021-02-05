# Swarm-CLI

![Node.js tests](https://github.com/ethersphere/swarm-cli/workflows/Node.js%20tests/badge.svg?branch=master)
[![Dependency Status](https://david-dm.org/ethersphere/swarm-cli.svg?style=flat-square)](https://david-dm.org/ethersphere/swarm-cli)
[![](https://img.shields.io/badge/made%20by-Swarm-blue.svg?style=flat-square)](https://swarm.ethereum.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/runs%20in-browser%20%7C%20node%20%7C%20webworker%20%7C%20electron-orange)

**Warning: This project is in alpha state. There might (and most probably will) be changes in the future to its API and working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

# Description

> Command line interface tool for manage Bee node and utilize its functionalities

The goal of this project is to handle most of the Swarm operations through CLI at some point in the future.
For currently supported operations, see [Commands](##Commands) section.

## Commands

`swarm-cli` can perform commands:
- upload # upload files (even directories) to Swarm network by passing the file's path
- identity # manage keys (which can be compatible with Ethereum V3 keystore standard) that you can use mostly for signing chunks

for more info execute `swarm-cli --help` after installation.

## Config

The configuration file is placed in a hidden folder named swarm-cli.
In case of Unix-based systems this config path will be: $HOME/.swarm-cli
On Windows systems: $HOME\AppData\swarm-cli

The configuration file is saved with 600 file permission.

On first run, this configuration will be generated with default values, that you are able to change on your demand under the before mentioned path.

## Assignment priority

It is possible to set value of particular parameters in different ways.

The assignment priority of how option gets its value in question is the following:

1. passed CLI option value (with e.g. `--option-example-1`)
2. env variable for that option in form of either `OPTION_EXAMPLE_1` or `SWARM_CLI_OPTION_EXAMPLE_1` (if it is available)
3. CLI configuration value of that option (if it is available)
4. option's default fallback value (or it is required to define by #1)

## System environment

With specific system environment variables you can alter the behaviour of the CLI

* `BEE_API_URL` - API URL of Bee client
* `SWARM_CLI_CONFIG_FOLDER` - full path to a configuration folder

# Install

## npm

```sh
 $ npm install -g @ethersphere/swarm-cli
```

# Compile code

Install project dependencies with

```sh
 $ npm i
```

In order to compile NodeJS code run

```sh
 $ npm run compile
```

and you can try out the `swarm-cli` CLI after run command

```sh
 $ npm link
```
in your project folder.

# Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/ethersphere/swarm-cli/issues) and take on one of them
- Help our tests reach 100% coverage!

# License

[BSD-3-Clause](./LICENSE)
