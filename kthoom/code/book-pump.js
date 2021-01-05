/**
 * book-pump.js
 * Licensed under the MIT License
 * Copyright(c) 2020 Google Inc.
 */

import { EventEmitter } from './event-emitter.js';

/** @type {Object<String, String>} */
export const BookPumpEventType = {
  BOOKPUMP_DATA_RECEIVED: 'BOOKPUMP_DATA_RECEIVED',
  BOOKPUMP_END: 'BOOKPUMP_END',
  BOOKPUMP_ERROR: 'BOOKPUMP_ERROR',
};

/**
 * This is a simple class that receives book data from an outside source and then emits Events
 * that a Book can subscribe to for creation/loading.
 */
export class BookPump extends EventEmitter {
  constructor() { super(); }

  /**
   * @param {ArrayBuffer} ab
   * @param {number} totalExpectedSize
   */
  onData(ab, totalExpectedSize) {
    this.notify({ type: BookPumpEventType.BOOKPUMP_DATA_RECEIVED, ab, totalExpectedSize });
  }

  onError(err) { this.notify({ type: BookPumpEventType.BOOKPUMP_ERROR, err }); }
  onEnd() { this.notify({ type: BookPumpEventType.BOOKPUMP_END }); }
}
