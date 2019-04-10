/*
 *  Copyright (c) 2015-2019, Michael A. Updike All rights reserved.
 *  Licensed under the BSD-3-Clause
 *  https://opensource.org/licenses/BSD-3-Clause
 *  https://github.com/opus1269/screensaver/blob/master/LICENSE.md
 */

/**
 * Base class for other SSView classes
 * @module ss/views/view
 */

import SSPhoto from '../ss_photo.js';

import {IronImageElement} from '../../../node_modules/@polymer/iron-image/iron-image.js';
import {PolymerElement} from '../../../node_modules/@polymer/polymer/polymer-element.js';

import * as ChromeLocale from '../../../scripts/chrome-extension-utils/scripts/locales.js';
import * as ChromeStorage from '../../../scripts/chrome-extension-utils/scripts/storage.js';
import * as ChromeUtils from '../../../scripts/chrome-extension-utils/scripts/utils.js';
import '../../../scripts/chrome-extension-utils/scripts/ex_handler.js';

/**
 * Aspect ratio of screen
 */
const _SCREEN_AR = screen.width / screen.height;

/**
 * Base class for other SSView classes
 */
export default abstract class SSView {

  /**
   * Should we show the time
   * @returns true if we should show the time
   */
  public static showTime() {
    return ChromeStorage.getBool('showTime');
  }

  /**
   * Determine if a given aspect ratio should be ignored
   * @param asp - an aspect ratio
   * @param photoSizing - the sizing type
   * @returns true if the aspect ratio should be ignored
   */
  public static ignore(asp: number, photoSizing: number) {
    let ret = false;
    const skip = ChromeStorage.getBool('skip');

    if ((!asp || isNaN(asp)) ||
        (skip && ((photoSizing === 1) || (photoSizing === 3)) &&
            SSView._isBadAspect(asp))) {
      // ignore photos that don't have aspect ratio
      // or would look bad with cropped or stretched sizing options
      ret = true;
    }
    return ret;
  }

  /**
   * Call notifyPath after set because dirty checking doesn't always work
   * @param model - model to change
   * @param prop - property name
   * @param value - property value
   * @private
   */
  private static _dirtySet(model: PolymerElement, prop: string, value: any) {
    model.set(prop, value);
    model.notifyPath(prop);
  }

  /**
   * Determine if a photo would look bad zoomed or stretched at the given aspect ration
   * @param asp - an aspect ratio
   * @returns true if a photo aspect ratio differs substantially from the screens'
   * @private
   */
  private static _isBadAspect(asp: number) {
    // arbitrary
    const CUT_OFF = 0.5;
    return (asp < _SCREEN_AR - CUT_OFF) || (asp > _SCREEN_AR + CUT_OFF);
  }

  /** The photo we are viewing */
  public photo: SSPhoto;

  /** The element to render the photo */
  public image: IronImageElement;

  /** The element to render the photographers name */
  public author: HTMLDivElement;

  /** The element to render the current time */
  public time: HTMLDivElement;

  /** The element to render the location the photo was taken */
  public location: HTMLDivElement;

  /** The element to render the current weather */
  public weather: PolymerElement;

  /** The element for our instance */
  public model: PolymerElement;

  /** The url to the photo */
  public url: string;

  /** The name of the photographer */
  public authorLabel: string;

  /** The description of the location where the photo was taken */
  public locationLabel: string;

  /**
   * Create a new SSView
   * @param photo - The SSPhoto to view
   */
  protected constructor(photo: SSPhoto) {
    this.photo = photo;
    this.image = null;
    this.author = null;
    this.time = null;
    this.location = null;
    this.weather = null;
    this.model = null;
    this.url = photo.getUrl();
    this.authorLabel = '';
    this.locationLabel = '';
  }

  /**
   * Set the url
   * @param url - The url of the SSPhoto
   */
  public setUrl(url: string = null) {
    this.url = url || this.photo.getUrl();
    SSView._dirtySet(this.model, 'view.url', this.url);
  }

  /**
   * Flag the photo in this view to bad
   */
  public markPhotoBad() {
    if (this.photo) {
      this.photo.markBad();
    }
  }

  /**
   * Set the elements of the view
   * @param image - iron-image of the photo
   * @param author - div, photographer
   * @param time - div, current time
   * @param location - div, geolocation text
   * @param weather - weather-element weather
   * @param model - template item model
   */
  public setElements(image: IronImageElement, author: HTMLDivElement, time: HTMLDivElement, location: HTMLDivElement,
                     weather: PolymerElement, model: PolymerElement) {
    this.image = image;
    this.author = author;
    this.time = time;
    this.location = location;
    this.weather = weather;
    this.model = model;

    this._setTimeStyle();
    this.setPhoto(this.photo);
  }

  /**
   * Set the photo
   * @param photo - the photo to view
   */
  public setPhoto(photo: SSPhoto) {
    this.photo = photo;
    this.setUrl();
    this._setAuthorLabel();
    this._setLocationLabel();
  }

  /**
   * Render the page for display - subclasses override this to determine the look of photo
   */
  public render() {
    this.image.$.sizedImgDiv.classList.add('kenBurns');
    this.image.$.img.classList.add('kenBurns');
  }

  /**
   * Determine if a photo failed to load (usually 404 or 403 error)
   * @returns true if image load failed
   */
  public isError() {
    return !this.image || this.image.error;
  }

  /**
   * Determine if a photo has finished loading
   * @returns true if image is loaded
   */
  public isLoaded() {
    return !!this.image && this.image.loaded;
  }

  /**
   * Does a photo have an author label to show
   * @returns true if we should show the author
   */
  protected _hasAuthor() {
    const photographer = this.photo.getPhotographer();
    return !ChromeUtils.isWhiteSpace(photographer);
  }

  /**
   * Does a view have an author label set
   * @returns true if author label is not empty
   */
  protected _hasAuthorLabel() {
    return !ChromeUtils.isWhiteSpace(this.authorLabel);
  }

  /**
   * Does a photo have a geolocation
   * @returns true if geolocation point is non-null
   */
  protected _hasLocation() {
    return !!this.photo.getPoint();
  }

  /**
   * Does a view have an location label set
   * @returns true if location label is not empty
   */
  protected _hasLocationLabel() {
    return !ChromeUtils.isWhiteSpace(this.locationLabel);
  }

  /**
   * Set the style for the time label
   */
  protected _setTimeStyle() {
    if (ChromeStorage.getBool('largeTime')) {
      this.time.style.fontSize = '8.5vh';
      this.time.style.fontWeight = '300';
    }
  }

  /**
   * Set the author text
   */
  protected _setAuthorLabel() {
    this.authorLabel = '';
    SSView._dirtySet(this.model, 'view.authorLabel', this.authorLabel);

    const type = this.photo.getType();
    const photographer = this.photo.getPhotographer();
    let newType = type;
    const idx = type.search('User');

    if (!ChromeStorage.getBool('showPhotog') && (idx !== -1)) {
      // don't show label for user's own photos, if requested
      return;
    }

    if (idx !== -1) {
      // strip off 'User'
      newType = type.substring(0, idx - 1);
    }

    if (this._hasAuthor()) {
      this.authorLabel = `${photographer} / ${newType}`;
    } else {
      // no photographer name
      this.authorLabel = `${ChromeLocale.localize('photo_from')} ${newType}`;
    }
    SSView._dirtySet(this.model, 'view.authorLabel', this.authorLabel);
  }

  /**
   * Set the geolocation text
   */
  protected _setLocationLabel() {
    this.locationLabel = '';
    SSView._dirtySet(this.model, 'view.locationLabel', this.locationLabel);

    // TODO add back if we do geo location again
    // if (SSView._showLocation() && this._hasLocation()) {
    //   const point = this.photo.getPoint();
    //   Geo.get(point).then((location) => {
    //     if (location && this.model) {
    //       location = location.replace('Unnamed Road, ', '');
    //       this.locationLabel = location;
    //       SSView._dirtySet(this.model, 'view.locationLabel',
    //           this.locationLabel);
    //     }
    //     return null;
    //   }).catch((err) => {
    //     const networkErr = ChromeLocale.localize('err_network');
    //     if (!err.message.includes(networkErr)) {
    //       ChromeGA.error(`${err.message}, point: ${point}`,
    //           'SSView._setLocationLabel');
    //     }
    //   });
    // }
  }
}

