/**
 * reading-stack.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */
import { getElem } from './helpers.js';
import { Book } from './book.js';
import { BookEventType } from './book-events.js';

// TODO: Have the ReadingStack display progress bars in the pane as books load and unarchive.

/**
 * The ReadingStack is responsible for displaying information about the current
 * set of books the user has in their stack as well as the book they are
 * currently reading.  It also provides methods to add, remove and get a book.
 */
export class ReadingStack {
  constructor() {
    /** @typeof {Array<Book>} */
    this.books_ = [];
    this.currentBookNum_ = -1;
    this.currentBookChangedCallbacks_ = [];
  }

  getNumberOfBooks() { return this.books_.length; }

  getCurrentBook() {
    return this.currentBookNum_ != -1 ? this.books_[this.currentBookNum_] : null;
  }

  /** @param {number} i */
  getBook(i) {
    if (i < 0 || i >= this.books_.length) return null;
    return this.books_[i];
  }

  /**
   * Always changes to the newly added book.
   * @param {Book} book
   */
  addBook(book) {
    this.books_.push(book);
    book.subscribe(this, () => this.renderStack_(), BookEventType.LOADING_STARTED);
    this.changeToBook_(this.books_.length - 1);
    this.renderStack_();
  }

  /**
   * @param {Array<Book>} books
   * @param {boolean} switchToFirst Whether to switch to the first book in this new set.
   * @param {Number} bookNumber The book within the books array to load.
   */
  addBooks(books, bookNumber = 0) {
    if (books.length > 0) {
      const newCurrentBook = this.books_.length;
      for (const book of books) {
        this.books_.push(book);
        book.subscribe(this, () => this.renderStack_(), BookEventType.LOADING_STARTED);
      }
      if (bookNumber < 0 || bookNumber >= this.books_.length) {
        bookNumber = 0;
      }
      this.changeToBook_(newCurrentBook + bookNumber);
      this.renderStack_();
    }
  }

  /**
   * Removes all books, resets the internal state, and re-renders.
   * Does not remove the current book change callback.
   */
  removeAll() {
    for (const book of this.books_) {
      book.unsubscribe(this, BookEventType.LOADING_STARTED);
    }
    this.books_ = [];
    this.currentBookNum_ = -1;
    this.renderStack_();
  }

  /** @param {number} i */
  removeBook(i) {
    // Cannot remove the very last book.
    if (this.books_.length > 1 && i < this.books_.length) {
      this.books_[i].unsubscribe(this, BookEventType.LOADING_STARTED);
      this.books_.splice(i, 1);

      // If we are removing the book we are on, pick a new current book.
      if (i === this.currentBookNum_) {
        // Default to going to the next book unless we were on the last book
        // (in which case you go to the previous book).
        if (i >= this.books_.length) {
          i = this.books_.length - 1;
        }

        this.changeToBook_(i);
      } else {
        // Might have to update the current book number if the book removed
        // was above the current one.
        if (i < this.currentBookNum_) {
          this.currentBookNum_--;
        }
        this.renderStack_();
      }
    }
  }

  whenCurrentBookChanged(callback) {
    this.currentBookChangedCallbacks_.push(callback);
  }

  /** @return {boolean} */
  isOpen() {
    return getElem('readingStack').classList.contains('opened');
  }

  changeToPrevBook() {
    if (this.currentBookNum_ > 0) {
      this.changeToBook_(this.currentBookNum_ - 1);
    }
  }

  changeToNextBook() {
    if (this.currentBookNum_ < this.books_.length - 1) {
      this.changeToBook_(this.currentBookNum_ + 1);
    }
  }

  /**
   * @param {number} i
   * @private
   */
  changeToBook_(i) {
    if (i >= 0 && i < this.books_.length) {
      this.currentBookNum_ = i;
      const book = this.books_[i];
      // The only case where the user chooses a book that has not been loaded yet is from a
      // reading list, which means we can load it via XHR.
      if (book.needsLoading()) {
        book.loadFromXhr();
      }
      for (const callback of this.currentBookChangedCallbacks_) {
        callback(book);
      }
      // Re-render to update selected highlight.
      this.renderStack_();

      if (this.isOpen()) {
        this.toggleReadingStackOpen();
      }
    }
  }

  toggleReadingStackOpen() {
    getElem('readingStack').classList.toggle('opened');

    if (this.isOpen()) {
      const bookElems = getElem('readingStack').querySelectorAll('.readingStackBook');
      if (bookElems.length > 0) {
        bookElems.item(0).focus();
      }
    }
  }

  // TODO: Do this better so that each change of state doesn't require a complete re-render?
  /** @private */
  renderStack_() {
    const libDiv = getElem('readingStackContents');
    // Clear out the current reading stack HTML divs.
    libDiv.innerHTML = '';
    if (this.books_.length > 0) {
      for (let i = 0; i < this.books_.length; ++i) {
        const book = this.books_[i];
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('readingStackBook');
        if (!book.needsLoading()) {
          bookDiv.classList.add('loaded');
        }
        if (this.currentBookNum_ == i) {
          bookDiv.classList.add('current');
        }
        bookDiv.dataset.index = i;
        bookDiv.innerHTML =
          '<div class="readingStackBookInner" title="' + book.getName() + '">' +
          book.getName() +
          '</div>' +
          '<div class="readingStackBookCloseButton" title="Remove book from stack">x</div>';

        // Handle drag-drop of books.
        bookDiv.setAttribute('draggable', 'true');
        bookDiv.addEventListener('dragstart', evt => {
          evt.stopPropagation();
          const thisBookDiv = evt.target;
          thisBookDiv.classList.add('dragging');
          evt.dataTransfer.effectAllowed = 'move';
          evt.dataTransfer.setData('text/plain', thisBookDiv.dataset.index);
        });
        bookDiv.addEventListener('dragend', evt => {
          evt.stopPropagation();
          evt.target.classList.remove('dragging');
        });
        bookDiv.addEventListener('dragenter', evt => {
          evt.stopPropagation();
          evt.target.classList.add('dropTarget');
        });
        bookDiv.addEventListener('dragleave', evt => {
          evt.stopPropagation();
          evt.target.classList.remove('dropTarget');
        });
        bookDiv.addEventListener('dragover', evt => {
          evt.stopPropagation();
          evt.preventDefault();
        });
        bookDiv.addEventListener('drop', evt => {
          evt.stopPropagation();

          const dropBookDiv = evt.target;
          const fromIndex = parseInt(evt.dataTransfer.getData('text/plain'), 10);
          const toIndex = parseInt(dropBookDiv.dataset.index, 10);

          if (fromIndex !== toIndex) {
            const draggedBook = this.books_[fromIndex];
            const currentBook = this.books_[this.currentBookNum_];
            this.books_.splice(fromIndex, 1);
            this.books_.splice(toIndex, 0, draggedBook);
            this.currentBookNum_ = this.books_.indexOf(currentBook);
            this.renderStack_();
          }
        });

        bookDiv.addEventListener('click', (evt) => {
          const i = parseInt(evt.currentTarget.dataset.index, 10);
          if (evt.target.classList.contains('readingStackBookCloseButton')) {
            this.removeBook(i);
          } else {
            this.changeToBook_(i);
          }
        });
        libDiv.appendChild(bookDiv);
      }
    } else {
      libDiv.innerHTML = 'No books loaded';
      // TODO: Display a label indicating no books loaded again.
    }
  }
}
