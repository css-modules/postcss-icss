/* eslint-env node */
import fs from "fs";
import path from "path";
import postcss from "postcss";
import { replaceSymbols, replaceValueSymbols, extractICSS } from "icss-utils";

const defaultFetch = (importee, importerDir, processor) => {
  const from = path.resolve(importerDir, importee);
  const content = fs.readFileSync(from, "utf-8");
  return processor
    .process(content, { from })
    .then(result => result.messages.find(d => d.type === "icss").exportTokens);
};

module.exports = postcss.plugin("postcss-icss", (options = {}) => (
  css,
  result
) => {
  const importerDir = css.source.input.file
    ? path.dirname(css.source.input.file)
    : process.cwd();
  const fetch = options.fetch || defaultFetch;

  const { icssImports, icssExports } = extractICSS(css);

  const promises = Object.keys(icssImports).map(key => {
    const importee = key.replace(/^['"]|['"]$/g, "");
    return fetch(importee, importerDir, result.processor).then(exportTokens => {
      const importTokens = icssImports[key];
      return Object.keys(importTokens).reduce((acc, token) => {
        acc[token] = exportTokens[importTokens[token]];
        return acc;
      }, {});
    });
  });

  return Promise.all(promises).then(results => {
    const replacements = Object.assign({}, ...results);
    replaceSymbols(css, replacements);

    Object.keys(icssExports).forEach(key => {
      icssExports[key] = replaceValueSymbols(icssExports[key], replacements);
    });

    result.messages.push({
      type: "icss",
      plugin: "postcss-icss",
      exportTokens: icssExports
    });
  });
});
