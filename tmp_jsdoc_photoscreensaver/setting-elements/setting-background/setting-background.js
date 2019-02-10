/*
 * Copyright (c) 2016-2017, Michael A. Updike All rights reserved.
 * Licensed under Apache 2.0
 * https://opensource.org/licenses/Apache-2.0
 * https://github.com/opus1269/chrome-extension-utils/blob/master/LICENSE.md
 */
import '/node_modules/@polymer/polymer/polymer-legacy.js';
import '/node_modules/@polymer/paper-styles/typography.js';
import '/node_modules/@polymer/paper-styles/color.js';
import '/node_modules/@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '/node_modules/@polymer/app-storage/app-localstorage/app-localstorage-document.js';
import '/node_modules/@polymer/iron-selector/iron-selector.js';
import '/node_modules/@polymer/paper-item/paper-item.js';
import '/node_modules/@polymer/paper-item/paper-item-body.js';
import '/node_modules/@polymer/paper-ripple/paper-ripple.js';
import '/node_modules/@polymer/paper-dialog/paper-dialog.js';
import '/node_modules/@polymer/paper-button/paper-button.js';
import '/elements/setting-elements/localize-behavior/localize-behavior.js';
import { Polymer } from '/node_modules/@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '/node_modules/@polymer/polymer/lib/utils/html-tag.js';

import '/scripts/chrome-extension-utils/scripts/ex_handler.js';

/**
 * Polymer element to select an HTML element background style
 * @namespace SettingBackground
 */
Polymer({
  _template: html`
    <style include="iron-flex iron-flex-alignment"></style>
    <style include="shared-styles"></style>
    <style>
      :host {
        display: block;
        position: relative;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      :host paper-item {
        display: block;
        position: relative;
        cursor: pointer;
      }

      :host([indent]) paper-item {
        padding-left: 24px;
      }

      :host .container {
        width: 640px;
      }

      :host .background {
        width: 200px;
        height: 112px;
        border: 2px solid white;
      }

      :host .iron-selected {
        border: 2px solid red;
      }

      :host .selected-background {
        width: 100px;
        height: 56px;
      }

      .selected-background[disabled] {
        opacity: .2;
      }
    </style>

    <paper-dialog id="dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
      <h2>{{localize('setting_bg_dialog_title')}}</h2>
      <iron-selector class="container horizontal layout wrap" attr-for-selected="id" selected="{{selected}}">
        <div id="b1" class="background" style="background:linear-gradient(to bottom, #3a3a3a, #b5bdc8);"></div>
        <div id="b2" class="background" style="background:linear-gradient(to bottom, #003973 10%, #E5E5BE 90%);"></div>
        <div id="b3" class="background" style="background:linear-gradient(to top, #649173 10%, #DBD5A4 90%);"></div>
        <div id="b4" class="background" style="background:radial-gradient(ellipse at center, #ebe9f9 0%, #ebe9f9 23%, #d8d0ef 50%, #cec7ec 51%, #ebe9f9 77%, #c1bfea 100%);"></div>
        <div id="b5" class="background" style="background:radial-gradient(ellipse farthest-corner at 0px 0px , #fd5c6e 0%, rgba(0, 0, 255, 0) 50%, #0ce4e1 95%);"></div>
        <div id="b6" class="background" style="background:black;"></div>
      </iron-selector>
      <div class="buttons">
        <paper-button dialog-dismiss="">{{localize('cancel')}}</paper-button>
        <paper-button dialog-confirm="" autofocus="" on-tap="_onOK">
          {{localize('ok')}}
        </paper-button>
      </div>
    </paper-dialog>

    <div class="section-title setting-label" tabindex="-1" hidden\$="[[!sectionTitle]]">
      {{sectionTitle}}
    </div>

    <paper-item class="center horizontal layout" tabindex="-1" on-tap="_onTap">
      <paper-item-body class="flex" two-line="">
        <div class="setting-label" hidden\$="[[!mainLabel]]">
          {{mainLabel}}
        </div>
        <div class="setting-label" secondary="" hidden\$="[[!secondaryLabel]]">
          {{secondaryLabel}}
        </div>
      </paper-item-body>
      <div class="selected-background" style\$="[[value]]" tabindex="0" disabled\$="[[disabled]]"></div>
      <paper-ripple center=""></paper-ripple>
    </paper-item>
    <hr hidden\$="[[noseparator]]">

    <app-localstorage-document key="[[name]]" data="{{value}}" storage="window.localStorage">
    </app-localstorage-document>
`,

  is: 'setting-background',

  behaviors: [
    Chrome.LocalizeBehavior,
  ],

  properties: {
    /**
     * Local storage key
     * @memberOf SettingBackground
     */
    name: {
      type: String,
      value: 'store',
    },

    /**
     * Optional group title
     * @memberOf SettingBackground
     */
    sectionTitle: {
      type: String,
      value: '',
    },

    /**
     * Disabled state of element
     * @memberOf SettingBackground
     */
    disabled: {
      type: Boolean,
      value: false,
    },

    /**
     * Visibility state of optional divider
     * @memberOf SettingBackground
     */
    noseparator: {
      type: Boolean,
      value: false,
    },

    /**
     * Element id of currently selected background style
     * @type {string}
     * @memberOf SettingBackground
     */
    selected: {
      type: String,
      value: 'b1',
      notify: true,
    },

    /**
     * Local storage value of currently selected background style
     * @memberOf SettingBackground
     */
    value: {
      type: String,
      value: 'background:linear-gradient(to bottom, #3a3a3a, #b5bdc8)',
      notify: true,
    },

    /**
     * Item description
     * @memberOf SettingBackground
     */
    mainLabel: {
      type: String,
      value: '',
    },

    /**
     * Item secondary description
     * @memberOf SettingBackground
     */
    secondaryLabel: {
      type: String,
      value: '',
    },
  },

  /**
   * Event: Show dialog on tap
   * @private
   * @memberOf SettingBackground
   */
  _onTap: function() {
    this.$.dialog.open();
  },

  /**
   * Event: Set selected background on tap of OK button
   * @private
   * @memberOf SettingBackground
   */
  _onOK: function() {
    const el = this.shadowRoot.getElementById(this.selected);
    this.set('value', 'background:' + el.style.background);
    Chrome.GA.event(Chrome.GA.EVENT.BUTTON,
        `SettingBackground.OK: ${this.selected}`);
  },
});
