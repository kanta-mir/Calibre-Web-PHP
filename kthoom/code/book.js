/**
 * book.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */
import { createBookBinderAsync } from './book-binder.js';
import { BookEventType, BookLoadingStartedEvent, BookProgressEvent } from './book-events.js';
import { BookPumpEventType } from './book-pump.js';
import { EventEmitter } from './event-emitter.js';

/**
 * A Book has a name, a set of pages, and a BookBinder which handles the process of loading,
 * unarchiving, and page setting.
 */
export class Book extends EventEmitter {
  /**
   * @param {string} name
   * @param {string} uri
   */
  constructor(name, uri = undefined) {
    super();

    /**
     * The name of the book (shown in the Reading Stack).
     * @type {String}
     */
    this.name_ = name;

    /**
     * The optional URI of the book (not set for a File).
     * @type {String}
     */
    this.uri_ = uri;

    /**
     * The total known number of pages.
     * @private {number}
     */
    this.totalPages_ = 0;

    /** @private {BookBinder} */
    this.bookBinder_ = null;

    /** @private {Array<Page>} */
    this.pages_ = [];

    /** @private {boolean} */
    this.needsLoading_ = true;
  }

  getName() { return this.name_; }
  getLoadingPercentage() {
    if (!this.bookBinder_) return 0;
    return this.bookBinder_.getLoadingPercentage();
  }
  getUnarchivingPercentage() {
    if (!this.bookBinder_) return 0;
    return this.bookBinder_.getUnarchivingPercentage();
  }
  getLayoutPercentage() {
    if (!this.bookBinder_) return 0;
    return this.bookBinder_.getLayoutPercentage();
  }
  getNumberOfPages() { return this.totalPages_; }
  getNumberOfPagesReady() { return this.pages_.length; }

  /**
   * @param {number} i A number from 0 to (num_pages - 1).
   * @return {Page}
   */
  getPage(i) {
    // TODO: This is a bug in the unarchivers.  The only time totalPages_ is set is
    // upon getting a UnarchiveEventType.PROGRESS which has the total number of files.
    // In some books, we get an EXTRACT event before we get the first PROGRESS event.
    const numPages = this.totalPages_ || this.pages_.length;
    if (i < 0 || i >= numPages) {
      return null;
    }
    return this.pages_[i];
  }

  /** @return {string} */
  getUri() {
    return this.uri_;
  }

  /**
   * Starts an XHR and progressively loads in the book.
   * TODO: Get rid of this and just use loadFromFetch() everywhere.
   * @param {Number} expectedSize If -1, the total field from the XHR Progress event is used.
   * @param {Object<string, string>} headerMap A map of request header keys and values.
   * @return {Promise<Book>} A Promise that returns this book when all bytes have been fed to it.
   */
  loadFromXhr(expectedSize = -1, headerMap = {}) {
    if (!this.needsLoading_) {
      throw 'Cannot try to load via XHR when the Book is already loading or loaded';
    }
    if (!this.uri_) {
      throw 'URI for book was not set from loadFromXhr()';
    }

    this.needsLoading_ = false;
    this.notify(new BookLoadingStartedEvent(this));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.uri_, true);
      for (const headerKey in headerMap) {
        xhr.setRequestHeader(headerKey, headerMap[headerKey]);
      }

      xhr.responseType = 'arraybuffer';
      xhr.onprogress = (evt) => {
        if (this.bookBinder_) {
          if (expectedSize == -1 && evt.total) {
            expectedSize = evt.total;
            this.bookBinder_.setNewExpectedSize(evt.loaded, evt.total);
          }
          this.notify(new BookProgressEvent(this, this.pages_.length));
        }
      };
      xhr.onload = (evt) => {
        const ab = evt.target.response;
        this.startBookBinding_(this.uri_, ab, expectedSize);
        resolve(this);
      };
      xhr.onerror = (err) => {
        reject(err);
      };
      xhr.send(null);
    });
  }

  /**
   * Starts a fetch and progressively loads in the book.
   * @param {Number} expectedSize The total number of bytes expected.
   * @param {Object<string, string>} init A map of request header keys and values.
   * @return {Promise<Book>} A Promise that returns this book when all bytes have been fed to it.
   */
  loadFromFetch(expectedSize, init) {
    if (!this.needsLoading_) {
      throw 'Cannot try to load via XHR when the Book is already loading or loaded';
    }
    if (!this.uri_) {
      throw 'URI for book was not set in loadFromFetch()';
    }

    this.needsLoading_ = false;
    this.notify(new BookLoadingStartedEvent(this));

    return fetch(this.uri_, init).then(response => {
      const reader = response.body.getReader();
      const readAndProcessNextChunk = () => {
        reader.read().then(({ done, value }) => {
          if (!done) {
            // value is a chunk of the file as a Uint8Array.
            if (!this.bookBinder_) {
              return this.startBookBinding_(this.name_, value.buffer, expectedSize).then(() => {
                return readAndProcessNextChunk();
              })
            }
            this.bookBinder_.appendBytes(value.buffer);
            return readAndProcessNextChunk();
          } else {
            return this;
          }
        });
      };
      return readAndProcessNextChunk();
    }).catch(e => {
      console.error(`Error from fetch: ${e}`);
      throw e;
    });
  }

  /**
   * @param {File} file
   * @return {Promise<Book>} A Promise that returns this book when all bytes have been fed to it.
   */
  loadFromFile(file) {
    if (!this.needsLoading_) {
      throw 'Cannot try to load via File when the Book is already loading or loaded';
    }
    if (this.uri_) {
      throw 'URI for book was set in loadFromFile()';
    }

    this.needsLoading_ = false;
    this.notify(new BookLoadingStartedEvent(this));

    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const ab = fr.result;
        try {
          this.startBookBinding_(file.name, ab, ab.byteLength);
        } catch (err) {
          const errMessage = err + ': ' + file.name;
          console.error(errMessage);
          reject(errMessage);
        }
        resolve(this);
      };
      fr.readAsArrayBuffer(file);
    });
  }

  /**
   * @param {string} fileName
   * @param {ArrayBuffer} ab
   * @return {Promise<Book>} A Promise that returns this book when all bytes have been fed to it.
   */
  loadFromArrayBuffer(fileName, ab) {
    if (!this.needsLoading_) {
      throw 'Cannot try to load via File when the Book is already loading or loaded';
    }
    if (this.uri_) {
      throw 'URI for book was set in loadFromArrayBuffer()';
    }

    this.needsLoading_ = false;
    this.notify(new BookLoadingStartedEvent(this));

    this.startBookBinding_(fileName, ab, ab.byteLength);
    return Promise.resolve(this);
  }

  /**
   * @param {string} bookUri
   * @param {BookPump} bookPump
   */
  loadFromBookPump(bookUri, bookPump) {
    if (!this.needsLoading_) {
      throw 'Cannot try to load via BookPump when the Book is already loading or loaded';
    }
    if (this.uri_) {
      throw 'URI for book was set in loadFromBookPump()';
    }

    this.needsLoading_ = false;
    let bookBinderPromise = null;
    return new Promise((resolve, reject) => {
      bookPump.subscribeToAllEvents(this, evt => {
        // If we get any error, reject the promise to create a book.
        if (evt.type === BookPumpEventType.BOOKPUMP_ERROR) {
          reject(evt.err);
        }

        // If we do not have a book binder yet, create it and start the process.
        if (!bookBinderPromise) {
          try {
            bookBinderPromise = this.startBookBinding_(bookUri, evt.ab, evt.totalExpectedSize);
          } catch (err) {
            const errMessage = `${err}: ${file.name}`;
            console.error(errMessage);
            reject(errMessage);
          }
        } else {
          // Else, we wait on the book binder being finished before processing the event.
          bookBinderPromise.then(() => {
            switch (evt.type) {
              case BookPumpEventType.BOOKPUMP_DATA_RECEIVED:
                this.bookBinder_.appendBytes(evt.ab);
                break;
              case BookPumpEventType.BOOKPUMP_END:
                resolve(this);
                break;
            }
          });
        }
      });
    });
  }

  /**
   * @returns {boolean} True if this book has not started loading, false otherwise.
   */
  needsLoading() {
    return this.needsLoading_;
  }

  /**
   * Creates and sets the BookBinder, subscribes to its events, and starts the book binding process.
   * @param {string} fileNameOrUri
   * @param {ArrayBuffer} ab
   * @param {number} totalExpectedSize
   * @return {Promise<BookBinder>}
   * @private
   */
  startBookBinding_(fileNameOrUri, ab, totalExpectedSize) {
    return createBookBinderAsync(fileNameOrUri, ab, totalExpectedSize).then(bookBinder => {
      this.bookBinder_ = bookBinder;
      // Extracts some state from the BookBinder events, re-sources the events, and sends them out to
      // the subscribers to this Book.
      this.bookBinder_.subscribeToAllEvents(this, evt => {
        switch (evt.type) {
          case BookEventType.PAGE_EXTRACTED:
            this.pages_.push(evt.page);
            break;
          case BookEventType.PROGRESS:
            if (evt.totalPages) {
              this.totalPages_ = evt.totalPages;
            }
            break;
        }

        evt.source = this;
        this.notify(evt);
      });

      this.bookBinder_.start();
    });
  }
}
