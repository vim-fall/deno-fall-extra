import type { Denops } from "@denops/std";
import { type Action, defineAction } from "@vim-fall/std/action";

// MR (Most Recently Used, Written, Repositories, Directories) type options
type MrType = "mru" | "mrw" | "mrr" | "mrd";

// Detail type that represents the file path
type Detail = {
  path: string;
  mr: {
    type: MrType;
  };
};

/**
 * Deletes a file from the MR (Most Recently Used, Written, Repositories, or Directories) list.
 *
 * This action will remove the specified file path from the corresponding MR list based on the `mr.type` (mru, mrw, mrr, mrd).
 *
 * @param denops - The Denops instance for executing Vim commands.
 * @param item - The item containing the file path and its MR type.
 * @param selectedItems - The selected items to delete. If not provided, it defaults to a single item.
 */
export function mrDelete(): Action<Detail> {
  return defineAction(async (denops, { item, selectedItems }) => {
    const items = selectedItems ?? [item];
    for (const item of items.filter((v) => !!v)) {
      await deletePath(denops, item.detail.mr.type, item.detail.path);
    }
  });
}

/**
 * Deletes the file path from the specified MR (Most Recently Used, Written, Repositories, or Directories) list.
 *
 * @param denops - The Denops instance for executing Vim commands.
 * @param type - The MR list type (mru, mrw, mrr, mrd).
 * @param path - The file path to delete from the MR list.
 */
async function deletePath(
  denops: Denops,
  type: MrType,
  path: string,
): Promise<void> {
  // Correctly calls the delete function for the specific MR list type
  await denops.call(`mr#${type}#delete`, path);
}

export const defaultMrDeleteActions: {
  "mr-delete": Action<Detail>;
} = {
  "mr-delete": mrDelete(),
};
