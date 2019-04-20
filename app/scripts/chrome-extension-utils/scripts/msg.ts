/*
 *  Copyright (c) 2015-2019, Michael A. Updike All rights reserved.
 *  Licensed under the BSD-3-Clause
 *  https://opensource.org/licenses/BSD-3-Clause
 *  https://github.com/opus1269/screensaver/blob/master/LICENSE.md
 */

/**
 * Wrapper for chrome messages
 *
 * {@link https://developer.chrome.com/extensions/messaging}
 */

import * as ChromeGA from './analytics.js';

declare var ChromePromise: any;

/**
 * A Chrome message
 *
 * @property message - a message
 * @property error - an error message
 * @property key - key name
 * @property value - value of key
 * @property id
 * @property name
 * @property count
 */
export interface IMsgType {
  message: string;
  error?: string;
  key?: string;
  value?: any;
  id?: string;
  name?: string;
  count?: number;
}

/**
 * Chrome Messages
 *
 * @property HIGHLIGHT - highlight a tab
 * @property RESTORE_DEFAULTS - restore default settings
 * @property STORAGE_EXCEEDED - local storage save failed
 * @property STORE - save value to storage
 */
export const TYPE = {
  HIGHLIGHT: {
    message: 'highlightTab',
  } as IMsgType,
  RESTORE_DEFAULTS: {
    message: 'restoreDefaults',
  } as IMsgType,
  STORAGE_EXCEEDED: {
    message: 'storageExceeded',
  } as IMsgType,
  STORE: {
    message: 'store',
    key: '',
    value: '',
  } as IMsgType,
};

/**
 * Send a chrome message
 *
 * @param type - type of message
 * @throws An error if we failed to connect to the extension
 * @returns Something that is json
 */
export async function send(type: IMsgType) {
  const chromep = new ChromePromise();
  try {
    const response = await chromep.runtime.sendMessage(type);
    return Promise.resolve(response);
  } catch (err) {
    if (err.message && !err.message.includes('port closed') && !err.message.includes('Receiving end does not exist')) {
      const msg = `type: ${type.message}, ${err.message}`;
      ChromeGA.error(msg, 'Msg.send');
    }
    throw err;
  }
}

/**
 * Add a listener for chrome messages
 *
 * @param listener - function to receive messages
 */
export function addListener(listener: (arg0: IMsgType,
                                       arg1: chrome.runtime.MessageSender,
                                       arg2: (arg0: object) => void) => boolean) {
  chrome.runtime.onMessage.addListener(listener);
}

/**
 * Remove a listener for chrome messages
 *
 * @param listener - function to receive messages
 */
export function removeListener(listener: (arg0: IMsgType,
                                          arg1: chrome.runtime.MessageSender,
                                          arg2: (arg0: object) => void) => boolean) {
  chrome.runtime.onMessage.removeListener(listener);
}
