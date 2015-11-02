import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import postcss from 'postcss';
import Parser from '../../src';
const instance = postcss([new Parser({fetch})]);

export default function fetch(_to, from) {
  const to = _to.replace(/^["']|["']$/g, '');
  const filename = /\w/i.test(to[0])
    ? require.resolve(to)
    : resolve(dirname(from), to);

  const css = readFileSync(filename, 'utf8');
  return instance.process(css, {from: filename}).root.tokens;
}
