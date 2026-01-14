import type { Denops } from "@denops/std";
import { type RawString, rawString as r } from "@denops/std/eval/string";
import { enumerate } from "@core/iterutil/enumerate";
import { defineSource, type Source } from "@vim-fall/std/source";

type Detail = {
  fern: { actionKey: RawString };
};

// This function returns all of the <Plug>-mappings of fern's actions.
async function listFernMaps(denops: Denops) {
  return await denops.eval(
    "maplist()->filter({_, v -> stridx(v.lhs, '<Plug>(fern-action-') == 0})->map({_, v -> v.lhs})",
  ) as string[];
}

// This function defines a source for fern's actions mainly provided by vim-fern
// plugin.
export function fernAction(): Source<Detail> {
  return defineSource(async function* (denops, _params, { signal }) {
    const maps = await listFernMaps(denops);
    signal?.throwIfAborted();

    const allActions = maps.map((v) =>
      v.match(/^<Plug>\(fern-action-(.*)\)/)![1]
    );
    const actions = new Set(allActions);

    signal?.throwIfAborted();
    allActions.filter((v) => v.endsWith("=")).forEach((v) => {
      if (actions.has(v.substring(0, v.length - 1))) {
        actions.delete(v);
      }
    });

    for (const [id, action] of enumerate(actions)) {
      signal?.throwIfAborted();
      yield {
        id,
        value: action,
        detail: { fern: { actionKey: r`\<Plug>(fern-action-${action})` } },
      };
    }
  });
}
