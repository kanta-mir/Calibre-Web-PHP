# kthoom

kthoom is a comic book / ebook reader that runs in the browser using client-side open web technologies such as JavaScript, HTML5, the File API, Web Workers, and Typed Arrays.  It can open files from your local hard drive, the network, or Google Drive.

[OPEN KTHOOM COMIC BOOK READER](https://codedread.com/kthoom/index.html).

You can also specify a comic book to load via the ?bookUri parameter.  Some examples:

  * https://codedread.github.io/kthoom/index.html?bookUri=examples/codedread.cbz
  * https://codedread.github.io/kthoom/index.html?bookUri=examples/wizard-of-oz.epub

Or a [comic book reading list](https://github.com/codedread/kthoom/tree/master/reading-lists) via the ?readingListUri parameter.

## Documentation

### File Support

  * .cbz (zip)
  * .cbr ([rar](https://codedread.github.io/bitjs/docs/unrar.html))
  * .cbt (tar)
  * .epub (primitive support, a work-in-progress, see [issue #16](https://github.com/codedread/kthoom/issues/16))

### Keyboard Shortcuts
  * O / U: Open files from computer, network.
  * Right/Left: Next/Previous page of book.
  * Shift + Right/Left: Last/First page of book.
  * [ / ]: Prev / Next book
  * H/W: Scale to height/width
  * B: Best Fit mode
  * R/L: Rotate right/left
  * 1/2: Show 1 or 2 pages side-by-side in the viewer.
  * F: Toggle fullscreen.
  * S: Toggle the Reading Stack drawer open.
  * ?: Bring up Help screen

You can tell kthoom to open as many books as you like in the Choose Files dialog (shift-select all the books you want to open). Then navigate between books using the square bracket keys or use the Reading Stack drawer.

### Binary File Support

NOTE: kthoom loads in local compressed files and decompresses them in the browser, which means that kthoom has an implementation of unzip, unrar and untar in JavaScript. This code has been migrated to its own library: [BitJS](https://github.com/codedread/bitjs), a more general purpose library to deal with binary file data in native JavaScript.

### JSON Reading Lists

kthoom supports loading lists of comic book files at once.  Think audio playlists but for comic books!  See [JSON Reading Lists](https://github.com/codedread/kthoom/tree/master/reading-lists) for more.
