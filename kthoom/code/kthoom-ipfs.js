/**
 * kthoom-ipfs.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */

/**
 * Code for handling file access through IPFS.
 */

if (window.kthoom === undefined) {
  window.kthoom = {};
}

kthoom.ipfs = {
  nodePromise_: undefined,
  node_: undefined,
  getNode() {
    if (!kthoom.ipfs.nodePromise_) {
      kthoom.getApp().updateProgressMeter('Loading code for IPFS...');
      kthoom.ipfs.nodePromise_ = new Promise((resolve, reject) => {
        // Load in the IPFS script API.
        const ipfsScriptEl = document.createElement('script');
        ipfsScriptEl.addEventListener('load', () => {
          if (window.ipfs) {
            kthoom.ipfs.node_ = window.ipfs;
            resolve(window.ipfs);
          } else {
            kthoom.getApp().updateProgressMeter('Creating IPFS node...');
            const node = window.Ipfs.createNode();
            node.on('start', () => {
              kthoom.ipfs.node_ = node;
              resolve(node);
            });
          }
        });
        ipfsScriptEl.setAttribute('src', 'https://unpkg.com/ipfs@0.27.7/dist/index.js');
        document.body.appendChild(ipfsScriptEl);
      });
    }
    return kthoom.ipfs.nodePromise_;
  },
  loadHash(ipfshash) {
    kthoom.ipfs.getNode().then(node => {
      kthoom.getApp().updateProgressMeter('Fetching data from IPFS...');
      node.files.cat(ipfshash, (err, data) => {
        if (err) throw err;

        // NOTE: The API says this will be a Buffer, but I'm seeing an Uint8Array.
        if (data instanceof Uint8Array) {
          kthoom.getApp().loadSingleBookFromArrayBuffer(ipfshash, data.buffer);
        }
      });
    });
  },
  ipfsHashWindow() {
    const ipfshash = window.prompt("Enter the IPFS hash of the book to load");
    if (ipfshash) {
      kthoom.ipfs.loadHash(ipfshash);
    }
  },
};
