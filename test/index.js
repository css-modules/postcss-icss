import { equal } from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import asyncLoader from './helper/async-loader';
import syncLoader from './helper/sync-loader';

let fixture;
let expected;
let filename;

describe('postcss-modules-parser', _ => {
  beforeEach(() => {
    fixture = 'test/fixture/simple';
    filename = resolve(fixture, 'source.css');
    expected = JSON.parse(readFileSync(resolve(fixture, 'expected.json'), 'utf8'));
  });

  it('asynchronous', done => {
    const result = asyncLoader(filename, filename)
      .then(result => {
        equal(JSON.stringify(result), JSON.stringify(expected));
        done();
      })
      .catch(done);
  });

  it('synchronous', () => {
    const result = syncLoader(filename, filename);
    equal(JSON.stringify(result), JSON.stringify(expected));
  });
});
