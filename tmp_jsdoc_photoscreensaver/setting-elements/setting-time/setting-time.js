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
 * Polymer element for selecting a time
 * @namespace SettingTime
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
    </style>


    <!--<paper-dialog id="dialog" class="paper-time-picker-dialog">-->
      <!--<paper-time-picker id="timePicker" time="[[value]]"></paper-time-picker>-->
      <!--<div class="buttons">-->
        <!--<paper-button dialog-dismiss="">{{localize('cancel')}}-->
        <!--</paper-button>-->
        <!--<paper-button dialog-confirm="" on-tap="_onTimeSelected">-->
          <!--{{localize('ok')}}-->
        <!--</paper-button>-->
      <!--</div>-->
    <!--</paper-dialog>-->

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
        <paper-ripple center=""></paper-ripple>
      </paper-item-body>
      <div class="setting-label" tabindex="0" disabled\$="[[disabled]]">[[timeLabel]]</div>
    </paper-item>
    <hr hidden\$="[[noseparator]]">
    
    <app-localstorage-document key="[[name]]" data="{{value}}" storage="window.localStorage">
    </app-localstorage-document>
`,

  is: 'setting-time',

  behaviors: [
    Chrome.LocalizeBehavior,
  ],

  properties: {
    /**
     * Local storage key
     * @memberOf SettingTime
     */
    name: {
      type: String,
      value: 'store',
    },

    /**
     * Time value '00:00' format
     * @memberOf SettingTime
     */
    value: {
      type: String,
      value: '00:00',
      observer: '_valueChanged',
    },

    /**
     * Time display label
     * @memberOf SettingTime
     */
    timeLabel: {
      type: String,
      value: '12:00 AM',
    },

    /**
     * Display format 12/24 hr
     * @memberOf SettingTime
     */
    format: {
      type: Number,
      value: 1,
      notify: true,
      observer: '_formatChanged',
    },

    /**
     * Descriptive label
     * @memberOf SettingTime
     */
    mainLabel: {
      type: String,
      value: '',
    },

    /**
     * Secondary descriptive label
     * @memberOf SettingTime
     */
    secondaryLabel: {
      type: String,
      value: '',
    },

    /**
     * Optional group title
     * @memberOf SettingTime
     */
    sectionTitle: {
      type: String,
      value: '',
    },

    /**
     * Disabled state of element
     * @memberOf SettingTime
     */
    disabled: {
      type: Boolean,
      value: false,
    },

    /**
     * Visibility state of optional divider
     * @memberOf SettingTime
     */
    noseparator: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * Event: Show dialog on tap
   * @private
   * @memberOf SettingTime
   */
  _onTap: function() {
    if (!this.disabled) {
      this.$.dialog.open();
    }
  },

  /**
   * Event: Set time on tap of OK button
   * @private
   * @memberOf SettingTime
   */
  _onTimeSelected: function() {
    const picker = this.$.timePicker;
    const hour = ('0' + picker.hour).substr(-2);
    const min = ('0' + picker.minute).substr(-2);
    const value = `${hour}:${min}`;
    this.set('value', value);
    Chrome.GA.event(Chrome.GA.EVENT.BUTTON, `SettingTime.OK: ${this.name}`);
  },

  /**
   * Observer: Value changed
   * @param {string} newValue - value we changed to
   * @private
   * @memberOf SettingTime
   */
  _valueChanged: function(newValue) {
    this._setTimeLabel(newValue);
  },

  /**
   * Observer: Global Time format changed
   * @private
   * @memberOf SettingTime
   */
  _formatChanged: function() {
    this._setTimeLabel(this.get('value'));
  },

  /**
   * Get the time suitable for display
   * @param {string} timeString - format '00:00'
   * @returns {string} formatted time
   * @private
   * @memberOf SettingTime
   */
  _formatTime: function(timeString) {
    let ret = '12:00 AM';
    if (timeString) {
      ret = Chrome.Time.getStringFull(timeString, this.format);
    } else {
      Chrome.Log.error('timeString is null', 'setting-time._formatTime');
    }
    return ret;
  },

  /**
   * Set the time display label
   * @param {string} value - time in '00:00' format
   * @private
   * @memberOf SettingTime
   */
  _setTimeLabel: function(value) {
    this.set('timeLabel', this._formatTime(value));
  },
});
