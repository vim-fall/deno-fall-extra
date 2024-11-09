import type { Denops } from "@denops/std";
import { collect } from "@denops/std/batch";
import { zip } from "@std/collections/zip";
import { defineRenderer, type Renderer } from "@vim-fall/std/renderer";
import { getByteLength } from "@vim-fall/std/util/stringutil";

type Detail = {
  path: string;
};

/**
 * Devicons renderer for displaying file paths with appropriate icons.
 *
 * This renderer uses the `WebDevIconsGetFileTypeSymbol` Vim function to get the icon
 * for each file type based on its path. The icon is then prepended to the label of each
 * item in the list. Additionally, the column positions of the item's decorations are
 * adjusted accordingly.
 *
 * > [!NOTE]
 * >
 * > The `@vim-fall/std/builtin/renderer/nerdfont` renderer is a more efficient, built-in option
 * > for this purpose and should be preferred for better performance.
 *
 * @returns {Renderer<Detail>} The renderer action that adds icons to the file paths.
 */
export function devicons(): Renderer<Detail> {
  return defineRenderer(async (denops, { items }, { signal }) => {
    // Collect the file paths from the items to retrieve the corresponding icons.
    const paths = items.map((v) => v.detail.path);

    // Use `collect` to fetch the icons for each file path.
    const icons = await collect(
      denops,
      (denops) => paths.map((v) => findIcon(denops, v)),
    );
    signal?.throwIfAborted(); // Check if the operation is aborted.

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
 * This uses the `WebDevIconsGetFileTypeSymbol` function in Vim to retrieve the icon.
 *
 * @param denops - The Denops instance used for calling Vim functions.
 * @param path - The file path to look for an icon.
 * @returns {Promise<string>} The icon string.
 */
function findIcon(denops: Denops, path: string): Promise<string> {
  return denops.call("WebDevIconsGetFileTypeSymbol", path, 0) as Promise<
    string
  >;
}
