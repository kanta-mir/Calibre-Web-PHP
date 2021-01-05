/**
 * book-viewer.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */

import { Book } from './book.js';
import { BookEventType } from './book-events.js';
import { assert, getElem } from './helpers.js';

const BOOK_VIEWER_ELEM_ID = 'bookViewer';
const ID_PAGE_1 = 'page1';
const ID_PAGE_2 = 'page2';
const SWIPE_THRESHOLD = 50;

export const FitMode = {
  Width: 1,
  Height: 2,
  Best: 3,
}

const px = v => v + 'px';
const THROBBER_TIMER_MS = 60;
const MAX_THROBBING_TIME_MS = 10000;
const NUM_THROBBERS = 4;
const THROBBER_WIDTH = 4.2;
const MIN_THROBBER_X = 3;
const MAX_THROBBER_X = 86;

/**
 * The BookViewer is responsible for letting the user view the current book, navigate its pages,
 * update the orientation, page-mode and fit-mode of the viewer.
 */
export class BookViewer {
  constructor() {
    this.currentBook_ = null;

    /**
     * The current page number (zero-based).
     * @type {number}
     */
    this.currentPageNum_ = -1;

    this.rotateTimes_ = 0;
    /** @type {!FitMode} */
    this.fitMode_ = FitMode.Best;
    this.wheelTimer_ = null;
    this.wheelTurnedPageAt_ = 0;

    this.throbberTimerId_ = null;
    this.throbbers_ = new Array(NUM_THROBBERS);
    this.throbberDirections_ = new Array(NUM_THROBBERS);
    for (let thr = 0; thr < this.throbberDirections_.length; ++thr) {
      this.throbbers_[thr] = getElem(`throbber_${thr}`);
      this.throbberDirections_[thr] = (thr % 2 == 0) ? 1 : -1;
    }
    this.throbbingTime_ = 0;

    this.numPagesInViewer_ = 1;

    this.initProgressMeter_();
  }

  /** @private */
  initProgressMeter_() {
    const pdiv = getElem('progress');
    const svg = getElem('svgprogress');
    svg.addEventListener('click', (evt) => {
      let l = 0;
      const docEl = document.documentElement;
      for (let el = pdiv; el != docEl; el = el.parentNode) {
        l += el.offsetLeft;
      }
      const totalPages = this.currentBook_.getNumberOfPages();
      const page = Math.max(1, Math.ceil(((evt.clientX - l) / pdiv.offsetWidth) * totalPages)) - 1;
      this.currentPageNum_ = page;
      this.updateLayout();
    });
  }

  /** @private */
  handleSwipeEvent(evt) {
    if (!this.currentBook_) {
      return;
    }

    // Let scroll events happen if we are displaying text.
    if (evt.target.id === 'firstText') {
      return;
    }

    evt.preventDefault();

    // Keep the timer going if it has been started.
    if (this.wheelTimer_) {
      clearTimeout(this.wheelTimer_);
    }
    // If we haven't received wheel events for some time, reset things.
    this.wheelTimer_ = setTimeout(() => {
      this.wheelTimer_ = null;
      this.wheelTurnedPageAt_ = 0;
    }, 200);

    // Determine what delta is relevant based on orientation.
    const delta = (this.rotateTimes_ % 2 == 0 ? evt.deltaX : evt.deltaY);

    // If we turned the page, we won't let the page turn again until the delta
    // is below the hysteresis threshold (i.e. the swipe has lost its momentum).
    if (this.wheelTurnedPageAt_ !== 0) {
      if (Math.abs(delta) < SWIPE_THRESHOLD / 3) {
        this.wheelTurnedPageAt_ = 0;
      }
    } else {
      // If we haven't turned the page yet, see if this delta would turn the page.
      let turnPageFn = null;
      if (this.rotateTimes_ <= 1) {
        if (delta > SWIPE_THRESHOLD) turnPageFn = () => this.showNextPage();
        else if (delta < -SWIPE_THRESHOLD) turnPageFn = () => this.showPrevPage();
      } else if (this.rotateTimes_ <= 3) {
        if (delta < -SWIPE_THRESHOLD) turnPageFn = () => this.showNextPage();
        else if (delta > SWIPE_THRESHOLD) turnPageFn = () => this.showPrevPage();
      }
      if (turnPageFn) {
        turnPageFn();
        this.wheelTurnedPageAt_ = delta;
      }
    }
  }

  /**
   * @param {BookEvent} evt The BookEvent.
   * @private
   */
  handleBookEvent_(evt) {
    this.killThrobbing_();

    if (evt.source === this.currentBook_) {
      switch (evt.type) {
        case BookEventType.PROGRESS:
          getElem('header').classList.add('animating');
          this.updateProgressMeter();
          break;
        case BookEventType.PAGE_EXTRACTED:
          // Display first page(s) if we haven't yet.
          if (evt.pageNum <= this.numPagesInViewer_) {
            this.updateLayout();
          } else {
            this.updatePageMeter_();
          }
          break;
        case BookEventType.BINDING_COMPLETE:
          getElem('header').classList.remove('animating');
          this.updateLayout();
          this.updateProgressMeter();
          break;
      }
    }
  }

  getRotateTimes() { return this.rotateTimes_; }

  setRotateTimes(n) {
    n = parseInt(n, 10) % 4;
    if (n < 0) n += 4;

    if (this.rotateTimes_ !== n) {
      this.rotateTimes_ = n;
      this.updateLayout();
    }
  }

  rotateCounterClockwise() {
    this.setRotateTimes(this.rotateTimes_ - 1);
  }

  rotateClockwise() {
    this.setRotateTimes(this.rotateTimes_ + 1);
  }

  getFitMode() { return this.fitMode_; }

  setFitMode(m) {
    this.fitMode_ = m;
    this.updateLayout();
  }

  getNumPagesInViewer() { return this.numPagesInViewer_; }

  /** @private */
  killThrobbing_() {
    if (this.throbberTimerId_) {
      clearInterval(this.throbberTimerId_);
      this.throbberTimerId_ = null;
      this.throbbers_.forEach(el => el.style.visibility = 'hidden');
      this.throbbingTime_ = 0;
    }
  }

  /**
   * Sets the number of pages in the viewer (1- or 2-page viewer are supported).
   * @param {Number} numPages Can be 1 or 2
   */
  setNumPagesInViewer(numPages) {
    numPages = parseInt(numPages, 10);
    if (numPages < 1 || numPages > 2) return;

    if (this.numPagesInViewer_ !== numPages) {
      this.numPagesInViewer_ = numPages;
      this.updateLayout();
    }
  }

  /**
   * Updates the layout based on window size, scale mode, fit mode, rotations, and page mode and
   * then sets the page contents based on the current page of the current book.  If there is no
   * current book, we clear the contents of all the page elements.
   */
  updateLayout() {
    if (!this.currentBook_ || this.currentPageNum_ === -1) {
      this.clearPageContents_();
      return;
    }

    this.updatePageMeter_();
    this.updateProgressBackgroundPosition_();

    const page = this.currentBook_.getPage(this.currentPageNum_);
    if (!page) {
      console.log('updateLayout() before current page is loaded');
      return;
    }

    // This is the dimensions of the book viewer "window".
    const bvElem = getElem(BOOK_VIEWER_ELEM_ID);
    const bv = {
      left: 0,
      width: bvElem.offsetWidth,
      top: 0,
      height: window.innerHeight - bvElem.offsetTop,
      ar: (bvElem.offsetWidth) / (window.innerHeight - bvElem.offsetTop),
    };
    assert(bv.width, 'bv.width not set');
    assert(bv.height, 'bv.height not set');

    const svgTop = getElem('pages');
    const bvViewport = getElem('bvViewport');
    const page1 = getElem(ID_PAGE_1);
    const page2 = getElem(ID_PAGE_2);
    const page1Elems = [getElem('page1Image'), getElem('page1Html')];
    const page2Elems = [getElem('page2Image'), getElem('page2Html')];

    const portraitMode = (this.rotateTimes_ % 2 === 0);
    const par = page.getAspectRatio();

    let topw = bv.width, toph = bv.height;

    // This is the center of rotation, always rotating around the center of the book viewer.
    let rotx = bv.left + bv.width / 2;
    let roty = bv.top + bv.height / 2;
    let angle = 90 * this.rotateTimes_;

    if (this.numPagesInViewer_ === 1) {
      page1.style.display = '';
      page2.style.display = 'none';

      // This is the dimensions before transformation.  They can go beyond the bv dimensions.
      let pw, ph, pl, pt;

      if (portraitMode) {
        // Portrait, 1-page.
        if (this.fitMode_ === FitMode.Width ||
          (this.fitMode_ === FitMode.Best && bv.ar <= par)) {
          // fit-width, 1-page.
          // fit-best, 1-page, width maxed.
          pw = bv.width;
          ph = pw / par;
          pl = bv.left;
          if (par > bv.ar) { // not scrollable.
            pt = roty - ph / 2;
          } else { // fit-width, scrollable.
            pt = roty - bv.height / 2;
            if (this.rotateTimes_ === 2) {
              pt += bv.height - ph;
            }
          }
        } else {
          // fit-height, 1-page.
          // fit-best, 1-page, height maxed.
          ph = bv.height;
          pw = ph * par;
          pt = bv.top;
          if (par < bv.ar) { // not scrollable.
            pl = rotx - pw / 2;
          } else { // fit-height, scrollable.
            pl = bv.left;
            if (this.rotateTimes_ === 2) {
              pl += bv.width - pw;
            }
          }
        }

        if (topw < pw) topw = pw;
        if (toph < ph) toph = ph;
      } else {
        // Landscape, 1-page.
        if (this.fitMode_ === FitMode.Width ||
          (this.fitMode_ === FitMode.Best && par > (1 / bv.ar))) {
          // fit-best, 1-page, width-maxed.
          // fit-width, 1-page.
          pw = bv.height;
          ph = pw / par;
          pl = rotx - pw / 2;
          if (par > (1 / bv.ar)) { // not scrollable.
            pt = roty - ph / 2;
          } else { // fit-width, scrollable.
            pt = roty - bv.width / 2;
            if (this.rotateTimes_ === 1) {
              pt += bv.width - ph;
            }
          }
        } else {
          // fit-best, 1-page, height-maxed.
          // fit-height, 1-page.
          ph = bv.width;
          pw = ph * par;
          pt = roty - ph / 2;
          if (par < (1 / bv.ar)) { // not scrollable.
            pl = rotx - pw / 2;
          } else { // fit-height, scrollable.
            pl = rotx - bv.height / 2;
            if (this.rotateTimes_ === 3) {
              pl += bv.height - pw;
            }
          }
        }

        if (topw < ph) topw = ph;
        if (toph < pw) toph = pw;
      } // Landscape

      // Now size the page elements.
      for (const pageElem of page1Elems) {
        pageElem.setAttribute('x', pl);
        pageElem.setAttribute('y', pt);
        pageElem.setAttribute("width", pw);
        pageElem.setAttribute("height", ph);
      }

      this.showPageInViewer_(this.currentPageNum_, page1);
    } else {
      // 2-page view.
      page1.style.display = '';
      page2.style.display = '';

      // This is the dimensions before transformation.  They can go beyond the bv dimensions.
      let pw, ph, pl1, pt1, pl2, pt2;

      if (portraitMode) {
        // It is as if the book viewer width is cut in half horizontally for the purposes of
        // measuring the page fit.
        bv.ar /= 2;

        // Portrait, 2-page.
        if (this.fitMode_ === FitMode.Width ||
          (this.fitMode_ === FitMode.Best && bv.ar <= par)) {
          // fit-width, 2-page.
          // fit-best, 2-page, width maxed.
          pw = bv.width / 2;
          ph = pw / par;
          pl1 = bv.left;
          if (par > bv.ar) { // not scrollable.
            pt1 = roty - ph / 2;
          } else { // fit-width, scrollable.
            pt1 = roty - bv.height / 2;
            if (this.rotateTimes_ === 2) {
              pt1 += bv.height - ph;
            }
          }
        } else {
          // fit-height, 2-page.
          // fit-best, 2-page, height maxed.
          ph = bv.height;
          pw = ph * par;
          pt1 = bv.top;
          if (par < bv.ar) { // not scrollable.
            pl1 = rotx - pw;
          } else { // fit-height, scrollable.
            pl1 = bv.left;
            if (this.rotateTimes_ === 2) {
              pl1 += bv.width - pw * 2;
            }
          }
        }

        if (topw < pw * 2) topw = pw * 2;
        if (toph < ph) toph = ph;
      } else {
        bv.ar *= 2;

        // Landscape, 2-page.
        if (this.fitMode_ === FitMode.Width ||
          (this.fitMode_ === FitMode.Best && par > (1 / bv.ar))) {
          // fit-best, 2-page, width-maxed.
          // fit-width, 2-page.
          pw = bv.height / 2;
          ph = pw / par;
          pl1 = rotx - pw;
          if (par > (1 / bv.ar)) { // not scrollable.
            pt1 = roty - ph / 2;
          } else { // fit-width, scrollable.
            pt1 = roty - bv.width / 2;
            if (this.rotateTimes_ === 1) {
              pt1 += bv.width - ph;
            }
          }
        } else {
          // fit-best, 2-page, height-maxed.
          // fit-height, 2-page.
          ph = bv.width;
          pw = ph * par;
          pt1 = roty - ph / 2;
          if (par < (1 / bv.ar)) { // not scrollable.
            pl1 = rotx - pw;
          } else { // fit-height, scrollable.
            pl1 = rotx - bv.height / 2;
            if (this.rotateTimes_ === 3) {
              pl1 += bv.height - pw * 2;
            }
          }
        }
        if (topw < ph) topw = ph;
        if (toph < pw * 2) toph = pw * 2;
      } // Landscape

      pl2 = pl1 + pw;
      pt2 = pt1;

      // Now size the page elements.
      for (const pageElem of page1Elems) {
        pageElem.setAttribute('x', pl1);
        pageElem.setAttribute('y', pt1);
        pageElem.setAttribute("width", pw);
        pageElem.setAttribute("height", ph);
      }
      for (const pageElem of page2Elems) {
        pageElem.setAttribute('x', pl2);
        pageElem.setAttribute('y', pt2);
        pageElem.setAttribute("width", pw);
        pageElem.setAttribute("height", ph);
      }

      this.showPageInViewer_(this.currentPageNum_, page1);
      this.showPageInViewer_((this.currentPageNum_ < this.currentBook_.getNumberOfPages() - 1) ?
        this.currentPageNum_ + 1 : 0, page2);
    }

    // Rotate the book viewer viewport.
    const tr = `translate(${rotx}, ${roty}) rotate(${angle}) translate(${-rotx}, ${-roty})`;
    bvViewport.setAttribute('transform', tr);

    // Now size the top-level SVG element of the BookViewer.
    svgTop.style.display = '';
    svgTop.setAttribute('x', 0);
    svgTop.setAttribute('y', 0);
    svgTop.setAttribute('width', topw);
    svgTop.setAttribute('height', toph);
  }

  /** @private */
  updatePageMeter_() {
    const pageNum = this.currentPageNum_;
    const numPages = this.currentBook_.getNumberOfPages();
    getElem('page').innerHTML = (pageNum + 1) + '/' + numPages;
    getElem('pagemeter').setAttribute('width',
      100 * (numPages == 0 ? 0 : ((pageNum + this.numPagesInViewer_) / numPages)) + '%');
  }

  /** @private */
  updateProgressBackgroundPosition_() {
    const totalWidth = getElem('border').width.baseVal.value;
    const progressBkgnd = getElem('progress_bkgnd');
    const progressBkgndWidth = progressBkgnd.width.baseVal.value;
    progressBkgnd.setAttribute('x', totalWidth - progressBkgndWidth);
  }

  /**
   * @param {Book} book
   */
  setCurrentBook(book) {
    if (book && this.currentBook_ !== book) {
      this.closeBook();
      this.killThrobbing_();

      this.currentBook_ = book;
      book.subscribeToAllEvents(this, evt => this.handleBookEvent_(evt));

      const getX = (el) => parseFloat(el.getAttribute('x'), 10);
      this.throbbers_.forEach(el => el.style.visibility = 'visible');
      this.throbberTimerId_ = setInterval(() => {
        this.throbbingTime_ += THROBBER_TIMER_MS;
        if (this.throbbingTime_ > MAX_THROBBING_TIME_MS) {
          this.killThrobbing_();
        }

        // Animate throbbers until first byte loads.
        const T = this.throbbers_.length;
        for (let thr = 0; thr < T; ++thr) {
          // Throbbers travel along the bar until they bump into another throbber or the edge.
          const prev = thr - 1;
          const next = thr + 1;
          const MIN_X = (prev >= 0) ? getX(this.throbbers_[prev]) + THROBBER_WIDTH : MIN_THROBBER_X;
          const MAX_X = (next < T) ? getX(this.throbbers_[next]) : MAX_THROBBER_X;

          // Advance throbber's position.
          let pos = getX(this.throbbers_[thr]) + this.throbberDirections_[thr];// * (1 + thr * 0.25);
          // If it hit something, reverse direction.
          if ((pos + THROBBER_WIDTH) >= MAX_X && this.throbberDirections_[thr] > 0) {
            pos = MAX_X;
            this.throbberDirections_[thr] = -1;
          } else if (pos <= MIN_X && this.throbberDirections_[thr] < 0) {
            pos = MIN_X;
            this.throbberDirections_[thr] = 1;
          }
          // Update position
          this.throbbers_[thr].setAttribute('x', `${pos}%`);
        }
      }, THROBBER_TIMER_MS);

      this.currentPageNum_ = 0;
      this.updateProgressMeter();
      this.updateLayout();
    }
  }

  /**
   * Close the current book.
   */
  closeBook() {
    if (this.currentBook_) {
      this.currentBook_.unsubscribe(this);
      this.currentBook_ = null;
      this.currentPageNum_ = -1;
    }

    getElem('loadmeter').setAttribute('width', '0%');
    getElem('zipmeter').setAttribute('width', '0%');
    getElem('layoutmeter').setAttribute('width', '0%');
    getElem('pagemeter').setAttribute('width', '0%');
    getElem('page').innerHTML = '0/0';

    this.updateProgressMeter();
    this.updateLayout();
  }

  /** @return {boolean} If the next page was shown. */
  showPrevPage() {
    if (!this.currentBook_ || this.currentPageNum_ == 0) {
      return false;
    }

    this.currentPageNum_--;
    this.updateLayout();
    return true;
  }

  /** @return {boolean} If the next page was shown. */
  showNextPage() {
    // If there is no current book, or the viewer is showing the last pages of the book, just return.
    if (!this.currentBook_ ||
      (this.currentPageNum_ >= this.currentBook_.getNumberOfPages() - this.numPagesInViewer_)) {
      return false;
    }

    this.currentPageNum_++;
    this.updateLayout();
    return true;
  }

  showPage(n) {
    if (!this.currentBook_ ||
      (n < 0 || n >= this.currentBook_.getNumberOfPages() || n == this.currentPageNum_)) {
      return;
    }
    this.currentPageNum_ = n;
    this.updateLayout();
  }

  /**
   * @param {number} pct
   * @param {string} meterId
   */
  animateMeterTo_(pct, meterId) {
    getElem(meterId).setAttribute('width', pct + '%');
  }

  /**
   * Updates the book viewer meters based on the current book's progress.
   * @param {string} label
   */
  updateProgressMeter(label = undefined) {
    if (!this.currentBook_) {
      return;
    }

    let loadingPct = this.currentBook_.getLoadingPercentage();
    let unzippingPct = this.currentBook_.getUnarchivingPercentage();
    let layingOutPct = this.currentBook_.getLayoutPercentage();
    let totalPages = this.currentBook_.getNumberOfPages();
    loadingPct = Math.max(0, Math.min(100 * loadingPct, 100));
    unzippingPct = Math.max(0, Math.min(100 * unzippingPct, 100));
    layingOutPct = Math.max(0, Math.min(100 * layingOutPct, 100));

    this.animateMeterTo_(loadingPct, 'loadmeter');
    this.animateMeterTo_(unzippingPct, 'zipmeter');
    this.animateMeterTo_(layingOutPct, 'layoutmeter');

    let bkgndWidth = Math.ceil(Math.log10(totalPages + 1)) * 2 + 1;
    getElem('page_bkgnd').setAttribute('width', `${bkgndWidth * 10}`);
    getElem('page').innerHTML = (this.currentPageNum_ + 1) + '/' + totalPages;

    let title = getElem('progress_title');
    while (title.firstChild) title.removeChild(title.firstChild);

    let labelPct;
    let labelText;
    if (loadingPct < 100) {
      labelText = 'Loading';
      labelPct = loadingPct;
    } else if (unzippingPct < 100) {
      labelText = 'Unzipping';
      labelPct = unzippingPct;
    } else if (layingOutPct < 100) {
      labelText = 'Layout';
      labelPct = layingOutPct;
    } else {
      labelText = 'Complete'
      labelPct = 100;
    }
    if (label) {
      labelText = label;
    }
    title.appendChild(document.createTextNode(`${labelText} ${labelPct.toFixed(2)}% `));

    const progressBkgndWidth = (labelText.length + 4) * 10;
    getElem('progress_bkgnd').setAttribute('width', `${progressBkgndWidth}`);
    this.updateProgressBackgroundPosition_();

    // Update some a11y attributes of the progress meter.
    if (this.currentBook_) {
      const totalPct = (loadingPct + unzippingPct + layingOutPct) / 3;
      const totalPctStr = totalPct.toFixed(2) + '%';
      const bvElem = getElem(BOOK_VIEWER_ELEM_ID);
      const progressElem = getElem('progress');
      progressElem.setAttribute('aria-label', totalPctStr);
      if (totalPctStr !== '100.00%') {
        bvElem.setAttribute('aria-busy', 'true');
        bvElem.setAttribute('aria-describedby', 'progress');
        progressElem.setAttribute('aria-valuenow', totalPct);
        progressElem.setAttribute('aria-valuemin', '0');
        progressElem.setAttribute('aria-valuemax', '100');
      } else {
        bvElem.setAttribute('aria-busy', 'false');
        bvElem.removeAttribute('aria-describedBy');
        progressElem.removeAttribute('aria-valuenow');
        progressElem.removeAttribute('aria-valuemin');
        progressElem.removeAttribute('aria-valuemax');
      }
    }
    this.updatePageMeter_();
  }

  /**
   * Wipes out the contents of all book viewer elements.
   */
  clearPageContents_() {
    const imageElems = [getElem('page1Image'), getElem('page2Image')];
    const objElems = [getElem('page1Html'), getElem('page2Html')];
    for (const imageEl of imageElems) {
      imageEl.style.display = '';
      imageEl.setAttribute('href', '');
    }
    for (const objEl of objElems) {
      objEl.style.display = '';
      while (objEl.firstChild) {
        objEl.firstChild.remove();
      }
    }
  }

  /**
   * Renders contents of page number pageNum in the page viewer element.
   * @param {Number} pageNum The page number to render into the div.
   * @param {Element} pageViewerEl The <g> for the page viewer.
   * @private
   */
  showPageInViewer_(pageNum, pageViewerEl) {
    assert(this.currentBook_, 'Current book not defined in setPageContents_()');
    assert(this.currentBook_.getNumberOfPages() > pageNum,
      'Book does not have enough pages in setPageContents_()');

    const thePage = this.currentBook_.getPage(pageNum);
    // It's possible we are in a 2-page viewer, but the page is not in the book yet.
    if (!thePage) {
      return;
    }

    pageViewerEl.dataset.pagenum = pageNum;
    const imageEl = pageViewerEl.querySelector('image');
    const objEl = pageViewerEl.querySelector('foreignObject');
    thePage.renderIntoViewer(imageEl, objEl);
  }
}
