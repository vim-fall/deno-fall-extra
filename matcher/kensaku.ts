import type { Denops } from "@denops/std";
import { getByteLength } from "@vim-fall/std/util/stringutil";
import { defineMatcher, type Matcher } from "@vim-fall/std/matcher";

/**
 * A matcher that uses `vim-kensaku` for advanced Japanese search functionality.
 *
 * This matcher processes search queries using the `vim-kensaku` plugin, which
 * allows searching with Japanese romaji input and converts it into regex for matching.
 * The matcher generates decorations to highlight the matched portions in the item values.
 *
 * @template T The type of items being matched.
 * @returns A matcher function that performs the search and highlights matching portions.
 */
export function kensaku(): Matcher {
  return defineMatcher(async function* (denops, { query, items }, { signal }) {
    // Split the query into individual terms, transform them using `vim-kensaku`,
    // and create regex patterns from them.
    const terms = await Promise.all(
      query.split(/\s+/)
        .map((term) => term.trim()) // Trim whitespace from each term
        .filter((term) => !!term) // Remove empty terms
        .map((term) => transformQuery(denops, term, signal)), // Transform each term using `vim-kensaku`
    );

    const patterns = terms.map((term) => new RegExp(term)); // Convert each term to a regex pattern

    // Iterate over all items to match the transformed query against their values.
    for await (const item of items) {
      signal?.throwIfAborted(); // Check for abort signal to stop execution

      // Match the item value against all patterns and filter for successful matches
      const matches = patterns
        .map((pattern) => item.value.match(pattern))
        .filter((v) => !!v); // Keep only non-null matches

      // If the item does not match all patterns, skip it
      if (matches.length < patterns.length) continue;

      // Create decorations (highlighting) for the matched portions
      const decorations = matches.map((match) => {
        const length = getByteLength(match[0]); // Get the byte length of the match
        const index = match.index ?? 0; // Get the start index of the match
        const head = item.value.slice(0, index); // Slice the string up to the match start
        const column = 1 + getByteLength(head); // Adjust for byte-length encoding to get the column position
        return { column, length }; // Return the column and length for the decoration
      });

      // Yield the item with added decorations (matches highlighted)
      yield {
        ...item,
        decorations: [
          ...(item.decorations ?? []), // Retain existing decorations, if any
          ...decorations, // Add new decorations for the matched portions
        ],
      };
    }
  });
}

/**
 * Transforms the search query using `vim-kensaku`, which converts romaji input into
 * regex patterns for better search functionality.
 *
 * @param denops Denops instance for interacting with Vim.
 * @param query The original search query.
 * @param signal Abort signal to stop the execution.
 * @returns The transformed query after being processed by `vim-kensaku`.
 */
async function transformQuery(
  denops: Denops,
  query: string,
  signal?: AbortSignal,
): Promise<string> {
  signal?.throwIfAborted(); // Check for abort signal to stop execution
  // Use `vim-kensaku` to transform the query
  return await denops.dispatch("kensaku", "query", query) as string;
}
