/**
 * comic-book-binder.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2019 Google Inc.
 */

import { UnarchiveEventType, getUnarchiver } from './bitjs/archive/archive.js';
import { BookBinder } from './book-binder.js';
import { BookBindingCompleteEvent, BookPageExtractedEvent, BookProgressEvent } from './book-events.js';
import { createPageFromFileAsync, guessMimeType } from './page.js';
import { Params } from './helpers.js';

const STREAM_OPTIMIZED_NS = 'http://www.codedread.com/sop';

/**
 * The default BookBinder used in kthoom.  It takes each extracted file from the Unarchiver and
 * turns that directly into a Page for the comic book.
 */
export class ComicBookBinder extends BookBinder {
  constructor(filenameOrUri, ab, totalExpectedSize) {
    super(filenameOrUri, ab, totalExpectedSize);

    // As each file becomes available from the Unarchiver, we kick off an async operation
    // to construct a Page object.  After all pages are retrieved, we sort and then extract them.
    // (Or, if the book is stream-optimized, we extract them in order immediately)
    /** @private {Promise<Page>} */
    this.pagePromises_ = [];

    /** @private {boolean} */
    this.optimizedForStreaming_ = false;
  }

  /** @override */
  beforeStart_() {
    let prevExtractPromise = Promise.resolve(true);
    this.unarchiver_.addEventListener(UnarchiveEventType.EXTRACT, evt => {
      // Convert each unarchived file into a Page.
      // TODO: Error if not present?
      if (evt.unarchivedFile) {
        const filename = evt.unarchivedFile.filename;
        const mimeType = guessMimeType(filename) || '';
        if (mimeType.startsWith('image/')) {
          const pagePromise = createPageFromFileAsync(evt.unarchivedFile);
          // TODO: Error if we have more pages than totalPages_.
          this.pagePromises_.push(pagePromise);

          if (this.optimizedForStreaming_) {
            const numPages = this.pagePromises_.length;
            prevExtractPromise = prevExtractPromise.then(() => {
              return pagePromise.then(page => {
                this.notify(new BookPageExtractedEvent(this, page, numPages));
              });
            });
          }
        } else if (filename.toLowerCase() === 'comicinfo.xml' && this.pagePromises_.length === 0) {
          // If the book's metadata says the comic book is optimizedForStreaming, then we will emit
          // page extracted events as they are extracted instead of upon all files being extracted
          // to display the first page as fast as possible.
          const metadataXml = new TextDecoder().decode(evt.unarchivedFile.fileData);
          if (metadataXml) {
            const dom = new DOMParser().parseFromString(metadataXml, 'text/xml');
            const infoEls = dom.getElementsByTagNameNS(STREAM_OPTIMIZED_NS, 'ArchiveFileInfo');
            if (infoEls && infoEls.length > 0) {
              const infoEl = infoEls.item(0);
              if (infoEl.getAttribute('optimizedForStreaming') === 'true') {
                this.optimizedForStreaming_ = true;
              }
            }
          }
        }

        // Emit a Progress event for each unarchived file.
        this.notify(new BookProgressEvent(this, this.pagePromises_.length));
      }
    });
    this.unarchiver_.addEventListener(UnarchiveEventType.FINISH, evt => {
      this.setUnarchiveComplete();

      if (evt.metadata.comment && Params.metadata) {
        alert(evt.metadata.comment);
      }
      let pages = [];
      let foundError = false;
      let pagePromiseChain = Promise.resolve(true);
      for (let pageNum = 0; pageNum < this.pagePromises_.length; ++pageNum) {
        pagePromiseChain = pagePromiseChain.then(() => {
          return this.pagePromises_[pageNum]
            .then(page => pages.push(page))
            .catch(e => {
              console.error(`Error creating page: ${e}`);
              foundError = true;
            })
            .finally(() => true);
        });
      }

      pagePromiseChain.then(() => {
        console.log(`  number of pages = ${pages.length}`);

        if (foundError) {
          // TODO: Better error handling.
          alert('Some pages had errors. See the console for more info.')
        }

        // Sort the book's pages, if this book was not optimized for streaming.
        if (!this.optimizedForStreaming_) {
          pages = pages.slice(0).sort((a, b) => {
            // One of the worst things about the Comic Book Archive format is that it is de facto.
            // Most definitions say the sort order is supposed to be lexically sorted filenames.
            // However, some comic books, and therefore some reader apps, do not follow this rule.
            // We will carefully add special cases here as we find them in the wild.  We may not be
            // able to handle every case; some books are just broken.

            // =====================================================================================
            // Special Case 1:  Files are incorrectly named foo8.jpg, foo9.jpg, foo10.jpg.
            // This causes foo10.jpg to sort before foo8.jpg when listing alphabetically.

            // Strip off file extension.
            const aName = a.getPageName().replace(/\.[^/.]+$/, '');
            const bName = b.getPageName().replace(/\.[^/.]+$/, '');

            // If we found numbers at the end of the filenames ...
            const aMatch = aName.match(/(\d+)$/g);
            const bMatch = bName.match(/(\d+)$/g);
            if (aMatch && aMatch.length === 1 && bMatch && bMatch.length === 1) {
              // ... and the prefixes case-insensitive match ...
              const aPrefix = aName.substring(0, aName.length - aMatch[0].length);
              const bPrefix = aName.substring(0, bName.length - bMatch[0].length);
              if (aPrefix.toLowerCase() === bPrefix.toLowerCase()) {
                // ... then numerically evaluate the numbers for sorting purposes.
                return parseInt(aMatch[0], 10) > parseInt(bMatch[0], 10) ? 1 : -1;
              }
            }

            // Special Case 2?  I've seen this one a couple times:
            // RobinHood12-02.jpg, RobinHood12-03.jpg, robinhood12-01.jpg, robinhood12-04.jpg.
            // If a common prefix is used, and we find a file that has the same common prefix
            // but not the right case, then case-insensitive lexical sort?

            // =====================================================================================

            // Default is case-sensitive lexical/alphabetical sort.
            return a.getPageName() > b.getPageName() ? 1 : -1;
          });

          // Emit an extract event for each page in its proper order.
          for (let i = 0; i < pages.length; ++i) {
            this.notify(new BookPageExtractedEvent(this, pages[i], i + 1));
          }
        }

        // Emit a complete event.
        this.notify(new BookBindingCompleteEvent(this));
      });

      this.stop();
    });
  }

  /** @override */
  getLayoutPercentage() { return this.getUnarchivingPercentage() * this.getUnarchivingPercentage(); }
}
