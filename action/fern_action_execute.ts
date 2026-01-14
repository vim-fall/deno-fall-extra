import { useEval } from "@denops/std/eval/use-eval";
import { feedkeys } from "@denops/std/function";
import type { RawString } from "@denops/std/eval/string";
import { type Action, defineAction } from "@vim-fall/std/action";

type Detail = {
  fern: { actionKey: RawString };
};

/**
 * Execute a fern action on the current vim-fern's buffer.
 *
 * @param denops - The Denops instance for executing Vim commands.
 * @param item - The item containing the <Plug>-mapping to invoke a fern action.
 */
export function fernActionExecute(): Action<Detail> {
  return defineAction<Detail>(
    async (denops, { item }, { signal }) => {
      if (item) {
        const key = item.detail.fern.actionKey;
        signal?.throwIfAborted();
        await useEval(denops, async (denops) => {
          await feedkeys(denops, key, "i");
        });
      }
    },
  );
}

export const defaultFernActionExecuteActions: {
  "fern-action-execute": Action<Detail>;
} = {
  "fern-action-execute": fernActionExecute(),
};
