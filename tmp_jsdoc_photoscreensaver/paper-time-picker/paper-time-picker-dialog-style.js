/* eslint-disable */
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style is="custom-style">
  /* mixin definitions */
  html {
    --paper-time-picker-dialog: {
      margin: 0;
      max-height: 520px !important;
    };
    --paper-time-picker-dialog-picker: {
      margin-top: 0 !important;
      padding: 0;
    };
    --paper-time-picker-dialog-calendar: {
      padding-bottom: 0;
    };
    --paper-time-picker-dialog-heading: {
      margin-bottom: -56px;
    };
  }
  </style>
<custom-style>

<dom-module id="paper-time-picker-dialog-style">
  <template>
    <style>
      /* Application of mixins to local .paper-time-picker-dialog elements */
      .paper-time-picker-dialog {
        @apply --paper-time-picker-dialog;
      }
      .paper-time-picker-dialog > paper-time-picker {
        --paper-calendar: {
          @apply --paper-time-picker-dialog-calendar;
        };
        @apply --paper-time-picker-dialog-picker;
      }
      .paper-time-picker-dialog > paper-time-picker:not([narrow]) {
        --paper-time-picker-heading: {
          @apply --paper-time-picker-dialog-heading;
        };
      }
    </style>
  </template>
</dom-module>
</custom-style></custom-style>`;

document.head.appendChild($_documentContainer.content);
