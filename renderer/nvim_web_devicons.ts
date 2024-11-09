import type { Denops } from "@denops/std";
import { collect } from "@denops/std/batch";
import { zip } from "@std/collections/zip";
import { extname } from "@std/path/extname";
import { defineRenderer, type Renderer } from "@vim-fall/std/renderer";
import { getByteLength } from "@vim-fall/std/util/stringutil";

type Detail = {
  path: string;
};

/**
 * Renderer for displaying file paths with appropriate icons using `nvim-web-devicons`.
 *
 * This renderer uses the `nvim-web-devicons` library to retrieve and display icons
 * based on the file path's extension. The icon is prepended to each item's label, and
 * the column positions of the item's decorations are adjusted accordingly.
 *
 * > [!NOTE]
 * >
 * > The `@vim-fall/std/builtin/renderer/nerdfont` renderer is a more efficient, built-in option
 * > for this purpose and should be preferred for better performance.
 *
 * @returns {Renderer<Detail>} The renderer that adds icons to file paths based on their extensions.
 */
export function nvimWebDevicons(): Renderer<Detail> {
  return defineRenderer(async (denops, { items }, { signal }) => {
    // Collect the file paths from the items.
    const paths = items.map((v) => v.detail.path);

    // Retrieve the icons for each file path using the `nvim-web-devicons` library.
    const icons = await collect(
      denops,
      (denops) => paths.map((v) => findIcon(denops, v)),
    );
    signal?.throwIfAborted(); // Ensure the operation has not been aborted.

    // Combine items with their corresponding icons.
    zip(items, icons).forEach(([item, icon]) => {
      signal?.throwIfAborted(); // Check if the operation is aborted.

      // Add the icon prefix to the label.
      const prefix = `${icon}  `;
      const offset = getByteLength(prefix); // Calculate byte length of the prefix.

      // Adjust the column positions of the decorations to account for the icon prefix.
      const decorations = item.decorations.map((v) => ({
        ...v,
        column: v.column + offset, // Offset column positions by the icon's byte length.
      }));

      // Update the item label and its decorations.
      item.label = `${prefix}${item.label}`;
      item.decorations = decorations;
    });
  });
}

/**
 * Finds the appropriate icon for a file path based on its extension using `nvim-web-devicons`.
 *
 * @param denops - The Denops instance used for interacting with Neovim.
 * @param path - The file path to look for an icon.
 * @returns {Promise<string>} The icon associated with the file path's extension.
 */
function findIcon(denops: Denops, path: string): Promise<string> {
  // Extract the file extension from the path (removing the leading dot).
  const ext = extname(path).substring(1);

  // Use Lua to call `nvim-web-devicons` and retrieve the icon.
  return denops.call(
    "luaeval",
    `require'nvim-web-devicons'.get_icon("${path}", "${ext}", { default = true })`,
  ) as Promise<string>;
}
