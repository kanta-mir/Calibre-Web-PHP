/**
 * kthoom-microsoft.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2018 Google Inc.
 */

 /**
 * Code for handling file access through Microsoft OneDrive.
 */

// http://msdn.microsoft.com/en-us/library/dn659750.aspx
// http://msdn.microsoft.com/en-us/library/hh550837.aspx
// WL.init() http://msdn.microsoft.com/en-us/library/hh550844.aspx
// WL.login() http://msdn.microsoft.com/en-us/library/hh550845.aspx
// Picker: http://msdn.microsoft.com/en-us/library/windows/apps/jj219328.aspx
//     and http://msdn.microsoft.com/en-us/library/windows/apps/jj219328.aspx#Display_the_file_picker__directly_by_calling_the_WL.fileDialog_method

if (window.kthoom == undefined) {
  window.kthoom = {};
}

kthoom.microsoft = {
  authed: false,
};
