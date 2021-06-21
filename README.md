# Swarm-CLI

![Node.js tests](https://github.com/ethersphere/swarm-cli/workflows/Node.js%20tests/badge.svg?branch=master)
[![](https://img.shields.io/badge/made%20by-Swarm-blue.svg?style=flat-square)](https://swarm.ethereum.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D12.0.0-orange.svg?style=flat-square)

**Warning: This project is in alpha state. There might (and most probably will) be changes in the future to its API and working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

# Table of Contents

* [Swarm-CLI](#swarm-cli)
* [Table of Contents](#table-of-contents)
* [Demo](#demo)
   * [Purchasing a Postage Stamp](#purchasing-a-postage-stamp)
   * [Uploading a File](#uploading-a-file)
   * [Creating an Identity](#creating-an-identity)
   * [Uploading to a Feed](#uploading-to-a-feed)
* [Description](#description)
   * [Installation](#installation)
      * [From npm](#from-npm)
      * [From source](#from-source)
   * [Usage](#usage)
   * [Commands](#commands)
   * [Example usage](#example-usage)
   * [Usability Features](#usability-features)
      * [Numerical Separator and Units](#numerical-separator-and-units)
      * [Stamp Picker](#stamp-picker)
      * [Identity Picker](#identity-picker)
      * [Human Readable Topics](#human-readable-topics)
      * [Automating tasks with Swarm-CLI](#automating-tasks-with-swarm-cli)
         * [Connectivity](#connectivity)
         * [Postage Stamps](#postage-stamps)
         * [Uploading](#uploading)
   * [Config](#config)
   * [Assignment priority](#assignment-priority)
   * [System environment](#system-environment)
* [Development](#development)
* [Contribute](#contribute)
* [Maintainers](#maintainers)
* [License](#license)

# Demo

## Purchasing a Postage Stamp

![Swarm CLI Stamp Buy Command](./docs/stamp-buy.gif)]

## Uploading a File

![Swarm CLI Upload Command](./docs/upload.gif)

## Creating an Identity

![Swarm CLI Identity Create Command](./docs/identity-create.gif)

## Uploading to a Feed

![Swarm CLI Feed Upload Command](./docs/feed-upload.gif)

# Description

> Manage your Bee node and interact with the Swarm network via the CLI

The goal of this project is to handle most of the Swarm operations through CLI at some point in the future.
For currently supported operations, see [Commands](##Commands) section.

## Installation

### From npm

```sh
npm install -g @ethersphere/swarm-cli
```

### From source

See the [Development](##Development) section.

## Usage

The general usage is to provide a command, optionally a subcommand, then arguments and options.

`swarm-cli command [subcommand] <arguments> [options]`

Running a command with the `--help` option prints out the usage of a command.

## Commands

Running `swarm-cli` without arguments prints the available commands:

```
$ swarm-cli
Swarm CLI 0.10.0 - Manage your Bee node and interact with the Swarm network via the CLI

█ Usage:

swarm-cli COMMAND [OPTIONS]

█ Available Groups:

pinning    Pin, unpin and check pinned chunks
identity   Import, export and manage keypairs, identities
feed       Upload, update and view feeds
cheque     Deposit, withdraw and manage cheques
stamp      Buy, list and show postage stamps
pss        Send, receive, or subscribe to PSS messages

Run 'swarm-cli GROUP --help' to see available commands in a group

█ Available Commands:

upload   Upload file to Swarm
status   Check API availability and Bee compatibility
addresses   Display the addresses of the Bee node

Run 'swarm-cli COMMAND --help' for more information on a command

```

## Example usage

Let's say we want to upload our website to Swarm and update a feed to point to the newest version. For updating a feed we would need to sign it with an Ethereum key, so first we need to create one with the `identity create` command:

```
swarm-cli identity create
```

This command will ask for a password. After that a new identity is created (named `main`). Now we can use this identity to sign updates. It's also possible to import and export Ethereum JSON V3 format identities that works with other apps (e.g. wallets).

Another requirement for uploading to the Swarm network is a valid postage batch, also called a postage stamp or simply a stamp. Stamps need to be purchased with BZZ tokens. We can use the `stamp buy` command to take care of this step. The `--amount` and `--depth` options alter the capacity of the postage stamp. For example, running `stamp buy --amount 1 --depth 20` will get back with a Stamp ID after a while. We will be using that with the `--stamp` option in commands which upload files, or write feeds.

For uploading to a feed we can use the `feed upload` command. It expects the path of the folder (or file) we want to upload and as options it expects `identity` to be provided along with the `password` that belongs to it, as well as the earlier mentioned `stamp`.

```
swarm-cli feed upload path-to-be-uploaded --identity my-identity --password my-secret-password --stamp stamp-id
```

In this example we are uploading the content of the `dist` folder. If the uploading was successful the last printed line will contain a `Feed Manifest URL`. This URL can be opened in the browser. If the uploaded folder contains an `index.html` file then it will be automatically displayed when visiting the URL.

This URL will stay the same when we upload an updated version of the website. Because of this we can also put this URL into a reverse proxy configuration or use the reference (the hex string after the `/bzz/`) in an ENS record. There is more information about that in the [Bee documentation](https://docs.ethswarm.org/docs/getting-started/host-your-website-using-ens). The uploaded content can be found on the link in the line starting with `URL`. This will change every time the content is modified.

## Usability Features

### Numerical Separator and Units

As most of the units are specified in wei and PLUR - the smallest denominations of currencies - they are a bit difficult to write out.

To aid this, you may use underscores (`_`) and `K`, `M`, `B` and `T` units to make your numbers more comprehensible.

Example:

```
swarm-cli stamp buy --amount 10M --depth 16 --gas-price 10_000_000_000_000
```

You may combine the two: `100_000T`.

### Stamp Picker

Unless you are running in `--quiet` mode, some options are not hard-required.

Look for hints in the `--help` sections. Take the `upload` command for example:

```
█ Required Options:

   --stamp   ID of the postage stamp to use  [required when quiet][string]
```

That means, you don't have to provide the postage stamp ID beforehand. Simply running `swarm-cli upload <path>` will prompt you with an interactive stamp picker:

```
? Please select a stamp for this action.

  Stamp ID                                                         Utilization
 (Use arrow keys)
❯ b9d5bb548c2c209cb99cbb27b0bef59b8f0cd3558363e307f45177b5a64ad0c8 (1)
```

### Identity Picker

Similarly to Stamp Picker, when an identity is not provided, an interactive picker will be prompted.

Take the command `feed upload` for example. Albeit it takes quite a lot of options, you can run it with typing as little as `feed upload <path>`.

`swarm-cli` will take you through some prompts to interactively specify all required options, such as `identity`, `password` of the identity, and the mandatory `stamp`.

Passing identities is also tolerant to errors, so if you provide one which does not exist, the output will tell you and you can correct it:

```
The provided identity does not exist. Please select one that exists.
? Please select an identity for this action (Use arrow keys)
❯ main 
```

### Human Readable Topics

You may need to pass topics on multiple occasions - for example, when uploading to feeds.

Topics are 32-byte long identifiers, so you need 64 characters to write them out in hexadecimal string format.

You can do that with the `--topic` or `-t` option, or alternatively take a shortcut and use a human readable string which will be hashed by `swarm-cli` for your convenience. It is available via the `--topic-string` or `-T` option.

Example:

```
swarm-cli feed upload [...] -T "Awesome Swarm Website"
```

This is also indicated in the `--help` section:

```
-t --topic         32-byte long identifier in hexadecimal format    [hex-string][default all zeroes]
-T --topic-string  Construct the topic from human readable strings                          [string]

Only one is required: [topic] or [topic-string]
```

### Automating tasks with Swarm-CLI

Running `swarm-cli` with the flag `--quiet` (or `-q` for short) disables all interactive features, and makes commands print information in an easily parsable format. The exit code also indicates whether running the command was successful or not. These may be useful for automating tasks both in CI environments and in your terminal too.

Below you will find a few snippets to give an idea how it can be used to compose tasks.

#### Connectivity

Exit if not all status checks succeed:

```
swarm-cli status -q || exit 1
```

Check Bee API connection, compatibility does not matter:

```
swarm-cli status -q | head -n 1 | grep "^OK"
```

#### Postage Stamps

Grab the first postage stamp:

```
swarm-cli stamp list --limit 1 -q | awk '{ print $1 }'
```

List all postage stamps with zero utilization:

```
swarm-cli stamp list --max-usage 0 -q | awk '{ print $1 }'
```

Sort postage stamps based on utilization (least utilized comes first):

```
swarm-cli stamp list --least-used -q
```

#### Uploading

Upload a file with the least utilized postage stamp (that has at most 50% usage):

```
STAMP=$(swarm-cli stamp list --max-usage 50 --least-used --limit 1 -q | awk '{ print $1 }')
swarm-cli upload -q README.md --stamp $STAMP
```

## Config

The configuration file is placed in a hidden folder named `swarm-cli`.

In case of Unix-based systems this config path will be: `$HOME/.swarm-cli`

On Windows systems: `$HOME\AppData\swarm-cli`

The configuration file is saved with `600` file permission.

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
* `BEE_DEBUG_API_URL` - Debug API URL of Bee client
* `SWARM_CLI_CONFIG_FOLDER` - full path to a configuration folder
* `SWARM_CLI_CONFIG_FILE` - configuration file name, defaults to config.json

# Development

After cloning the project, install dependencies with:

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

# Maintainers

- [nugaon](https://github.com/nugaon)
- [Cafe137](https://github.com/Cafe137)

# License

[BSD-3-Clause](./LICENSE)
