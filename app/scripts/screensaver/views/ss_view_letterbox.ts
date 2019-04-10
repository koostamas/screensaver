/*
 *  Copyright (c) 2015-2019, Michael A. Updike All rights reserved.
 *  Licensed under the BSD-3-Clause
 *  https://opensource.org/licenses/BSD-3-Clause
 *  https://github.com/opus1269/screensaver/blob/master/LICENSE.md
 */

/**
 * Letterbox view
 * @module ss/views/view_letterbox
 */

import '../../../scripts/chrome-extension-utils/scripts/ex_handler.js';

import SSView from './ss_view.js';
import SSPhoto from '../ss_photo.js';

/**
 * Aspect ratio of screen
 * @type {number}
 * @const
 * @private
 */
const _SCREEN_AR = screen.width / screen.height;

/**
 * Letterbox view
 */
class SSViewLetterbox extends SSView {

  /**
   * Create new SSView
   * @param photo - The {@link SSPhoto} we will contain initially
   * @constructor
   */
  constructor(photo: SSPhoto) {
    super(photo);
  }

  /**
   * Render the page for display
   */
  public render() {
    super.render();

    const ar = this.photo.getAspectRatio();
    const image = this.image;
    const imageStyle = image.style;
    const img: any = image.$.img;
    const imgStyle = img.style;
    const authorStyle = this.author.style;
    const locationStyle = this.location.style;
    const weatherStyle = this.weather.style;
    const timeStyle = this.time.style;

    // percent of the screen width of image
    let imgWidthPer = ((ar / _SCREEN_AR * 100));
    imgWidthPer = Math.min(imgWidthPer, 100.0);
    const right = (100 - imgWidthPer) / 2;
    // percent of the screen height of image
    let imgHeightPer = ((_SCREEN_AR / ar * 100));
    imgHeightPer = Math.min(imgHeightPer, 100.0);
    const bottom = (100 - imgHeightPer) / 2;

    // set image size
    const height = Math.round(imgHeightPer / 100 * screen.height);
    const width = Math.round(imgWidthPer / 100 * screen.width);
    image.height = height;
    image.width = width;
    imgStyle.height = height + 'px';
    imgStyle.width = width + 'px';
    imageStyle.top = (screen.height - height) / 2 + 'px';
    imageStyle.left = (screen.width - width) / 2 + 'px';


    authorStyle.textAlign = 'right';
    locationStyle.textAlign = 'left';
    weatherStyle.textAlign = 'left';

    authorStyle.right = (right + 1) + 'vw';
    authorStyle.bottom = (bottom + 1) + 'vh';
    authorStyle.width = imgWidthPer - .5 + 'vw';

    locationStyle.left = (right + 1) + 'vw';
    locationStyle.bottom = (bottom + 1) + 'vh';
    locationStyle.width = imgWidthPer - .5 + 'vw';

    weatherStyle.left = (right + 1) + 'vw';
    weatherStyle.bottom = (bottom + 3.5) + 'vh';
    weatherStyle.width = imgWidthPer - .5 + 'vw';

    timeStyle.right = (right + 1) + 'vw';
    timeStyle.bottom = (bottom + 3.5) + 'vh';

    if (SSView.showTime()) {
      // don't wrap author
      authorStyle.textOverflow = 'ellipsis';
      authorStyle.whiteSpace = 'nowrap';
    }

    // percent of half the width of image
    const maxWidth = imgWidthPer / 2;
    if (this._hasLocationLabel()) {
      // limit author width if we also have a location
      authorStyle.maxWidth = maxWidth - 1.1 + 'vw';
    }

    if (this._hasAuthorLabel()) {
      // limit location width if we also have an author
      locationStyle.maxWidth = maxWidth - 1.1 + 'vw';
    }
  }
}

export default SSViewLetterbox;

