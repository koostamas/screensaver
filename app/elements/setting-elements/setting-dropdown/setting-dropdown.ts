/*
 *  Copyright (c) 2015-2019, Michael A. Updike All rights reserved.
 *  Licensed under the BSD-3-Clause
 *  https://opensource.org/licenses/BSD-3-Clause
 *  https://github.com/opus1269/screensaver/blob/master/LICENSE.md
 */
import '../../../node_modules/@polymer/polymer/polymer-legacy.js';
import {Polymer} from '../../../node_modules/@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

import '../../../node_modules/@polymer/paper-styles/typography.js';
import '../../../node_modules/@polymer/paper-styles/color.js';

import '../../../node_modules/@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../node_modules/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';

import '../../../node_modules/@polymer/app-storage/app-localstorage/app-localstorage-document.js';

import * as ChromeGA
  from '../../../scripts/chrome-extension-utils/scripts/analytics.js';
import '../../../scripts/chrome-extension-utils/scripts/ex_handler.js';

/**
 * Module for the SettingDropdown
 * @module els/setting/dropdown
 */

/**
 * Polymer element to select an item from a list
 * @type {{}}
 * @alias module:els/setting/dropdown.SettingDropdown
 * @PolymerElement
 */
const SettingDropdown = Polymer({
  // language=HTML format=false
  _template: html`<style include="iron-flex iron-flex-alignment"></style>
<style include="shared-styles"></style>
<style>
  :host {
    display: block;
  }

  :host([disabled]) {
    pointer-events: none;
  }


  :host([indent]) .setting-label {
    padding-left: 8px;
  }
  
  :host > paper-item {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  :host paper-dropdown-menu {
    width: 175px;

    --paper-input-container-input: {
      text-align: right;
    };
  }
</style>

<div class="section-title setting-label" tabindex="-1" hidden$="[[!sectionTitle]]">
  [[sectionTitle]]
</div>

<paper-item class="center horizontal layout" tabindex="-1">
  <div class="setting-label flex">[[label]]</div>
  <paper-dropdown-menu disabled$="[[disabled]]" noink="" no-label-float="">
    <paper-listbox slot="dropdown-content" on-tap="_onItemSelected" selected="{{value}}">
      <template id="t" is="dom-repeat" items="[[items]]">
        <paper-item>[[item]]</paper-item>
      </template>
    </paper-listbox>
  </paper-dropdown-menu>
</paper-item>
<hr hidden$="[[noseparator]]">

<app-localstorage-document key="[[name]]" data="{{value}}" storage="window.localStorage">
</app-localstorage-document>
`,

  is: 'setting-dropdown',

  properties: {
    /** Local storage key */
    name: {
      type: String,
      value: 'store',
    },

    /** Menu description */
    label: {
      type: String,
      value: '',
    },

    /** Selected menu item index */
    value: {
      type: Number,
      value: 0,
      notify: true,
    },

    /** Array of Menu item labels */
    items: {
      type: Array,
      value: function() : string[] {
        return [];
      },
    },

    /** Optional group title */
    sectionTitle: {
      type: String,
      value: '',
    },

    /** Disabled state of element */
    disabled: {
      type: Boolean,
      value: false,
    },

    /** Visibility state of optional divider */
    noseparator: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * Event: menu item tapped
   * @param {Event} ev - tap event
   * @private
   */
  _onItemSelected: function(ev: Event) {
    const model = this.$.t.modelForElement(ev.target);
    if (model) {
      ChromeGA.event(ChromeGA.EVENT.MENU,
          `${this.name}: ${model.index}`);
    }
  },
});

export default SettingDropdown;
