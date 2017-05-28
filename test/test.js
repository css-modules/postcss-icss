/* eslint-env jest */
import postcss from "postcss";
import stripIndent from "strip-indent";
import plugin from "../src";

const strip = input => stripIndent(input).replace(/^\n/, "");
const compile = input => postcss([plugin]).process(strip(input));
const runMsgs = input => compile(input).then(result => result.messages);
const runCSS = input => compile(input).then(result => result.css);

test("export tokens", () => {
  return expect(runMsgs(":export { a: b; _c: _d} .foo {}")).resolves.toEqual([
    {
      type: "icss",
      plugin: "postcss-icss",
      exportTokens: {
        a: "b",
        _c: "_d"
      }
    }
  ]);
});

test("import and export tokens", () => {
  return expect(
    runMsgs(`
      :import('./test/fixtures/exports.css') {
        local1: export1;
        local2: export2;
      }
      :export {
        a: local1;
        b: local2;
      }
    `)
  ).resolves.toEqual([
    {
      type: "icss",
      plugin: "postcss-icss",
      exportTokens: {
        a: "exported1",
        b: "exported2"
      }
    }
  ]);
});

test("import and replace identifiers", () => {
  return expect(
    runCSS(`
      :import('./test/fixtures/exports.css') {
        local1: export1;
        local2: export2;
      }

      .foo { background: local1 local2; }
    `)
  ).resolves.toEqual(
    strip(`
      .foo { background: exported1 exported2; }
    `)
  );
});

test("import non-css files as resource", () => {
  return expect(
    runCSS(`
      :import('path/to/resource.png') {
        local: default
      }
      .foo { background: url(local) }
    `)
  ).resolves.toEqual(
    strip(`
      .foo { background: url(path/to/resource.png) }
    `)
  );
});
