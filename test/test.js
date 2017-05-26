/* eslint-env jest */
import { readFileSync } from "fs";
import { resolve } from "path";
import asyncLoader from "./helper/async-loader";
import syncLoader from "./helper/sync-loader";

let fixture;
let expected;
let filename;

describe("single", () => {
  beforeEach(() => {
    fixture = "test/fixture/single";
    filename = resolve(fixture, "source.css");
    expected = JSON.parse(
      readFileSync(resolve(fixture, "expected.json"), "utf8")
    );
  });

  it("asynchronous", () => {
    return asyncLoader(filename, filename).then(result => {
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });
  });

  it("synchronous", () => {
    const result = syncLoader(filename, filename);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
  });
});

describe("multiple", () => {
  beforeEach(() => {
    fixture = "test/fixture/multiple";
    filename = resolve(fixture, "source.css");
    expected = JSON.parse(
      readFileSync(resolve(fixture, "expected.json"), "utf8")
    );
  });

  it("asynchronous", () => {
    return asyncLoader(filename, filename).then(result => {
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });
  });

  it("synchronous", () => {
    const result = syncLoader(filename, filename);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
  });
});
