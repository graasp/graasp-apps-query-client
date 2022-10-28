# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
