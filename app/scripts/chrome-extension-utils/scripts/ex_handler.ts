/*
 *  Copyright (c) 2015-2019, Michael A. Updike All rights reserved.
 *  Licensed under the BSD-3-Clause
 *  https://opensource.org/licenses/BSD-3-Clause
 *  https://github.com/opus1269/screensaver/blob/master/LICENSE.md
 */
import * as ChromeLog from './log.js';

/**
 * Google Oauth2.0 utilities
 * @see https://developer.chrome.com/apps/identity
 * @module chrome/exception
 */

/**
 * Replace global error handler for logging with Google Analytics.
 */
export class ExHandler {
  
  /**
   * Replace window.onerror
   * @constructor
   */
  constructor() {
    if (typeof window.onerror === 'object') {
      // global error handler
      window.onerror = function(message, url, line, col, errObject) {
        if (ChromeLog && errObject) {
          ChromeLog.exception(errObject, null, true);
        }
      };
    }
  }

}

new ExHandler();
