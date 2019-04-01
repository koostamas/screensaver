/*
 *  Copyright (c) 2015-2019, Michael A. Updike All rights reserved.
 *  Licensed under the BSD-3-Clause
 *  https://opensource.org/licenses/BSD-3-Clause
 *  https://github.com/opus1269/screensaver/blob/master/LICENSE.md
 */
import '../../scripts/chrome-extension-utils/scripts/ex_handler.js';

import PhotoSource from './photo_source.js';

/**
 * A source of photos from reddit
 * @module sources/photo_source_reddit
 */

/**
 * Extension's redirect uri
 * @type {string}
 * @const
 * @private
 */
const _REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/reddit`;

// noinspection SpellCheckingInspection
/**
 * Reddit rest API authorization key
 * @type {string}
 * @const
 * @private
 */
const _KEY = 'bATkDOUNW_tOlg';

/**
 * Max photos to return
 * @type {int}
 * @const
 * @private
 */
const _MAX_PHOTOS = 200;

/**
 * Min size of photo to use
 * @type {int}
 * @const
 * @private
 */
const _MIN_SIZE = 750;

/**
 * Max size of photo to use
 * @type {int}
 * @const
 * @private
 */
const _MAX_SIZE = 3500;

/**
 * Expose reddit API
 * @type {Function}
 * @private
 */
let _snoocore;

/**
 * A source of photos from reddit
 * @extends module:sources/photo_source.PhotoSource
 * @alias module:sources/photo_source_reddit.RedditSource
 */
class RedditSource extends PhotoSource {

  /**
   * Create a new photo source
   * @param {string} useKey - The key for if the source is selected
   * @param {string} photosKey - The key for the collection of photos
   * @param {string} type - A descriptor of the photo source
   * @param {string} desc - A human readable description of the source
   * @param {boolean} isDaily - Should the source be updated daily
   * @param {boolean} isArray - Is the source an Array of photo Arrays
   * @param {?Object} [loadArg=null] - optional arg for load function
   */
  constructor(useKey, photosKey, type, desc, isDaily, isArray,
              loadArg = null) {
    super(useKey, photosKey, type, desc, isDaily, isArray, loadArg);
  }

  /**
   * Parse the size from the submission title.
   * this is the old way reddit did it
   * @param {string} title - submission title
   * @returns {{width: int, height: int}} Photo size
   * @private
   */
  static _getSize(title) {
    const ret = {width: -1, height: -1};
    const regex = /\[(\d*)\D*(\d*)]/;
    const res = title.match(regex);
    if (res) {
      ret.width = parseInt(res[1], 10);
      ret.height = parseInt(res[2], 10);
    }
    return ret;
  }

  /**
   * Build the list of photos for one page of items
   * @param {Array} children - Array of objects from reddit
   * @returns {module:sources/photo_source.Photo[]} Array of photos
   * @private
   */
  static _processChildren(children) {
    const photos = [];
    let url;
    let width = 1;
    let height = 1;

    for (const child of children) {
      const data = child.data;
      if (!data.over_18) {
        // skip NSFW
        if (data.preview && data.preview.images) {
          // new way. has full size image and array of reduced
          // resolutions
          let item = data.preview.images[0];
          url = item.source.url.replace(/&amp;/g, '&');
          width = parseInt(item.source.width, 10);
          height = parseInt(item.source.height, 10);
          if (Math.max(width, height) > _MAX_SIZE) {
            // too big. get the largest reduced resolution image
            item = item.resolutions[item.resolutions.length - 1];
            url = item.url.replace(/&amp;/g, '&');
            // noinspection JSCheckFunctionSignatures
            width = parseInt(item.width, 10);
            // noinspection JSCheckFunctionSignatures
            height = parseInt(item.height, 10);
          }
        } else if (data.title) {
          // old way of specifying images - parse size from title
          const size = RedditSource._getSize(data.title);
          url = data.url;
          width = size.width;
          height = size.height;
        }
      }

      const asp = width / height;
      const author = data.author;
      if (asp && !isNaN(asp) && (Math.max(width, height) >= _MIN_SIZE) &&
          (Math.max(width, height) <= _MAX_SIZE)) {
        PhotoSource.addPhoto(photos, url, author, asp, data.url);
      }
    }
    return photos;
  }

  /**
   * Fetch the photos for this source
   * @throws An error if fetch failed
   * @returns {Promise<module:sources/photo_source.Photo[]>} Array of photos
   */
  async fetchPhotos() {
    let photos = [];
    const SRC = `${this._loadArg}hot`;

    const Snoocore = window.Snoocore;
    if (Snoocore === undefined) {
      throw new Error('Reddit library failed to load');
    }

    try {

      _snoocore = new Snoocore({
        userAgent: 'photo-screen-saver',
        throttle: 0,
        oauth: {
          type: 'implicit',
          key: _KEY,
          redirectUri: _REDIRECT_URI,
          scope: ['read'],
        },
      });

      // web request to get first batch of results
      let slice = await _snoocore(SRC).listing({limit: _MAX_PHOTOS});
      let slicePhotos;
      if (slice && slice.children && slice.children.length) {
        slicePhotos = RedditSource._processChildren(slice.children);
        slicePhotos = slicePhotos || [];
        photos = photos.concat(slicePhotos);
      } else {
        return Promise.reject(new Error('No reddit photos found'));
      }

      // continue while there are more photos and we haven't reached the max
      while (photos.length < _MAX_PHOTOS) {
        slice = await slice.next();
        if (slice && slice.children && slice.children.length) {
          slicePhotos = RedditSource._processChildren(slice.children);
          slicePhotos = slicePhotos || [];
          if (slicePhotos.length) {
            photos = photos.concat(slicePhotos);
          } else {
            break;
          }
        } else {
          break;
        }
      }

    } catch (err) {
      let msg = err.message;
      if (msg) {
        // extract first sentence
        const idx = msg.indexOf('\n');
        if (idx !== -1) {
          msg = msg.substring(0, idx + 1);
        }
      } else {
        msg = 'Unknown Error';
      }
      throw new Error(msg);
    }

    return Promise.resolve(photos);
  }
}

export default RedditSource;

