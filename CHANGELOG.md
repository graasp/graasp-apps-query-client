# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.2.0](https://github.com/graasp/graasp-apps-query-client/compare/v3.1.0...v3.2.0) (2023-11-28)


### Features

* ensure to store array in setQueryData of post data and setting ([#210](https://github.com/graasp/graasp-apps-query-client/issues/210)) ([fad7b6f](https://github.com/graasp/graasp-apps-query-client/commit/fad7b6f74de0188d91f0a99bd1a1ed7b62a85883))


### Bug Fixes

* pass mock context when resetting the DB ([#207](https://github.com/graasp/graasp-apps-query-client/issues/207)) ([07847b8](https://github.com/graasp/graasp-apps-query-client/commit/07847b894cf34dd60b5817e72a1b48665b2d6915))
* update chatbot to be a query-client ([#199](https://github.com/graasp/graasp-apps-query-client/issues/199)) ([53fdba7](https://github.com/graasp/graasp-apps-query-client/commit/53fdba746423d662ea2a5f075403f0a670eb5d7f))

## [3.1.0](https://github.com/graasp/graasp-apps-query-client/compare/v3.0.0...v3.1.0) (2023-11-19)


### Features

* add mobile context communication ([#196](https://github.com/graasp/graasp-apps-query-client/issues/196)) ([645b37d](https://github.com/graasp/graasp-apps-query-client/commit/645b37d32b8df67c62db5043704e8a3840979b52))


### Bug Fixes

* **deps:** update dependency @graasp/sdk to v2.1.0 ([#193](https://github.com/graasp/graasp-apps-query-client/issues/193)) ([753147c](https://github.com/graasp/graasp-apps-query-client/commit/753147c509abd01f93ced643c6157f69ff03d3ba))
* return values of mock DB ([#198](https://github.com/graasp/graasp-apps-query-client/issues/198)) ([e4b584f](https://github.com/graasp/graasp-apps-query-client/commit/e4b584fad78b8cbaa748365f16bf94bf97a1a5ac))
* update deps and fix issues ([#204](https://github.com/graasp/graasp-apps-query-client/issues/204)) ([9c1293a](https://github.com/graasp/graasp-apps-query-client/commit/9c1293ad5096fabc9e3ef45eca90203690ebf2f9))

## [3.0.0](https://github.com/graasp/graasp-apps-query-client/compare/v2.0.4...v3.0.0) (2023-11-09)


### ⚠ BREAKING CHANGES

* remove immutable ([#182](https://github.com/graasp/graasp-apps-query-client/issues/182))
* add msw alternative for mocking ([#169](https://github.com/graasp/graasp-apps-query-client/issues/169))

### Features

* add a GraaspDevTools component ([4ddc15f](https://github.com/graasp/graasp-apps-query-client/commit/4ddc15f6814f3e9e01130ec04b27d9bfb9715a05))
* add msw alternative for mocking ([#169](https://github.com/graasp/graasp-apps-query-client/issues/169)) ([4ddc15f](https://github.com/graasp/graasp-apps-query-client/commit/4ddc15f6814f3e9e01130ec04b27d9bfb9715a05))
* implements chatbot post function builder (graasp/graasp[#641](https://github.com/graasp/graasp-apps-query-client/issues/641)) ([#177](https://github.com/graasp/graasp-apps-query-client/issues/177)) ([95d7b51](https://github.com/graasp/graasp-apps-query-client/commit/95d7b51143a92b8a2e464be05a5bb75b1d7321b0))
* remove immutable ([#182](https://github.com/graasp/graasp-apps-query-client/issues/182)) ([ba43537](https://github.com/graasp/graasp-apps-query-client/commit/ba435370681187eaea74fccc9670fb4eb41da385))
* transform Contexts from HOC to components for nesting ([4ddc15f](https://github.com/graasp/graasp-apps-query-client/commit/4ddc15f6814f3e9e01130ec04b27d9bfb9715a05))


### Bug Fixes

* miragejs returns empty arrays ([#172](https://github.com/graasp/graasp-apps-query-client/issues/172)) ([5beff49](https://github.com/graasp/graasp-apps-query-client/commit/5beff49951b5e1e449aa67a9e8b53f2c98c9af9a))
* update yarn to v4 ([4ddc15f](https://github.com/graasp/graasp-apps-query-client/commit/4ddc15f6814f3e9e01130ec04b27d9bfb9715a05))
* upgrade node to v18 ([4ddc15f](https://github.com/graasp/graasp-apps-query-client/commit/4ddc15f6814f3e9e01130ec04b27d9bfb9715a05))

## [2.0.4](https://github.com/graasp/graasp-apps-query-client/compare/v2.0.3...v2.0.4) (2023-09-11)


### Bug Fixes

* **deps:** update dependency @types/react to v18.2.21 ([#155](https://github.com/graasp/graasp-apps-query-client/issues/155)) ([d6945fb](https://github.com/graasp/graasp-apps-query-client/commit/d6945fb6d8700e3935685c1ca47daa21640d08d3))
* remove usage of process.env ([#163](https://github.com/graasp/graasp-apps-query-client/issues/163)) ([5d25550](https://github.com/graasp/graasp-apps-query-client/commit/5d255506ab5f3aa60f8e1bc3e33a3a07f9af9b2d))
* **ws:** checks api host to create url ([#171](https://github.com/graasp/graasp-apps-query-client/issues/171)) ([7222d01](https://github.com/graasp/graasp-apps-query-client/commit/7222d01dfe44d0b6224a1405c0154849e156dca0)), closes [#170](https://github.com/graasp/graasp-apps-query-client/issues/170)

## [2.0.3](https://github.com/graasp/graasp-apps-query-client/compare/v2.0.2...v2.0.3) (2023-08-21)


### Bug Fixes

* **hooks:** default value useAppData hook ([0b37e31](https://github.com/graasp/graasp-apps-query-client/commit/0b37e31cd3c4d04e234090cf93f2bb387fa08d7e))
* **hooks:** default values ([aa110de](https://github.com/graasp/graasp-apps-query-client/commit/aa110dedabd27c6169e246c7b5e1ba9feed4c095))

## [2.0.2](https://github.com/graasp/graasp-apps-query-client/compare/v2.0.1...v2.0.2) (2023-08-07)


### Bug Fixes

* **deps:** update dependency @graasp/sdk to v1.2.0 ([#151](https://github.com/graasp/graasp-apps-query-client/issues/151)) ([5c5cef0](https://github.com/graasp/graasp-apps-query-client/commit/5c5cef03e6e2ec718b5adfcb11ea2aeae65c932f))
* **deps:** update dependency @tanstack/react-query to v4.32.5 ([#140](https://github.com/graasp/graasp-apps-query-client/issues/140)) ([0b64530](https://github.com/graasp/graasp-apps-query-client/commit/0b645301276575a262af047b5e8d7ce668b4d7c9))
* **deps:** update dependency @types/react to v18.2.18 ([#143](https://github.com/graasp/graasp-apps-query-client/issues/143)) ([87c5b09](https://github.com/graasp/graasp-apps-query-client/commit/87c5b09f9141c8aa641ba06f3ab2d435c0b80369))
* improve notifier type ([#145](https://github.com/graasp/graasp-apps-query-client/issues/145)) ([2d57ebc](https://github.com/graasp/graasp-apps-query-client/commit/2d57ebce51775beb1c63826d8716486e0488259e))

## [2.0.1](https://github.com/graasp/graasp-apps-query-client/compare/v2.0.0...v2.0.1) (2023-07-17)


### Bug Fixes

* **deps:** update lockfile deps ([4a4b611](https://github.com/graasp/graasp-apps-query-client/commit/4a4b611adc340190225d9f43e4ba8ae2fac3c3ff))

## [2.0.0](https://github.com/graasp/graasp-apps-query-client/compare/v2.0.0-rc.1...v2.0.0) (2023-07-17)


### Bug Fixes

* **deps:** update dependency @graasp/sdk to v1.0.0 ([20db141](https://github.com/graasp/graasp-apps-query-client/commit/20db14136309f21242af09193f165cc813481e47))
* **deps:** update dependency @graasp/sdk to v1.1.1 ([#106](https://github.com/graasp/graasp-apps-query-client/issues/106)) ([beffbbf](https://github.com/graasp/graasp-apps-query-client/commit/beffbbfc66d64aeb95d23b111eb797a5ed22cc09))
* **deps:** update dependency @graasp/sdk to v1.1.2 ([#128](https://github.com/graasp/graasp-apps-query-client/issues/128)) ([cd9eea6](https://github.com/graasp/graasp-apps-query-client/commit/cd9eea67c8441125b387f9cc248dffb39929faf3))
* **deps:** update dependency @mui/icons-material to v5.13.7 ([#119](https://github.com/graasp/graasp-apps-query-client/issues/119)) ([d973368](https://github.com/graasp/graasp-apps-query-client/commit/d973368dafed5e1705c59ec357dea4c388127f7c))
* **deps:** update dependency @mui/material to v5.13.4 ([#86](https://github.com/graasp/graasp-apps-query-client/issues/86)) ([d8f5637](https://github.com/graasp/graasp-apps-query-client/commit/d8f563752f763f01774d713452235c6d55cddc0e))
* **deps:** update dependency @mui/material to v5.13.5 ([0aa9c59](https://github.com/graasp/graasp-apps-query-client/commit/0aa9c59aadb522bd1e93a5d77369ff8ab00ad571))
* **deps:** update dependency @mui/material to v5.13.7 ([#105](https://github.com/graasp/graasp-apps-query-client/issues/105)) ([1f08964](https://github.com/graasp/graasp-apps-query-client/commit/1f08964f91becfd2bdfb92674c8977949bc6f1bf))
* **deps:** update dependency @tanstack/react-query to v4.29.15 ([aeeee09](https://github.com/graasp/graasp-apps-query-client/commit/aeeee09305783a7906e72471c39946c88ece9230))
* **deps:** update dependency @tanstack/react-query to v4.29.19 ([40f97e3](https://github.com/graasp/graasp-apps-query-client/commit/40f97e3b1d063cc6f2c5d55f7be815495ce96e5c))
* **deps:** update dependency @types/jest to v29.5.3 ([#123](https://github.com/graasp/graasp-apps-query-client/issues/123)) ([60dcfaa](https://github.com/graasp/graasp-apps-query-client/commit/60dcfaa53633265b0a03a9d526b5e78e01995441))
* **deps:** update dependency @types/node to v20.4.1 ([#113](https://github.com/graasp/graasp-apps-query-client/issues/113)) ([5b00ffe](https://github.com/graasp/graasp-apps-query-client/commit/5b00ffefa14235606ddd9186fab02237ce9a646a))
* **deps:** update dependency @types/react to v18.2.11 ([#88](https://github.com/graasp/graasp-apps-query-client/issues/88)) ([6ffe907](https://github.com/graasp/graasp-apps-query-client/commit/6ffe907990a6762e87fdfc7214e21acf109d47c0))
* **deps:** update dependency @types/react to v18.2.14 ([#108](https://github.com/graasp/graasp-apps-query-client/issues/108)) ([2fe132c](https://github.com/graasp/graasp-apps-query-client/commit/2fe132cd2244539df1373a0c654261f1839b5c01))
* **deps:** update dependency typescript to v5.1.6 ([#115](https://github.com/graasp/graasp-apps-query-client/issues/115)) ([6be0371](https://github.com/graasp/graasp-apps-query-client/commit/6be0371e1c1449a2f35d37eed0af28c9342d0cbd))
* **deps:** update mui (non-major) to v5.14.0 ([#126](https://github.com/graasp/graasp-apps-query-client/issues/126)) ([68aa664](https://github.com/graasp/graasp-apps-query-client/commit/68aa66477cc55ddd17d0bb226271e90cc7f5d165))
* **deps:** update react monorepo ([aac8f6b](https://github.com/graasp/graasp-apps-query-client/commit/aac8f6bfb6773d7f53fb5d4965ec34fb2528133e))
* **deps:** update react monorepo ([#129](https://github.com/graasp/graasp-apps-query-client/issues/129)) ([d04ac32](https://github.com/graasp/graasp-apps-query-client/commit/d04ac328ca70fb9df0fb5e56c8db861a27098973))


### chore

* **deps:** update eslint packages ([#118](https://github.com/graasp/graasp-apps-query-client/issues/118)) ([684a30e](https://github.com/graasp/graasp-apps-query-client/commit/684a30e44a5a226746abd520fda3ac17f170c241))

## [2.0.0-rc.1](https://github.com/graasp/graasp-apps-query-client/compare/v1.0.0...v2.0.0-rc.1) (2023-06-07)


### ⚠ BREAKING CHANGES

* use app key, immutable cast

### Features

* use app key, immutable cast ([514a705](https://github.com/graasp/graasp-apps-query-client/commit/514a705cc681f030458e4310504cb23c3a91c37d))


### chore

* set rc release ([4d969cb](https://github.com/graasp/graasp-apps-query-client/commit/4d969cbbba390b4d73c2cb1e2908f57684064224))

## [1.0.0](https://github.com/graasp/graasp-apps-query-client/compare/v0.4.2...v1.0.0) (2023-04-25)


### ⚠ BREAKING CHANGES

* use vitejs and move to @tanstack/react-query

### Features

* move to vite for bundling ([#81](https://github.com/graasp/graasp-apps-query-client/issues/81)) ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))


### Bug Fixes

* add auto-tag workflows ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))
* allow functions as passthrough ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))
* move AppDataVisibility to types ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))
* path to JS entrypoint ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))
* update node-ci workflow ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))
* update packages ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))
* use string litterals as alternatives for visibility ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))


### build

* use vitejs and move to @tanstack/react-query ([7a275d0](https://github.com/graasp/graasp-apps-query-client/commit/7a275d0ee2a43efd80cc03082240dbfdf76cf121))

## [0.4.2](https://github.com/graasp/graasp-apps-query-client/compare/v0.4.1...v0.4.2) (2023-01-23)


### Bug Fixes

* add errors parameter to mockApi ([ad92178](https://github.com/graasp/graasp-apps-query-client/commit/ad92178c885b4ead7ea75f42922ede82d7212578)), closes [#70](https://github.com/graasp/graasp-apps-query-client/issues/70)
* add visibility attribute to AppData type ([e8930f0](https://github.com/graasp/graasp-apps-query-client/commit/e8930f0dce485e4183796572c0151367de400013))

## [0.4.1](https://github.com/graasp/graasp-apps-query-client/compare/v0.4.0...v0.4.1) (2022-12-15)


### Bug Fixes

* update dependencies and license ([1e97c68](https://github.com/graasp/graasp-apps-query-client/commit/1e97c68c635ce281cd957c4097864c882cc9d8af))


### Documentation

* add badges to readme ([#66](https://github.com/graasp/graasp-apps-query-client/issues/66)) ([26eb3ec](https://github.com/graasp/graasp-apps-query-client/commit/26eb3ece47127aa17d8ef09f2e14163fe189a99a))

## [0.4.0](https://github.com/graasp/graasp-apps-query-client/compare/v0.3.0...v0.4.0) (2022-11-18)


### Features

* add enabled option in app action hook ([470acac](https://github.com/graasp/graasp-apps-query-client/commit/470acac29da754dbf33e90bdff9b7def3d516c82))
* auto-resize detection and signaling ([#62](https://github.com/graasp/graasp-apps-query-client/issues/62)) ([c3c7dc7](https://github.com/graasp/graasp-apps-query-client/commit/c3c7dc7a22e21d9b2fe4060100fa7905025a8021))

## [0.3.0](https://github.com/graasp/graasp-apps-query-client/compare/v0.2.0...v0.3.0) (2022-10-28)


### Features

* add AppContext type ([d1c372a](https://github.com/graasp/graasp-apps-query-client/commit/d1c372a03d5ac1eb25a0552e3400dbae298ddfa7))
* expose new `useLocalContext` hook to consume LocalContext ([bfa2d94](https://github.com/graasp/graasp-apps-query-client/commit/bfa2d94b174af7f1be8b7a7b55f197a698ac3081)), closes [#52](https://github.com/graasp/graasp-apps-query-client/issues/52)
* rebase changes ([970ddee](https://github.com/graasp/graasp-apps-query-client/commit/970ddeed243d0559dcbcb25752ee958638f56281))


### Bug Fixes

* add creator prop in AppSetting type and mockServer ([b412a0c](https://github.com/graasp/graasp-apps-query-client/commit/b412a0c24e93cb30ca667f5266f0de50e4483a47))
* add default values for record ([0c4dd0d](https://github.com/graasp/graasp-apps-query-client/commit/0c4dd0dd021aa1580256d8f5a6dfc1b44262823e))
* add hoc types ([a1ff872](https://github.com/graasp/graasp-apps-query-client/commit/a1ff87204314ab7f6c9881a85b30ef61e1b838b2))
* add return type of useAppContext ([a56bf9c](https://github.com/graasp/graasp-apps-query-client/commit/a56bf9cbac1bcabff7e4ccaae9db42c25fd6e79f))
* allow react-18 as peer dependency ([183ef9d](https://github.com/graasp/graasp-apps-query-client/commit/183ef9dc99f9833e7b353ae069a55e5b56bca617))
* argument type for withContext HOC ([1bdd97d](https://github.com/graasp/graasp-apps-query-client/commit/1bdd97d2dc6dfa2c0fd0fcabc645eaee38083ce5))
* change context type to union type in LocalContext ([9d9ddc9](https://github.com/graasp/graasp-apps-query-client/commit/9d9ddc9c60d79bb45439ab12178aca07eb532e75))
* create appAction routine argument ([02985a1](https://github.com/graasp/graasp-apps-query-client/commit/02985a1ee74b437bcdcff9dc999e89597438d616))
* create union type from enum and apply PR changes ([c2c3d4f](https://github.com/graasp/graasp-apps-query-client/commit/c2c3d4fdbdced96e512cf3f6f1774ec72f9a5155))
* date format ([0bf3668](https://github.com/graasp/graasp-apps-query-client/commit/0bf366800567fe2f09bdde47f29e5393b73fc239))
* include types in index ([935462a](https://github.com/graasp/graasp-apps-query-client/commit/935462a62d9f020c0e1904580129e76a4e43e4ba))
* rename Context enum to CONTEXTS ([0887d9f](https://github.com/graasp/graasp-apps-query-client/commit/0887d9f9a8e5df367855efc0acde4d2c5cce2c06))
* rename types in index ([e80403a](https://github.com/graasp/graasp-apps-query-client/commit/e80403af547ae891216e2cc3d01b4c46bef0454a))
* test with updated dependencies ([3ca4ecb](https://github.com/graasp/graasp-apps-query-client/commit/3ca4ecb1138dd5c5666d06046fd8ab899ab46fec))
* type of record ([b1d92c2](https://github.com/graasp/graasp-apps-query-client/commit/b1d92c2712f3d9d48200fc87541e6208f1a21109))
* update types of localContext record HOC ([e3ec641](https://github.com/graasp/graasp-apps-query-client/commit/e3ec641ba504aee61c57f3a5c9f752de992aabd6))
* use List instead of array in AppContextRecord ([8857368](https://github.com/graasp/graasp-apps-query-client/commit/8857368fb735332e6169ccd1891dc06057b2b8ce))

## [0.2.0](https://github.com/graasp/graasp-apps-query-client/compare/v0.1.1...v0.2.0) (2022-06-27)


### Features

* specify types in axios responses ([f44cfc1](https://github.com/graasp/graasp-apps-query-client/commit/f44cfc163095ebf2b1b93a6629f2ba9a450ff25b))

### 0.1.1 (2022-06-03)


### Features

* add app settings hooks and mutations ([1c6ae48](https://github.com/graasp/graasp-apps-query-client/commit/1c6ae483cbb4d3c91d3b1e5945a1f55310177fff))
* add get file hook ([75b4491](https://github.com/graasp/graasp-apps-query-client/commit/75b4491a52609ddab5aeaaea76d791004b5ae6e6))
* add hook for app actions ([5a581da](https://github.com/graasp/graasp-apps-query-client/commit/5a581da84ff1cf0ca7ba2aa31f004a1fdb8f0a53))
* add post, patch, init hooks ([30c142d](https://github.com/graasp/graasp-apps-query-client/commit/30c142d9ebd58bbd814c9522ea189985f4f09169))
* expose refetchInterval ([6efb82e](https://github.com/graasp/graasp-apps-query-client/commit/6efb82e4d2c2eb2e2d45476de42f548275a0518d))
* implement get app actions ([b09d381](https://github.com/graasp/graasp-apps-query-client/commit/b09d381a3071231dcabd1876b029602d906d4f12))
* implement postAppAction ([e2d053e](https://github.com/graasp/graasp-apps-query-client/commit/e2d053e75df1150c3cc71d9f15caecbf86bbaea1))
* mock app actions ([089f20c](https://github.com/graasp/graasp-apps-query-client/commit/089f20c2b5832aeeedf4537ad716d87a855abaf4))


### Bug Fixes

* add 'unknown' type instead of 'any' and run prettier ([a3e1d9f](https://github.com/graasp/graasp-apps-query-client/commit/a3e1d9ff95ca4878b54e8a9b047e13b5d9bac48b))
* add types ([625fd3d](https://github.com/graasp/graasp-apps-query-client/commit/625fd3d10ac1b8cb8cb1a56ac434748d4f4c38db))
* change AppAction type ([6267a5a](https://github.com/graasp/graasp-apps-query-client/commit/6267a5ad1d5856b51c519605dca47b420e20e80c))
* make `appAction` plural ([1fa013c](https://github.com/graasp/graasp-apps-query-client/commit/1fa013c3fb24f7fde01f83d87881faa903a8af67))
* minor fixes ([cd118ec](https://github.com/graasp/graasp-apps-query-client/commit/cd118ece2d92a907a551506b0094cfb9d14a3ff9))
* remove plural (Actions) in mockServer.js ([2e68a80](https://github.com/graasp/graasp-apps-query-client/commit/2e68a80323d88d55e192bb5eec77fb212b0adcac))
* remove responseType in postAppAction ([4708bbc](https://github.com/graasp/graasp-apps-query-client/commit/4708bbc33ff0c3a68e124cbac76537bc848b59b1))
* see [review](https://github.com/graasp/graasp-apps-query-client/pull/14#pullrequestreview-906891547) ([4e3d54a](https://github.com/graasp/graasp-apps-query-client/commit/4e3d54a6e8ad6e2e39bd716f1c025cb96b5e10df)), closes [/github.com/graasp/graasp-apps-query-client/pull/14#pullrequestreview-906891547](https://github.com/graasp//github.com/graasp/graasp-apps-query-client/pull/14/issues/pullrequestreview-906891547)
