/* eslint-env jest */
import postcss from "postcss";
import stripIndent from "strip-indent";
import plugin from "../src";

const strip = input => stripIndent(input).replace(/^\n/, "");
const compile = input => postcss([plugin]).process(strip(input));
const runMsgs = input => compile(input).then(result => result.messages);
const runCSS = input => compile(input).then(result => result.css);

test("exports tokens", () => {
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

test("imports and exports tokens", () => {
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

test("imports and replaces identifiers", () => {
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
