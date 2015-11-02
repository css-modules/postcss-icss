import { equal } from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import syncLoader from './helper/sync-loader';

let fixture;
let expected;
let filename;

describe('postcss-modules-parser', _ => {
  beforeEach(() => {
    fixture = 'test/fixture';
    filename = resolve(fixture, 'source.css');
    expected = JSON.parse(readFileSync(resolve(fixture, 'expected.json'), 'utf8'));
  });

  it('synchronous', () => {
    const result = syncLoader(filename, filename);
    equal(JSON.stringify(result), JSON.stringify(expected));
  });
});
