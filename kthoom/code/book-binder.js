/**
 * book-binder.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2019 Google Inc.
 */

import { UnarchiveEventType, getUnarchiver } from './bitjs/archive/archive.js';
import { BookProgressEvent } from './book-events.js';
import { config } from './config.js';
import { EventEmitter } from './event-emitter.js';
import { Params } from './helpers.js';

export const UnarchiveState = {
  UNARCHIVING_NOT_YET_STARTED: 0,
  UNARCHIVING: 1,
  UNARCHIVED: 2,
  UNARCHIVING_ERROR: 3,
};

/**
 * The abstract class for a BookBinder.  Never instantiate one of these yourself.
 * Use createBookBinderAsync() to create an instance of an implementing subclass.
 */
export class BookBinder extends EventEmitter {
  /**
   * @param {string} fileNameOrUri
   * @param {ArrayBuffer} ab The ArrayBuffer to initialize the BookBinder.
   * @param {number} totalExpectedSize The total number of bytes expected.
   */
  constructor(fileNameOrUri, ab, totalExpectedSize) {
    super();

    // totalExpectedSize can be -1 in the case of an XHR where we do not know the size yet.
    if (!totalExpectedSize || totalExpectedSize < -2) {
      throw 'Must initialize a BookBinder with a valid totalExpectedSize';
    }
    if (!ab || !(ab instanceof ArrayBuffer)) {
      throw 'Must initialize a BookBinder with an ArrayBuffer';
    }
    if (totalExpectedSize > 0 && ab.byteLength > totalExpectedSize) {
      throw 'Must initialize a BookBinder with a ab.byteLength <= totalExpectedSize';
    }

    /** @protected {string} */
    this.name_ = fileNameOrUri;

    /** @protected {number} */
    this.startTime_ = undefined;

    /** @private {number} */
    this.bytesLoaded_ = ab.byteLength;

    /** @private {number} */
    this.totalExpectedSize_ = totalExpectedSize > 0 ? totalExpectedSize : this.bytesLoaded_;

    /** 
     * A number between 0 and 1 indicating the progress of the Unarchiver.
     * @protected {number}
     */
    this.unarchivingPercentage_ = 0;

    /** @private {UnarchiveState} */
    this.unarchiveState_ = UnarchiveState.UNARCHIVING_NOT_YET_STARTED;

    const unarchiverOptions = {
      'pathToBitJS': config.get('PATH_TO_BITJS'),
      'debug': (Params.debug === 'true'),
    };

    /** @private {Unarchiver} */
    this.unarchiver_ = getUnarchiver(ab, unarchiverOptions);
    if (!this.unarchiver_) {
      throw 'Could not determine the unarchiver to use';
    }

    /**
     * A number between 0 and 1 indicating the progress of the page layout process.
     * @protected {number}
     */
    this.layoutPercentage_ = 0;
  }

  /**
   * Appends more bytes to the binder for processing.
   * @param {ArrayBuffer} ab
   */
  appendBytes(ab) {
    if (!ab) {
      throw 'Must pass a valid ArrayBuffer to appendBytes()';
    }
    if (!this.unarchiver_) {
      throw 'Called appendBytes() without a valid Unarchiver set';
    }
    if (this.bytesLoaded_ + ab.byteLength > this.totalExpectedSize_) {
      throw 'Tried to add bytes larger than totalExpectedSize in appendBytes()';
    }

    this.unarchiver_.update(ab);
    this.bytesLoaded_ += ab.byteLength;
  }

  /**
   * Oveerride this in an implementing subclass to do things before the Unarchiver starts
   * (like subscribe to Unarchiver events).
   * @protected
   */
  beforeStart_() {
    throw 'Cannot call beforeStart_() in abstract BookBinder';
  }

  getLoadingPercentage() { return this.bytesLoaded_ / this.totalExpectedSize_; }
  getUnarchivingPercentage() { return this.unarchivingPercentage_; }
  getLayoutPercentage() { return this.layoutPercentage_; }

  setNewExpectedSize(bytesDownloaded, newExpectedSize) {
    this.bytesLoaded_ = bytesDownloaded;
    this.totalExpectedSize_ = newExpectedSize;
  }

  /** @protected */
  setUnarchiveComplete() {
    this.unarchiveState_ = UnarchiveState.UNARCHIVED;
    this.unarchivingPercentage_ = 1.0;
    const diff = ((new Date).getTime() - this.startTime_) / 1000;
    console.log(`Book = '${this.name_}'`);
    console.log(`  using ${this.unarchiver_.getScriptFileName()}`);
    console.log(`  unarchiving done in ${diff}s`);
  }

  /**
   * Starts the binding process.
   */
  start() {
    if (!this.unarchiver_) {
      throw 'Called start() without a valid Unarchiver';
    }

    this.startTime_ = (new Date).getTime();

    this.unarchiveState_ = UnarchiveState.UNARCHIVING;
    this.unarchiver_.addEventListener(UnarchiveEventType.PROGRESS, evt => {
      this.unarchivingPercentage_ = evt.totalCompressedBytesRead / this.totalExpectedSize_;
      // Total # pages is not always equal to the total # of files, so we do not report that here.
      this.notify(new BookProgressEvent(this));
    });

    this.unarchiver_.addEventListener(UnarchiveEventType.INFO,
      evt => console.log(evt.msg));

    this.beforeStart_();
    this.unarchiver_.start();
  }

  /**
   * Must be called from the implementing subclass of BookBinder.
   */
  stop() {
    // Stop the Unarchiver (which will kill the worker) and then delete the unarchiver
    // which should free up some memory, including the unarchived array buffer.
    this.unarchiver_.stop();
    this.unarchiver_ = null;
  }
}

/**
 * Creates a book binder based on the type of book.  Determines the type of unarchiver to use by
 * looking at the first bytes.  Guesses the type of book by looking at the file/uri name.
 * @param {string} fileNameOrUri The filename or URI.  Must end in a file extension that can be
 *     used to guess what type of book this is.
 * @param {ArrayBuffer} ab The initial ArrayBuffer to start the unarchiving process.
 * @param {number} totalExpectedSize Thee total expected size of the archived book in bytes.
 * @returns {Promise<BookBinder>} A Promise that will resolve with a BookBinder.
 */
export function createBookBinderAsync(fileNameOrUri, ab, totalExpectedSize) {
  if (fileNameOrUri.toLowerCase().endsWith('.epub')) {
    return import('./epub-book-binder.js').then(module => {
      return new module.EPUBBookBinder(fileNameOrUri, ab, totalExpectedSize);
    });
  }
  return import('./comic-book-binder.js').then(module => {
    return new module.ComicBookBinder(fileNameOrUri, ab, totalExpectedSize);
  });
}
