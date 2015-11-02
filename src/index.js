import { plugin } from 'postcss';
import forEach from 'lodash.foreach';
import replaceSymbols from 'icss-replace-symbols';
const importRegexp = /^:import\((.+)\)$/;
const exportRegexp = /^:export$/;

/**
 * @param  {object}  promise
 * @return {boolean}
 */
function isPromise(promise) {
  return typeof promise === 'object' && typeof promise.then === 'function';
}

/**
 * @param  {object} css
 * @param  {object} translations
 */
function proceed(css, translations) {
  const exportTokens = {};

  replaceSymbols(css, translations);

  css.walkRules(exportRegexp, rule => {
    rule.walkDecls(decl => {
      forEach(translations, (value, key) => decl.value = decl.value.replace(key, value));
      exportTokens[decl.prop] = decl.value;
    });

    rule.remove();
  });

  css.tokens = exportTokens;
}

/**
 * @param  {function} options.fetch
 * @return {function}
 */
export default plugin('parser', function parser({ fetch } = {}) {
  return css => {
    // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
    const file = css.source.input.file;

    const translations = {};
    const promises = [];

    css.walkRules(importRegexp, rule => {
      const result = fetch(RegExp.$1, file);

      if (isPromise(result)) {
        result.then(exports => {
          rule.walkDecls(decl => translations[decl.prop] = exports[decl.value]);
          rule.remove();
        });

        promises.push(result);
      } else {
        rule.walkDecls(decl => translations[decl.prop] = result[decl.value]);
        rule.remove();
      }
    });

    if (promises.length === 0) {
      return void proceed(css, translations);
    }

    return Promise.all(promises)
      .then(() => proceed(css, translations));
  };
});
