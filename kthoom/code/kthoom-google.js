/**
 * kthoom-google.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */

/**
 * Code for handling file access through Google Drive.
 * Ideally, we don't want any Google code to load unless the user clicks
 * the Open menu item.
 */

if (window.kthoom == undefined) {
  window.kthoom = {};
}

let openMenu;

function defineGoogleHooks() {
  const SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.readonly',
  ].join(' ');

  // TODO: Turn this script into a module and remove most things from window.kthoom.google.
  window.kthoom.google = {
    isBooted: false,
    isSignedIn: false,
    isAuthorized: false,
    isReadyToCallAPIs: false,
    oathToken: undefined,
    authInstance: undefined,

    async boot() {
      if (typeof gapi === 'undefined') {
        // Load the Google API script.
        await new Promise((resolve, reject) => {
          // If we cannot load the Google API script, then die.
          const gScript = document.createElement('script');
          gScript.setAttribute('async', 'async');
          gScript.setAttribute('defer', 'defer');
          gScript.onerror = err => reject(err);
          gScript.addEventListener('load', () => resolve());
          gScript.setAttribute('src', 'https://apis.google.com/js/api.js');
          document.body.appendChild(gScript);
        });

        // Load initial API client and auth2 modules.
        await new Promise((resolve, reject) => {
          if (typeof gapi === 'undefined') {
            reject('gapi was not defined');
          }
          gapi.load('client:auth2', {
            callback: () => {
              gapi.client.init({
                'apiKey': kthoom.google.apiKey,
                'clientId': kthoom.google.clientId,
                'scope': SCOPE,
                // 'discoveryDocs': [
                //   'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                // ],
              }).then(() => {
                kthoom.google.isBooted = true;

                // See if we are already signed in and authorized.
                const authInstance = gapi.auth2.getAuthInstance();
                const currentUser = authInstance.currentUser.get();
                authInstance.isSignedIn.listen(signedIn => {
                  kthoom.google.isSignedIn = signedIn;
                });
                kthoom.google.authInstance = authInstance;
                kthoom.google.isSignedIn = authInstance.isSignedIn.get();

                const hasScopes = currentUser.hasGrantedScopes(SCOPE);
                if (hasScopes) {
                  const result = gapi.client.getToken();
                  // TODO: It is possible to revoke kthoom's access, but this still returns
                  //     an access token.
                  if (result && !result.error && result.access_token) {
                    kthoom.google.isAuthorized = true;
                    kthoom.google.oathToken = result.access_token;
                    gapi.client.setApiKey(kthoom.google.oauthToken);
                  }
                }
                resolve();
              }, err => {
                debugger;
                reject(err);
              });
            },
            onerror: err => reject(err),
          });
        });
      }
    },

    async authorize() {
      if (!kthoom.google.isBooted) {
        await kthoom.google.boot();
      }

      // If signed in, but never were granted scopes or an OAuth token, sign out.
      if (kthoom.google.isSignedIn && !kthoom.google.isAuthorized) {
        await kthoom.authInstance.signOut();
        // TODO: Should we call authInstance.disconnect() ?
        kthoom.google.isSignedIn = false;
      }

      // If not signed in, then do it.
      if (!kthoom.google.isSignedIn) {
        await kthoom.google.authInstance.signIn();
        kthoom.google.isSignedIn = true;
      }

      const result = gapi.client.getToken();
      if (result && !result.error && result.access_token) {
        kthoom.google.isAuthorized = true;
        kthoom.google.oathToken = result.access_token;
        gapi.client.setApiKey(kthoom.google.oauthToken);
      } else {
        throw `Not authorized: ${result.error}`;
      }
    },

    async loadAPILibs() {
      if (!kthoom.google.isBooted) {
        await kthoom.google.boot();
      }

      if (!kthoom.google.isAuthorized) {
        await kthoom.google.authorize();
      }

      return new Promise((resolve, reject) => {
        // Load the Drive and Picker APIs.
        gapi.client.load('drive', 'v2', () => {
          gapi.load('picker', {
            callback: () => {
              kthoom.google.isReadyToCallAPIs = true;
              resolve();
            },
            onerror: err => reject(err),
            timeout: 5000,
            ontimeout: () => {
              reject('gapi.load(picker) timed out');
            },
          });
        }, err => {
          reject(err);
        })
      });
    },

    async doDrive() {
      // TODO: Show "Please wait" or a spinner while things get ready.
      if (!kthoom.google.isBooted) {
        await kthoom.google.boot();
      }

      if (!kthoom.google.isAuthorized) {
        await kthoom.google.authorize();
      }

      if (!kthoom.google.isReadyToCallAPIs) {
        await kthoom.google.loadAPILibs();
      }

      const docsView = new google.picker.DocsView();
      docsView.setMode(google.picker.DocsViewMode.LIST);
      docsView.setQuery('*.cbr|*.cbz|*.cbt');
      const picker = new google.picker.PickerBuilder().
        addView(docsView).
        // Enable this feature when we can efficiently get downloadUrls
        // for each file selected (right now we'd have to do drive.get
        // calls for each file which is annoying the way we have set up
        // library.allBooks).
        //enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
        enableFeature(google.picker.Feature.NAV_HIDDEN).
        setOAuthToken(kthoom.google.oathToken).
        setDeveloperKey(kthoom.google.apiKey).
        setAppId(kthoom.google.clientId).
        setCallback(kthoom.google.pickerCallback).
        build();
      picker.setVisible(true);
    },

    pickerCallback(data) {
      if (data.action == google.picker.Action.PICKED) {
        const fullSize = data.docs[0].sizeBytes;
        const gRequest = gapi.client.drive.files.get({
          'fileId': data.docs[0].id,
          'fields': 'webContentLink',
        });
        gRequest.execute(function (response) {
          const bookName = data.docs[0].name;
          const fileId = data.docs[0].id;
          // NOTE:  The CORS headers are not set properly on the webContentLink (URLs from
          //     drive.google.com).  See https://issuetracker.google.com/issues/149891169.
          const bookUrl = `https://www.googleapis.com/drive/v2/files/${fileId}?alt=media`;
          // Try to download using fetch, otherwise use XHR.
          try {
            const myHeaders = new Headers();
            myHeaders.append('Authorization', 'OAuth ' + kthoom.google.oathToken);
            myHeaders.append('Origin', window.location.origin);
            const myInit = {
              method: 'GET',
              headers: myHeaders,
              mode: 'cors',
              cache: 'default',
            };

            // TODO: This seems to pause a long time between making the first fetch and actually
            //     starting to download.  Show something in the UI?  A spinner?
            kthoom.getApp().loadSingleBookFromFetch(bookName, bookUrl, fullSize, myInit);
          } catch (e) {
            if (typeof e === 'string' && e.startsWith('No browser support')) {
              kthoom.getApp().loadSingleBookFromXHR(bookName, bookUrl, fullSize, {
                'Authorization': ('OAuth ' + kthoom.google.oathToken),
              });
            }
          }
        });
      }
    },
  };
}

(async function () {
  try {
    // Wait for everything to be loaded.
    await new Promise((resolve, reject) => {
      window.addEventListener('load', () => resolve());
    });

    // Load the Google API key if it exists.
    const gkey = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'gkey.json', true);
      xhr.responseType = 'json';
      xhr.onload = (evt) => {
        if (evt.target.status !== 200) {
          reject('gkey.json not found');
        }
        resolve(evt.target.response);
      };
      xhr.onerror = err => reject(err);
      xhr.send(null);
    });

    if (!gkey['apiKey'] || !gkey['clientId']) {
      throw 'No API key or client ID found in gkey.json';
    }

    const app = kthoom.getApp();
    if (!app) {
      throw 'No kthoom app instance found';
    }

    openMenu = app.getMenu('open');
    if (!openMenu) {
      throw 'No Open menu found in the kthoom app';
    }

    // If we get here, we know the hosted kthoom instance has a Google API Key, so
    // we can show the Open menu item.
    defineGoogleHooks();
    kthoom.google.apiKey = gkey['apiKey'];
    kthoom.google.clientId = gkey['clientId'];
    openMenu.showMenuItem('menu-open-google-drive', true);
  } catch (err) {
    // Die.
    console.warn(`No Google Drive Integration: ${err}`);
  }
})();
