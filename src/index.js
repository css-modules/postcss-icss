/* eslint-env node */
import fs from "fs";
import path from "path";
import postcss from "postcss";
import { replaceSymbols, replaceValueSymbols, extractICSS } from "icss-utils";

const readFile = filepath =>
  new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf-8", (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });

const getTokens = result =>
  result.messages.find(d => d.type === "icss").exportTokens;

const defaultFetch = (importee, importerDir, processor) => {
  const ext = path.extname(importee);
  if (ext !== ".css") {
    return Promise.resolve({
      default: importee
    });
  }
  const from = path.resolve(importerDir, importee);
  return readFile(from)
    .then(content => processor.process(content, { from }))
    .then(result =>
      Object.assign({}, getTokens(result), { default: result.css })
    );
};

const importParamsPattern = /^(\w+)(.+)?/;

const importToken = (params, tokens) => {
  const matches = importParamsPattern.exec(params);
  if (matches) {
    const content = tokens[matches[1]];
    const media = matches[2];
    return media ? `@media ${media.trim()} {\n${content}\n}` : content;
  }
  return "";
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
        if (token === "import") {
          acc[token] = importToken(importTokens[token], exportTokens);
        } else {
          acc[token] = exportTokens[importTokens[token]];
        }
        return acc;
      }, {});
    });
  });

  return Promise.all(promises).then(results => {
    const imports = results
      .map(result => result.import)
      .filter(content => Boolean(content))
      .join("\n");
    const replacements = Object.assign({}, ...results);
    replaceSymbols(css, replacements);
    css.prepend(imports);

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
