# Changelog

## [1.5.0](https://www.github.com/ethersphere/swarm-cli/compare/v1.4.0...v1.5.0) (2021-10-15)


### Features

* add bee 1.2.0 and bee-js 2.1.0 compatibility ([#260](https://www.github.com/ethersphere/swarm-cli/issues/260)) ([419ef8d](https://www.github.com/ethersphere/swarm-cli/commit/419ef8d8e3a7e8ff6dc5ec5e1be7a1458756457b))
* add content-type flag and mime detection ([#221](https://www.github.com/ethersphere/swarm-cli/issues/221)) ([ca17ddf](https://www.github.com/ethersphere/swarm-cli/commit/ca17ddf922e52ba2d996c108360e4a5be01e8b39))
* add dilute and topup stamp commands ([#267](https://www.github.com/ethersphere/swarm-cli/issues/267)) ([2f55c68](https://www.github.com/ethersphere/swarm-cli/commit/2f55c68ed05154ad9bb52a74151fd6c680859cb7))
* improve error message design ([#262](https://www.github.com/ethersphere/swarm-cli/issues/262)) ([b19957d](https://www.github.com/ethersphere/swarm-cli/commit/b19957d199a5cd09ef5191912b0a9d96a33bfa7a))


### Bug Fixes

* print relevant error message for bad manifest references ([#264](https://www.github.com/ethersphere/swarm-cli/issues/264)) ([2e613a0](https://www.github.com/ethersphere/swarm-cli/commit/2e613a053cddddd982865893f927301d01dfe5f2))

## [1.4.0](https://www.github.com/ethersphere/swarm-cli/compare/v1.3.0...v1.4.0) (2021-09-29)


### Features

* add manifest commands ([#237](https://www.github.com/ethersphere/swarm-cli/issues/237)) ([277e09e](https://www.github.com/ethersphere/swarm-cli/commit/277e09e6da87ba002696ed388eb9f5af6c3421bc))
* improve error logging and troubleshooting ([#241](https://www.github.com/ethersphere/swarm-cli/issues/241)) ([96a5c5a](https://www.github.com/ethersphere/swarm-cli/commit/96a5c5a58cbe5f744bed325d20ff40df41dc10d4))
* print bee api urls in status command ([#239](https://www.github.com/ethersphere/swarm-cli/issues/239)) ([6d9672b](https://www.github.com/ethersphere/swarm-cli/commit/6d9672b3a887dd115f529ab0d1348e035e10e49b))

## [1.3.0](https://www.github.com/ethersphere/swarm-cli/compare/v1.2.0...v1.3.0) (2021-08-24)


### Features

* add bee 1.1.0 compatibility ([#232](https://www.github.com/ethersphere/swarm-cli/issues/232)) ([dad081e](https://www.github.com/ethersphere/swarm-cli/commit/dad081edc798596306ff908bf0e57be88e227ef0))
* add immutable flag to stamp buy command ([#233](https://www.github.com/ethersphere/swarm-cli/issues/233)) ([a74df33](https://www.github.com/ethersphere/swarm-cli/commit/a74df33eda53523ea163e3745885c1a95cb82d39))
* enforce explicit debug api when normal api is provided ([#225](https://www.github.com/ethersphere/swarm-cli/issues/225)) ([229fcd1](https://www.github.com/ethersphere/swarm-cli/commit/229fcd1810173fd229fcb3c197a9e3f5a04800bb))
* rework --skip-sync to --sync with connectivity check ([#217](https://www.github.com/ethersphere/swarm-cli/issues/217)) ([1948ed8](https://www.github.com/ethersphere/swarm-cli/commit/1948ed8ed79827179599495b192525b666a56154))


### Bug Fixes

* always set correct exit code ([#229](https://www.github.com/ethersphere/swarm-cli/issues/229)) ([58bf091](https://www.github.com/ethersphere/swarm-cli/commit/58bf091b70aeb2cf73da8d94a29773e7be8e526f))
* do not print double slashes in joined bee urls ([#228](https://www.github.com/ethersphere/swarm-cli/issues/228)) ([e24465c](https://www.github.com/ethersphere/swarm-cli/commit/e24465c4333c838b0bfd0bf834b88d98b091d5d7))
* print index-document before spinner to avoid text glitch ([#220](https://www.github.com/ethersphere/swarm-cli/issues/220)) ([9f596f4](https://www.github.com/ethersphere/swarm-cli/commit/9f596f4b40905dfbe7805e175680949f3415bcf7))

## [1.2.0](https://www.github.com/ethersphere/swarm-cli/compare/v1.1.0...v1.2.0) (2021-07-21)


### Features

* add --curl global option ([#185](https://www.github.com/ethersphere/swarm-cli/issues/185)) ([674fafb](https://www.github.com/ethersphere/swarm-cli/commit/674fafb3628cd9479c15e55a427da16d6d6f185b))
* add auto-completion system ([#209](https://www.github.com/ethersphere/swarm-cli/issues/209)) ([5796876](https://www.github.com/ethersphere/swarm-cli/commit/5796876f992e132522403ce087d53bedc184c7b4))
* add spinner to feed operations ([#197](https://www.github.com/ethersphere/swarm-cli/issues/197)) ([94f198c](https://www.github.com/ethersphere/swarm-cli/commit/94f198ca301580d17c9fd9ac62547d9dce7a2c7d))
* add topology info to status command ([#198](https://www.github.com/ethersphere/swarm-cli/issues/198)) ([9805f92](https://www.github.com/ethersphere/swarm-cli/commit/9805f92da8807c01ef98155ee8bd13fd081e7b33))
* add wait-usable option to stamp buy with verbose mode support ([#212](https://www.github.com/ethersphere/swarm-cli/issues/212)) ([0e4a794](https://www.github.com/ethersphere/swarm-cli/commit/0e4a79415d491a258ee681cfce956dfdee4b8070))
* establish color system with chalk ([#207](https://www.github.com/ethersphere/swarm-cli/issues/207)) ([f6cf189](https://www.github.com/ethersphere/swarm-cli/commit/f6cf18967e9a1a3aa0b4a3080e8e4730b2e315be))


### Bug Fixes

* change old /files endpoints to /bzz in feed commands ([#204](https://www.github.com/ethersphere/swarm-cli/issues/204)) ([28a2d3a](https://www.github.com/ethersphere/swarm-cli/commit/28a2d3a6713887d1e860d92308edaa08376465d8))
* handle payload size errors in pss send ([#199](https://www.github.com/ethersphere/swarm-cli/issues/199)) ([4ec8fbc](https://www.github.com/ethersphere/swarm-cli/commit/4ec8fbcb95d7f700f64b5d1eaba46a35e3f13988))

## [1.1.0](https://www.github.com/ethersphere/swarm-cli/compare/v1.0.0...v1.1.0) (2021-07-05)


### Features

* switch to streaming upload in case of single files ([#184](https://www.github.com/ethersphere/swarm-cli/issues/184)) ([e7ebbc9](https://www.github.com/ethersphere/swarm-cli/commit/e7ebbc989d5498d5963176fc2ed8b3a0c24ea57e))
* add --encrypt to upload ([#183](https://www.github.com/ethersphere/swarm-cli/issues/183)) ([47ddc94](https://www.github.com/ethersphere/swarm-cli/commit/47ddc944dc20b36c0a05e716ef6ce453f3a771d6))
* add --drop-name to upload ([#167](https://www.github.com/ethersphere/swarm-cli/issues/167)) ([8fc60be](https://www.github.com/ethersphere/swarm-cli/commit/8fc60bea546cbbd9bb7e9d8a82da3b4e7155c71b))
* track chunk sync progress after upload ([#167](https://www.github.com/ethersphere/swarm-cli/issues/167)) ([8fc60be](https://www.github.com/ethersphere/swarm-cli/commit/8fc60bea546cbbd9bb7e9d8a82da3b4e7155c71b))
* print stamp after usage ([#167](https://www.github.com/ethersphere/swarm-cli/issues/167)) ([8fc60be](https://www.github.com/ethersphere/swarm-cli/commit/8fc60bea546cbbd9bb7e9d8a82da3b4e7155c71b))


### Bug Fixes

* **cashout:** set minimum of minimum to 1 ([#176](https://www.github.com/ethersphere/swarm-cli/issues/176)) ([1db096f](https://www.github.com/ethersphere/swarm-cli/commit/1db096f272fd4983c8a14e145694ddda9148f411))
* print trailing slash when uploading single file ([#194](https://www.github.com/ethersphere/swarm-cli/issues/194)) ([1bfee2b](https://www.github.com/ethersphere/swarm-cli/commit/1bfee2b1c72f390f0ad351a195eb7d95300f037a))
* reduce spinner interval to avoid flickering on windows ([#188](https://www.github.com/ethersphere/swarm-cli/issues/188)) ([0eedf7b](https://www.github.com/ethersphere/swarm-cli/commit/0eedf7b74d894f839620728ad10d967dc5c817ac))

## [1.0.0](https://www.github.com/ethersphere/swarm-cli/compare/v0.10.0...v1.0.0) (2021-06-22)


### Features

* add addresses command ([#160](https://www.github.com/ethersphere/swarm-cli/issues/160)) ([03457d9](https://www.github.com/ethersphere/swarm-cli/commit/03457d9e2c043b88cd582405c6c5e018448a8d4e))
* add new stamp properties ([#165](https://www.github.com/ethersphere/swarm-cli/issues/165)) ([4000072](https://www.github.com/ethersphere/swarm-cli/commit/4000072c428875dc6791f2311aa431300dd68796))
* add filter, sort and limit to stamp list ([#165](https://www.github.com/ethersphere/swarm-cli/issues/165)) ([4000072](https://www.github.com/ethersphere/swarm-cli/commit/4000072c428875dc6791f2311aa431300dd68796))
* add upload size warning ([#153](https://www.github.com/ethersphere/swarm-cli/issues/153)) ([218bd41](https://www.github.com/ethersphere/swarm-cli/commit/218bd41126334242478b2043e874ee2bc81bbcb1))

## [0.10.0](https://www.github.com/ethersphere/swarm-cli/compare/v0.9.0...v0.10.0) (2021-06-11)


### Features

* add number separators, units, conditional required, hex strings ([#137](https://www.github.com/ethersphere/swarm-cli/issues/137)) ([397680d](https://www.github.com/ethersphere/swarm-cli/commit/397680d5e7a239b3c41b8da4d406e349f1bea76a))
* add pinning reupload-all ([#138](https://www.github.com/ethersphere/swarm-cli/issues/138)) ([31a69ea](https://www.github.com/ethersphere/swarm-cli/commit/31a69ea8de92cc3066f55188f30d9390028e4f7a))


### Bug Fixes

* remove topic option from pss commands ([#144](https://www.github.com/ethersphere/swarm-cli/issues/144)) ([76e7f51](https://www.github.com/ethersphere/swarm-cli/commit/76e7f51d4c2129e7cf1e57f47cda2b76a29af10d))

## [0.9.0](https://www.github.com/ethersphere/swarm-cli/compare/v0.8.0...v0.9.0) (2021-06-04)


### Features

* add pss commands ([#128](https://www.github.com/ethersphere/swarm-cli/issues/128)) ([b8e845f](https://www.github.com/ethersphere/swarm-cli/commit/b8e845f3d21741c4a6b1c6665e9739f1783243d8))

## [0.8.0](https://www.github.com/ethersphere/swarm-cli/compare/v0.7.0...v0.8.0) (2021-06-01)


### Features

* add stamp reupload command ([#121](https://www.github.com/ethersphere/swarm-cli/issues/121)) ([9ff1827](https://www.github.com/ethersphere/swarm-cli/commit/9ff18272eb1bce5e877ed05211b8d2456032b0ce))
* add status command ([#121](https://www.github.com/ethersphere/swarm-cli/issues/121)) ([9ff1827](https://www.github.com/ethersphere/swarm-cli/commit/9ff18272eb1bce5e877ed05211b8d2456032b0ce))
* improve error reporting ([#121](https://www.github.com/ethersphere/swarm-cli/issues/121)) ([9ff1827](https://www.github.com/ethersphere/swarm-cli/commit/9ff18272eb1bce5e877ed05211b8d2456032b0ce))
* add gas-price and gas-header options to cashout ([#121](https://www.github.com/ethersphere/swarm-cli/issues/121)) ([9ff1827](https://www.github.com/ethersphere/swarm-cli/commit/9ff18272eb1bce5e877ed05211b8d2456032b0ce))
* add interactive stamp picker ([#111](https://www.github.com/ethersphere/swarm-cli/issues/111)) ([6ad1963](https://www.github.com/ethersphere/swarm-cli/commit/6ad1963c0ca7a0bbe400e72b14ceb8962934c2a7))


### Bug Fixes

* remove invalid bin field ([#115](https://www.github.com/ethersphere/swarm-cli/issues/115)) ([9304a04](https://www.github.com/ethersphere/swarm-cli/commit/9304a041e28464a86ad6ba4c2d20fd7cc5777b71))

## [0.7.0](https://www.github.com/ethersphere/swarm-cli/compare/v0.6.0...v0.7.0) (2021-05-20)


### Features

* add postage stamp commands ([#98](https://www.github.com/ethersphere/swarm-cli/issues/98)) ([44f961f](https://www.github.com/ethersphere/swarm-cli/commit/44f961fb8780dd8a557e40497e0c1d68d67e9ef6))

## [0.6.0](https://www.github.com/ethersphere/swarm-cli/compare/v0.5.1...v0.6.0) (2021-05-05)


### Features

* add --skip-sync flag to upload and feed upload ([#71](https://www.github.com/ethersphere/swarm-cli/issues/71)) ([ba525ae](https://www.github.com/ethersphere/swarm-cli/commit/ba525ae0d4a63296bbc7ea74320f48f6654d709c))
* add aliases for common commands ([#68](https://www.github.com/ethersphere/swarm-cli/issues/68)) ([572a8cf](https://www.github.com/ethersphere/swarm-cli/commit/572a8cf960d88a2add07ca2ec8907515fde1f49f))
* add cheque commands ([#69](https://www.github.com/ethersphere/swarm-cli/issues/69)) ([0f2e499](https://www.github.com/ethersphere/swarm-cli/commit/0f2e49928aaf5904c2456d21a278712a27c4c4d6))
* add pinning commands ([#73](https://www.github.com/ethersphere/swarm-cli/issues/73)) ([33137e7](https://www.github.com/ethersphere/swarm-cli/commit/33137e78ced67557c4bd1a3a3f922e68c68c8533))
* aliases, verbose and quiet mode, feed print with public address ([#57](https://www.github.com/ethersphere/swarm-cli/issues/57)) ([5f612b9](https://www.github.com/ethersphere/swarm-cli/commit/5f612b9c15d7213dd63ed37f90124f9db72060b2))
* bee debug api url config and env ([#78](https://www.github.com/ethersphere/swarm-cli/issues/78)) ([9cf54e8](https://www.github.com/ethersphere/swarm-cli/commit/9cf54e8b8f1cca2c471717ad077bd5455ab5f608))
* enhance usage printing ([#93](https://www.github.com/ethersphere/swarm-cli/issues/93)) ([69bb17b](https://www.github.com/ethersphere/swarm-cli/commit/69bb17b8c1f1684d3b04db53909118e9c57fe135))
* pinning gateway handling ([#94](https://www.github.com/ethersphere/swarm-cli/issues/94)) ([b5643d7](https://www.github.com/ethersphere/swarm-cli/commit/b5643d759914487f2913616c04d54030f31363b5))


### Bug Fixes

* handle not found and bad request pinning errors ([#81](https://www.github.com/ethersphere/swarm-cli/issues/81)) ([c0973fc](https://www.github.com/ethersphere/swarm-cli/commit/c0973fc05676b72d49e07f0c1bb5c5b8bf3a06cf))
* remove --minimum option where it makes no sense ([#84](https://www.github.com/ethersphere/swarm-cli/issues/84)) ([e1d231b](https://www.github.com/ethersphere/swarm-cli/commit/e1d231b546974057acc6c870f12ec5f60a55c965))

### [0.5.1](https://www.github.com/ethersphere/swarm-cli/compare/v0.5.0...v0.5.1) (2021-03-18)


### Bug Fixes

* readme usage ([#47](https://www.github.com/ethersphere/swarm-cli/issues/47)) ([03b15d2](https://www.github.com/ethersphere/swarm-cli/commit/03b15d2fca6216439530a89d32bc7208c1be1cba))

## 0.5.0 (2021-03-18)


### Features

* base CLI project setup ([#1](https://www.github.com/ethersphere/swarm-cli/issues/1)) ([d3c2998](https://www.github.com/ethersphere/swarm-cli/commit/d3c299863c344e9305288cb0f2d48e1436b7bdf7))
* feed upload, update and print commands ([#32](https://www.github.com/ethersphere/swarm-cli/issues/32)) ([ff503d6](https://www.github.com/ethersphere/swarm-cli/commit/ff503d699429c65b01ef9423573dac3b426e3c78))
* identity ([#6](https://www.github.com/ethersphere/swarm-cli/issues/6)) ([2c41524](https://www.github.com/ethersphere/swarm-cli/commit/2c41524bff4df866b1d699530a032399d78038ac))
* identity import and export ([10ce9b7](https://www.github.com/ethersphere/swarm-cli/commit/10ce9b70fbe27005776877c76a25ecba14836ddb))
* upload files ([#3](https://www.github.com/ethersphere/swarm-cli/issues/3)) ([0ae1264](https://www.github.com/ethersphere/swarm-cli/commit/0ae1264379c035f31b4408df88441a83b0634f9c))
