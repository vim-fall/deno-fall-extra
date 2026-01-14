import { useEval } from "@denops/std/eval/use-eval";
import { feedkeys } from "@denops/std/function";
import type { RawString } from "@denops/std/eval/string";
import { type Action, defineAction } from "@vim-fall/std/action";

type Detail = {
  gin: { actionKey: RawString };
};

/**
 * Execute a gin action on the current vim-gin's buffer.
 *
 * @param denops - The Denops instance for executing Vim commands.
 * @param item - The item containing the <Plug>-mapping to invoke a gin action.
 */
export function ginActionExecute(): Action<Detail> {
  return defineAction<Detail>(
    async (denops, { item }, { signal }) => {
      if (item) {
        const key = item.detail.gin.actionKey;
        signal?.throwIfAborted();
        await useEval(denops, async (denops) => {
          await feedkeys(denops, key, "i");
        });
      }
    },
  );
}

export const defaultGinActionExecuteActions: {
  "gin-action-execute": Action<Detail>;
} = {
  "gin-action-execute": ginActionExecute(),
};
