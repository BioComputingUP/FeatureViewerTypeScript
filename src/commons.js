"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Commons = (function () {
    function Commons() {
        this.events = {
            FEATURE_SELECTED_EVENT: "feature-viewer-position-selected",
            CLEAR_SELECTION_EVENT: "feature-viewer-clear-selection",
            FLAG_SELECTED_EVENT: "feature-viewer-flag-selected",
            FLAG_SELECTED_INTERRUPTED_EVENT: "feature-viewer-flag-interrupted-event",
            TAG_SELECTED_EVENT: "feature-viewer-button-selected",
            ZOOM_EVENT: "feature-viewer-zoom-altered",
            ANIMATIONS_FALSE_EVENT: "feature-viewer-animations-off"
        };
        this.viewerOptions = {
            showSequence: true,
            brushActive: false,
            verticalLine: false,
            dottedSequence: true,
            showHelper: false,
            flagColor: "#DFD5D3",
            tooltipColor: '#fff',
            showSubFeatures: true,
            showDisorderContentTag: false,
            showLinkTag: false,
            buttonTrack: false,
            labelTrackWidth: 0,
            tagsTrackWidth: 0,
            mobileMode: false,
            margin: {
                top: 10,
                bottom: 20,
                left: 0,
                right: 0
            },
            backup: {
                labelTrackWidth: 0,
                tagsTrackWidth: 0
            },
            width: null,
            height: null,
            zoomMax: 10,
            unit: null,
            animation: true,
            toolbar: true,
            bubbleHelp: true,
            showAxis: true,
            positionWithoutLetter: null
        };
        this.mobilesize = 951;
        this.radius = 5;
        this.flagsHeight = 18;
        this.maxNumberOfButtons = 0;
        this.features = [];
        this.yData = [];
        this.seqShift = 1;
        this.featureSelected = {};
        this.flagSelected = [];
        this.animation = true;
        this.level = 0;
        this.pathLevel = 0;
        this.step = 30;
        this.elementHeight = Math.floor(this.step / 2);
        this.YPosition = this.step;
        this.calculatedTransitions = {};
        this.d3helper = {};
        this._current_extend = null;
    }
    Object.defineProperty(Commons.prototype, "current_extend", {
        get: function () {
            var extend = this._current_extend;
            this._current_extend = null;
            return extend || {
                length: this.viewerOptions.offset.end - this.viewerOptions.offset.start,
                start: this.viewerOptions.offset.start,
                end: this.viewerOptions.offset.end
            };
        },
        set: function (current_extend) {
            this._current_extend = current_extend;
        },
        enumerable: true,
        configurable: true
    });
    ;
    return Commons;
}());
exports.default = Commons;
//# sourceMappingURL=commons.js.map