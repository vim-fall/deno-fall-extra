import type { Denops } from "@denops/std";
import { collect } from "@denops/std/batch";
import { zip } from "@std/collections/zip";
import { defineRenderer, type Renderer } from "@vim-fall/std/renderer";
import { getByteLength } from "@vim-fall/std/util/stringutil";

type Detail = {
  path: string;
};

/**
 * Nerdfont renderer for displaying file paths with appropriate icons.
 *
 * This renderer adds icons to file paths based on their types or extensions.
 * The icons are fetched using the `nerdfont#find` Vim function.
 * Each item's label is updated with the icon prefix, and the decorations (column positions)
 * are adjusted accordingly.
 *
 * > [!NOTE]
 * >
 * > The `@vim-fall/std/builtin/renderer/nerdfont` renderer is a more efficient, built-in option
 * > for this purpose and should be preferred for better performance.
 *
 * @returns {Renderer<Detail>} The renderer action.
 */
export function nerdfont(): Renderer<Detail> {
  return defineRenderer(async (denops, { items }, { signal }) => {
    // Collect paths from items to fetch corresponding icons.
    const paths = items.map((v) => v.detail.path);

    // Use `collect` to fetch icons for each file path.
    const icons = await collect(
      denops,
      (denops) => paths.map((v) => findIcon(denops, v)),
    );
    signal?.throwIfAborted(); // Check for any abortion signals before proceeding.

    // Combine items with their corresponding icons using `zip`.
    zip(items, icons).forEach(([item, icon]) => {
      signal?.throwIfAborted(); // Ensure no abortion signal during the iteration.

      // Add the icon prefix to the item's label.
      const prefix = `${icon}  `;
      const offset = getByteLength(prefix); // Calculate the byte length of the prefix.

      // Adjust the column positions of the decorations to account for the added prefix.
      const decorations = item.decorations.map((v) => ({
        ...v,
        column: v.column + offset, // Offset column positions by the length of the icon prefix.
      }));

      // Update the item's label and decorations.
      item.label = `${prefix}${item.label}`;
      item.decorations = decorations;
    });
  });
}

/**
 * Find the appropriate icon for a given file path.
 * This uses the `nerdfont#find` function in Vim to retrieve the icon.
 *
 * @param denops - The Denops instance used for calling Vim functions.
 * @param path - The file path to look for an icon.
 * @returns {Promise<string>} The icon string.
 */
function findIcon(denops: Denops, path: string): Promise<string> {
  return denops.call("nerdfont#find", path, false) as Promise<string>;
}
