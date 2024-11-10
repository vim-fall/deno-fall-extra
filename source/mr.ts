import type { Denops } from "@denops/std";
import { defineSource, type Source } from "@vim-fall/std/source";

type Detail = {
  path: string;
  mr: {
    type: MrType;
  };
};

export type MrOptions = {
  /** MR (Most Recently Used, Written, Repositories, Directories) type options */
  type?: MrType;
};

// MR (Most Recently Used, Written, Repositories, Directories) type options
type MrType = "mru" | "mrw" | "mrr" | "mrd";

// This function defines a source for MRU/MRW/MRR/MRD files using the vim-mr plugin
export function mr(options: MrOptions = {}): Source<Detail> {
  const type = options.type ?? "mru"; // Default to MRU files
  return defineSource(async function* (denops) {
    let id = 0;
    // Fetch the list of files based on the specified type (MRU/MRW/MRR/MRD)
    for (const path of await listMrFiles(denops, type)) {
      yield {
        id: id++,
        value: path,
        detail: { path, mr: { type } },
      };
    }
  });
}

// Function to fetch files from the vim-mr plugin, based on the type
async function listMrFiles(denops: Denops, type: MrType): Promise<string[]> {
  return await denops.dispatch("mr", `${type}:list`) as string[];
}
