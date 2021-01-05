/*
 * main.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2020 Google Inc.
 */

import { config } from './config.js';
import { KthoomApp } from './kthoom.js';

config
  .set('PATH_TO_BITJS', 'code/bitjs/')
  .lock();

const theApp = new KthoomApp();
if (!window.kthoom.getApp) {
  window.kthoom.getApp = () => theApp;
}
