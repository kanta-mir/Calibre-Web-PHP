/**
 * page.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */

import { convertWebPtoJPG } from './bitjs/image/webp-shim/webp-shim.js';
import { findMimeType } from './bitjs/file/sniffer.js';

const DEFAULT_ASPECT_RATIO = 6.625 / 10.25;

/**
 * @param {ArrayBuffer} ab
 * @param {string} mimeType
 * @return {string} A URL representing the ArrayBuffer.
 */
function createURLFromArray(ab, mimeType) {
  if (mimeType === 'image/xml+svg') {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(new TextDecoder('utf-8').decode(ab));
  }
  const offset = ab.byteOffset;
  let blob = new Blob([ab], { type: mimeType }).slice(offset, offset + ab.byteLength, mimeType);
  return URL.createObjectURL(blob);
};

/**
 * Base class for Pages.
 */
export class Page {
  constructor(pageName, mimeType) {
    /** @private {string} */
    this.pageName_ = pageName;

    /** @private {string} */
    this.mimeType_ = mimeType;
  }

  getAspectRatio() { return DEFAULT_ASPECT_RATIO; }
  getMimeType() { return this.mimeType_; }
  getPageName() { return this.pageName_; }

  /**
   * Renders this page into the page viewer.
   * @param {SVGImageElement} imageEl
   * @param {SVGForeignObjectElement} objEl
   */
  renderIntoViewer(imageEl, objEl) {
    throw 'Cannot render an abstract Page object, use a subclass.';
  }
}

/**
 * A page that holds a single image.
 */
export class ImagePage extends Page {
  /**
   * @param {string} name
   * @param {string} mimeType
   * @param {number} Aspect ratio.
   * @param {string} dataURI
   */
  constructor(name, mimeType, aspectRatio, dataURI) {
    super(name, mimeType);

    /** @private {number} */
    this.aspectRatio_ = aspectRatio;

    /** @private {string} */
    this.dataURI_ = dataURI;
  }

  getAspectRatio() { return this.aspectRatio_; }
  getURI() { return this.dataURI_; }

  /**
   * Renders this page into the page viewer.
   * @param {SVGImageElement} imgEl
   * @param {SVGForeignObjectElement} objEl
   */
  renderIntoViewer(imageEl, objEl) {
    imageEl.style.display = '';
    objEl.style.display = 'none';
    imageEl.setAttribute('href', this.dataURI_);
  }
}

/**
 * A page that needs to use the webp-shim to convert, done on first render.
 */
export class WebPShimImagePage extends Page {
  /**
   * @param {string} name
   * @param {ArrayBuffer} webpBuffer
   */
  constructor(name, webpBuffer) {
    super(name, 'image/webp');

    /** @private {number} */
    this.aspectRatio_ = DEFAULT_ASPECT_RATIO;

    /** @private {ArrayBuffer} */
    this.webpBuffer_ = webpBuffer;

    /** @private {string} */
    this.dataURI_ = null;

    /** @private {Promise} */
    this.inflatingPromise_ = null;
  }

  getAspectRatio() { return this.aspectRatio_; }

  /** @returns {Promise} A Promise that resolves when conversion is complete. */
  inflate() {
    if (this.dataURI_) {
      return Promise.resolve();
    } else if (this.inflatingPromise_) {
      return this.inflatingPromise_;
    }
    return this.inflatingPromise_ = convertWebPtoJPG(this.webpBuffer_).then(jpgBuffer => {
      // Release references so they can be garbage-collected.
      this.webpBuffer_ = null;
      this.mimeType_ = 'image/jpeg';
      return createURLFromArray(jpgBuffer, 'image/jpeg');
    });
  }

  isInflated() { return !!this.dataURI_; }

  /**
   * Renders this page into the page viewer.
   * @param {SVGImageElement} imgEl
   * @param {SVGForeignObjectElement} objEl
   */
  renderIntoViewer(imageEl, objEl) {
    if (!this.isInflated()) {
      this.inflate().then(dataURI => {
        this.dataURI_ = dataURI;
        this.inflatingPromise_ = null;
        this.renderIntoViewer(imageEl, objEl);
      });
      return;
    }

    imageEl.style.display = '';
    objEl.style.display = 'none';
    imageEl.setAttribute('href', this.dataURI_);
    // TODO: Set aspect ratio properly from here?
  }
}

/**
 * A page that holds raw text.
 */
export class TextPage extends Page {
  /**
   * @param {string} name
   * @param {string} text The raw text in the page.
   */
  constructor(name, text) {
    super(name, 'text/plain');

    /** @private {string} */
    this.rawText_ = text;
  }

  /**
   * Renders this page into the page viewer.
   * @param {SVGImageElement} imageEl
   * @param {SVGForeignObjectElement} objEl
   */
  renderIntoViewer(imageEl, objEl) {
    imageEl.style.display = 'none';
    while (objEl.firstChild) {
      objEl.firstChild.remove();
    }
    const textDiv = document.createElement('div');
    textDiv.innerHTML = `<pre>${this.rawText_}</pre>`;
    objEl.appendChild(textDiv);
    objEl.style.display = '';
  }
}

/**
 * A page that holds an iframe with sanitized XHTML.  Every time this page is added into a
 * Book Viewer page <g> element, it inflates itself.
 */
export class XhtmlPage extends Page {
  /**
   * @param {string} name
   * @param {HTMLIframeElement} iframeEl
   * @param {Function(HTMLIframeElement)} inflaterFn Function to be called after the iframe is
   *     appended to the foreignObject element.
   */
  constructor(name, iframeEl, inflaterFn) {
    super(name, 'application/xhtml+xml');

    /** @private {HTMLIframeElement} */
    this.iframeEl_ = iframeEl;

    /** @private {Function} */
    this.inflaterFn_ = inflaterFn;
  }

  /**
   * Renders this page into the page viewer.
   * @param {SVGImageElement} imageEl
   * @param {SVGForeignObjectElement} objEl
   */
  renderIntoViewer(imageEl, objEl) {
    imageEl.style.display = 'none';
    while (objEl.firstChild) {
      objEl.firstChild.remove();
    }
    objEl.appendChild(this.iframeEl_);
    this.inflaterFn_(this.iframeEl_);
    objEl.style.display = '';
  }
}

/**
 * TODO: Add something to bitjs.image to sniff the bytes of an image file and get its MIME type?
 * @param {string} filename
 * @return {string|undefined} The MIME type or undefined if we could not guess it.
 */
export function guessMimeType(filename) {
  const fileExtension = filename.split('.').pop().toLowerCase();
  switch (fileExtension) {
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/xml+svg';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'bmp': return 'image/bmp';
    case 'htm': case 'html': return 'text/html';
    case 'sfv': return 'text/x-sfv';
    case 'txt': return 'text/plain';
  }

  // Skip over PAR files (.PAR, .PAR2, .P01, etc).
  if (fileExtension === 'par' || fileExtension === 'par2' || /^p\d\d$/.test(fileExtension)) {
    return 'application/octet-stream';
  }

  return undefined;
};

function isSafari() {
  var ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
}

/**
 * Factory method that creates a Page from a File.
 * @param {UnarchivedFile} file
 * @return {Promise<Page>} A Promise that gets a Page (like an ImagePage).
 */
export const createPageFromFileAsync = function (file) {
  return new Promise((resolve, reject) => {
    const filename = file.filename;
    const sniffedMimeType = findMimeType(file.fileData);
    const mimeType = guessMimeType(filename);
    if (!mimeType) {
      resolve(new TextPage(filename, `Could not determine type of file "${filename}"`));
      return;
    }
    if (sniffedMimeType !== mimeType) {
      console.error(`mime type mismatch: ${sniffedMimeType} vs ${mimeType}`);
    }

    const ab = file.fileData;
    if (mimeType === 'image/webp' && isSafari()) {
      resolve(new WebPShimImagePage(filename, ab));
      return;
    }

    const dataURI = createURLFromArray(ab, mimeType);

    if (mimeType.indexOf('image/') === 0) {
      const img = new Image();
      img.onload = () => {
        resolve(new ImagePage(filename, mimeType, img.naturalWidth / img.naturalHeight, dataURI));
      };
      img.onerror = (e) => { resolve(new TextPage(filename, `Could not open file ${filename}`)); };
      img.src = dataURI;
    } else if (mimeType.startsWith('text/')) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', dataURI, true);
      xhr.onload = () => {
        if (xhr.responseText.length < 1000 * 1024) {
          resolve(new TextPage(filename, xhr.responseText));
        } else {
          reject('Could not create a new text page from file ' + filename);
        }
      };
      xhr.onerror = (e) => { reject(e); };
      xhr.send(null);
    } else if (mimeType === 'application/octet-stream') {
      resolve(new TextPage(filename, 'Could not display binary file "' + filename + '"'));
    }
  });
};
