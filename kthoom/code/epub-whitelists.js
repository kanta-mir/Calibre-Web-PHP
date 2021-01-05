/**
 * epub-whitelists.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2019 Google Inc.
 */

export const ELEMENT_WHITELIST = [
  'a', 'body', 'br', 'div',
  'head', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr',
  'img', 'link', 'p', 'span',
  'style', 'title',
];

export const ATTRIBUTE_WHITELIST = {
  'a': ['class', 'id', 'title'],
  'body': ['class', 'id'],
  'br': ['class', 'id'],
  'div': ['class', 'id'],
  'h1': ['class', 'id'],
  'h2': ['class', 'id'],
  'h3': ['class', 'id'],
  'h4': ['class', 'id'],
  'h5': ['class', 'id'],
  'h6': ['class', 'id'],
  'hr': ['class', 'id'],
  'img': ['alt', 'class', 'id', 'src'],
  'link': ['href', 'rel', 'type'],
  'p': ['class', 'id'],
  'span': ['class', 'id'],
};

export const BLOB_URL_ATTRIBUTES = {
  // TODO: Properly strip off anchor hash of the URL before whitelisting hyperlink href.
//  'a': ['href'],
  'img': ['src'],
  'link': ['href'],
}
