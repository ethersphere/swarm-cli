# Swarm-CLI

![Node.js tests](https://github.com/ethersphere/swarm-cli/workflows/Node.js%20tests/badge.svg?branch=master)
[![](https://img.shields.io/badge/made%20by-Swarm-blue.svg?style=flat-square)](https://swarm.ethereum.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D12.0.0-orange.svg?style=flat-square)

Stay up to date with changes by joining the [official Discord](https://discord.gg/GU22h2utj6) and by keeping an eye on the [releases tab](https://github.com/ethersphere/swarm-cli/releases).

# Table of Contents

- [Swarm-CLI](#swarm-cli)
- [Table of Contents](#table-of-contents)
- [Demo](#demo)
  * [Purchasing a Postage Stamp](#purchasing-a-postage-stamp)
  * [Uploading a File](#uploading-a-file)
  * [Creating an Identity](#creating-an-identity)
  * [Uploading to a Feed](#uploading-to-a-feed)
- [Description](#description)
  * [Installation](#installation)
    + [From npm](#from-npm)
    + [From source](#from-source)
  * [Usage](#usage)
  * [Commands](#commands)
  * [Example usage](#example-usage)
  * [Usability Features](#usability-features)
    + [Uploading Files, Folders, Websites, and Arbitrary Data from stdin](#uploading-files--folders--websites--and-arbitrary-data-from-stdin)
      - [Files](#files)
      - [Folders and Websites](#folders-and-websites)
      - [Standard Input](#standard-input)
    + [Custom HTTP Headers](#custom-http-headers)
    + [Autocomplete](#autocomplete)
    + [Numerical Separator and Units](#numerical-separator-and-units)
    + [Stamp Picker](#stamp-picker)
    + [Identity Picker](#identity-picker)
    + [Human Readable Topics](#human-readable-topics)
    + [Manifest address scheme](#manifest-address-scheme)
    + [Automating tasks with Swarm-CLI](#automating-tasks-with-swarm-cli)
      - [Connectivity](#connectivity)
      - [Postage Stamps](#postage-stamps)
      - [Uploading](#uploading)
  * [Config](#config)
  * [Assignment priority](#assignment-priority)
  * [System environment](#system-environment)
- [Development](#development)
- [Contribute](#contribute)
- [Maintainers](#maintainers)
- [License](#license)

# Demo

## Purchasing a Postage Stamp

![Swarm CLI Stamp Buy Command](./docs/stamp-buy.gif)

## Uploading a File

![Swarm CLI Upload Command](./docs/upload.gif)

## Creating an Identity

![Swarm CLI Identity Create Command](./docs/identity-create.gif)

## Uploading to a Feed

![Swarm CLI Feed Upload Command](./docs/feed-upload.gif)

# Description

> Manage your Bee node and interact with the Swarm network via the CLI

The goal of this project is to handle most of the Swarm operations through CLI at some point in the future.

For the currently supported operations, see the [Commands](#commands) section.

## Installation

### From npm

To install globally (requires `npm root --global` to be writable):

```sh
npm install --global @ethersphere/swarm-cli
```

To install locally:

```sh
cd [some directory for nodejs files]
npm install @ethersphere/swarm-cli
./node_modules/.bin/swarm-cli --help
```

### From source

See the [Development](#development) section.

## Usage

The general usage is to provide a command, optionally a subcommand, then arguments and options.

`swarm-cli command [subcommand] <arguments> [options]`

Running a command with the `--help` option prints out the usage of a command.

## Commands

Running `swarm-cli` without arguments prints the available commands:

```
Swarm CLI 1.5.0 - Manage your Bee node and interact with the Swarm network via the CLI

█ Usage:

swarm-cli COMMAND [OPTIONS]

█ Available Groups:

pinning    Pin, unpin and check pinned chunks
identity   Import, export and manage keypairs, identities
feed       Upload, update and view feeds
cheque     Deposit, withdraw and manage cheques
stamp      Buy, list and show postage stamps
pss        Send, receive, or subscribe to PSS messages
manifest   Operate on manifests

Run 'swarm-cli GROUP --help' to see available commands in a group

█ Available Commands:

upload      Upload file to Swarm
download    Download arbitrary Swarm hash
status      Check API availability and Bee compatibility
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

### Uploading Files, Folders, Websites, and Arbitrary Data from stdin

#### Files

Use `swarm-cli` to upload a single file:

```
swarm-cli upload README.md
```

The command above will print a `/bzz` URL that may be opened in the browser. If the browser is able to handle the file format then the file is displayed, otherwise it will be offered to be downloaded.

#### Folders and Websites

`swarm-cli` also supports uploading folders with the same `upload` command:

```
swarm-cli upload build/
```

This also yields a `/bzz` URL. If there is an `index.html` present in the root of the folder, `--index-document` will be automatically applied by `swarm-cli`. This option sets which file the browser should open for an empty path. You may also freely set `--index-document` during upload to change this.

#### Standard Input

You can pipe data from other commands to `swarm-cli` using the `--stdin` option.

```
curl -L https://picsum.photos/200 | swarm-cli --stdin --stamp [...]
```

Unlike other upload methods, this results in a `/bytes` URL, which cannot be displayed by browsers normally. You can still share your hash and others can download it. However, with the `--name` option, you can give your arbitrary data a file name, and `swarm-cli` will attempt to determine the suitable content type for your data. Given it is successful, `swarm-cli` will print a `/bzz` URL instead of the `/bytes` URL, which is good to be displayed in browsers. Example:

```
curl -L https://picsum.photos/200 | swarm-cli --stdin --stamp [...] --name random.jpg
```

There is also a `--content-type` option if you want to adjust it manually:

```
curl -L https://picsum.photos/200 | swarm-cli --stdin --stamp [...] --name random --content-type image/jpeg
```

Please note that stdin is reserved for the data you are uploading, so interactive features are disabled during this time. Because of that, `--stamp` must be passed beforehand. You may create an alias for grabbing the ID of the least used postage stamp:

```
alias st='swarm-cli stamp list --least-used --limit 1 --hide-usage --quiet'
```

Leveraging the alias above, you can use a shortcut for uploading from stdin:

```
curl -L https://picsum.photos/200 | swarm-cli --stdin --stamp $(st)
```

### Custom HTTP Headers 

Similarly to `curl`, you may use the `--header` or `-H` option to specify as many additional headers as you want, which will be sent with all requests:

```
swarm-cli upload README.md -H "Authorization: [...]" -H "X-Custom-Header: Your Value"
```

### Autocomplete

`swarm-cli` has support for autocomplete in `bash`, `zsh` and `fish`. This turns on `<tab><tab>` suggestions which can complete commands, paths and options for you.

To enable it, you need to install it once via two options:
 - Running `swarm-cli --generate-completion` and following the instructions there
 - Running `swarm-cli --install-completion` which automatically appends the completion script to your configuration file

| Shell   | Completion System                                 | Configuration Path                       |
|---------|---------------------------------------------------|------------------------------------------|
| `bash`  | `compdef` & `compadd` OR `complete` & `COMPREPLY` | `$HOME/.bashrc` & `$HOME/.bash_profile`  |
| `zsh`   | `compdef` & `compadd` OR `complete` & `COMPREPLY` | `$HOME/.zshrc`                           |
| `fish`  | `complete`                                        | `$HOME/.config/fish/config.fish`         |

> Warning! If you start a subshell (e.g. running `bash` from `zsh`), your `SHELL` env variable would still be the old value! The generation and completion script cannot detect your shell accurately in that case, so please set `SHELL` manually. It is generally advised to run `--generate-completion` first to ensure the shell and the paths are properly detected.

Example:

```
$ SHELL=zsh
$ swarm-cli --generate-completion
Your shell is: zsh
Found configuration file path: /Users/Swarm/.zshrc

Append the completion script below to your configuration file to enable autocomplete.
You need to source your configuration, or restart your shell, to load the changes.

<script>
```

### Numerical Separator and Units

As most of the units are specified in wei and PLUR - the smallest denominations of currencies - they are a bit difficult to write out.

To aid this, you may use underscores (`_`) and `K`, `M`, `B` and `T` units to make your numbers more comprehensible.

Example:

```
swarm-cli stamp buy --amount 10M --depth 17 --gas-price 10_000_000_000_000
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

### Manifest address scheme

The `manifest` commands enable low-level operation on manifests. These always require a root manifest reference (hash) argument as the input. Some commands, however, work with subparts of the manifest. A few examples are: downloading only a folder from a manifest, listing files only under a specific path in a manifest, and adding files or folders not to the root of the manifest, but under some path.

These can be achieved by using the `bzz://<hash>/<path>` scheme in the `<address>` argument as follows:

List entries under the `/command/pss` prefix in manifest `1512546a3f4d0fea9f35fa1177486bdfe2bc2536917ad5012ee749604a7b425f`

```
swarm-cli manifest list bzz://1512546a3f4d0fea9f35fa1177486bdfe2bc2536917ad5012ee749604a7b425f/command/pss
```

Download `README.md` from manifest `1512546a3f4d0fea9f35fa1177486bdfe2bc2536917ad5012ee749604a7b425f`

```
swarm-cli manifest download bzz://1512546a3f4d0fea9f35fa1177486bdfe2bc2536917ad5012ee749604a7b425f/README.md
```

> Note: The `bzz://` protocol can be omitted.

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
swarm-cli stamp list --limit 1 --quiet --hide-usage
```

Grab the least used postage stamp:

```
swarm-cli stamp list --limit 1 --quiet --hide-usage --least-used
```

List all postage stamps with zero utilization:

```
swarm-cli stamp list --max-usage 0 --quiet --hide-usage
```

Sort postage stamps based on utilization (least utilized comes first):

```
swarm-cli stamp list --least-used --quiet
```

#### Uploading

Upload a file with the least utilized postage stamp (that has at most 50% usage):

```
STAMP=$(swarm-cli stamp list --max-usage 50 --least-used --limit 1 --quiet --hide-usage)
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

After the project has been cloned, the dependencies must be
installed. Run the following in the project folder:

```sh
 $ npm install
```

Then you need to compile the TypeScript code:

```sh
 $ npm run build
```

To make the local `swarm-cli` files in the `dist/` directory available as a global package:

```sh
 $ npm link
```

If all went well you should be able to run `swarm-cli`.

If `npm link` fails, or you don't want to install anything, then you
can use `node dist/src/index.js` to run `swarm-cli` from the checked out
directory.

# Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/ethersphere/swarm-cli/issues) and take on one of them
- Help our tests reach 100% coverage!

# Maintainers

- [Cafe137](https://github.com/Cafe137)

See what "Maintainer" means [here](https://github.com/ethersphere/repo-maintainer).

# License

[BSD-3-Clause](./LICENSE)
