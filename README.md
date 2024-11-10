# 🍂 fall-extra

[![JSR](https://jsr.io/badges/@vim-fall/extra)](https://jsr.io/@vim-fall/extra)
[![Deno](https://img.shields.io/badge/Deno%202.x-333?logo=deno&logoColor=fff)](#)
[![Test](https://github.com/vim-fall/fall-extra/actions/workflows/test.yml/badge.svg)](https://github.com/vim-fall/fall-extra/actions/workflows/test.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Extra library for using [Fall](https://github.com/vim-fall/fall), a Vim/Neovim
Fuzzy Finder plugin powered by
[Denops](https://github.com/vim-denops/denops.vim).

## Usage

Extensions are available in the root directory. You can access them like this:

```typescript
import * as extra from "jsr:@vim-fall/extra";

// Display all sources
console.log(extra.source);

// Display all renderers
console.log(extra.renderer);

// Display all actions
console.log(extra.action);
```

For builtin extensions or utility functions, check out
[vim-fall/fall-std](https://github.com/vim-fall/fall-std)
([`@vim-fall/std`](https://jsr.io/@vim-fall/std)).

## License

The code in this repository follows the MIT license, as detailed in
[LICENSE](./LICENSE). Contributors must agree that any modifications submitted
to this repository also adhere to the license.
