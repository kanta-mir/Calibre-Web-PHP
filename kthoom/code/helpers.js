/**
 * helpers.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */

export const Key = {
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  NUM_0: 48, NUM_1: 49, NUM_2: 50, NUM_3: 51, NUM_4: 52,
  NUM_5: 53, NUM_6: 54, NUM_7: 55, NUM_8: 56, NUM_9: 57,
  A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77,
  N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
  QUESTION_MARK: 191,
  LEFT_SQUARE_BRACKET: 219,
  RIGHT_SQUARE_BRACKET: 221,
};

export const getElem = function (id) {
  return document.body.querySelector('#' + id);
};

// Parse the URL parameters the first time this module is loaded.
export const Params = {};
const search = document.location.search;
if (search && search[0] === '?') {
  const args = search.substring(1).split('&');
  for (let arg of args) {
    const kv = arg.split('=');
    if (kv.length == 2) {
      const key = decodeURIComponent(kv[0]);
      const val = decodeURIComponent(kv[1]);
      Params[key] = val;
    }
  }
}

/**
 * Takes Params and updates the browser URL
 */
export function serializeParamsToBrowser() {
  let paramStr = '';
  let separator = '';
  for (const [key, value] of Object.entries(Params)) {
    paramStr += `${separator}${key}=${value}`;
    separator = '&';
  }
  let fullUri = document.location.pathname + '?' + paramStr;
  history.replaceState(null, '', fullUri);
}

/**
 * @param {boolaen} cond
 * @param {string=} str
 * @param {Object=} optContextObj
 */
export function assert(cond, str = 'Unknown error', optContextObj = undefined) {
  if (!cond) {
    if (Params.debug) {
      throw str;
    } else {
      console.error(str);
      if (optContextObj) {
        console.dir(optContextObj);
      }
    }
  }
}
