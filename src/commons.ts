import { FeatureObject, ViewerOptions, FeaturesList, FeatureData, FeatureViewerLog } from './interfaces';

// let commons: Commons;

type MyType = {};

class Commons {
    public fvLength: number;
    public events = {
        FEATURE_SELECTED_EVENT: "feature-viewer-position-selected",
        CLEAR_SELECTION_EVENT: "feature-viewer-clear-selection",
        FLAG_SELECTED_EVENT: "feature-viewer-flag-selected",
        FLAG_SELECTED_INTERRUPTED_EVENT: "feature-viewer-flag-interrupted-event",
        TAG_SELECTED_EVENT: "feature-viewer-button-selected",
        ZOOM_EVENT: "feature-viewer-zoom-altered",
        ANIMATIONS_FALSE_EVENT: "feature-viewer-animations-off"
    };
    public viewerOptions: ViewerOptions = {
        showSequence: true,
        showSequenceLabel: true,
        brushActive: false,
        verticalLine: false,
        dottedSequence: true,
        showHelper: false,
        flagColor: "#DFD5D3",
        tooltipColor: '#fff',
        showSubFeatures: true,
        sideBar: true,
        labelTrackWidth: 0,
        labelTrackWidthMobile: 0,
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
            tagsTrackWidth: 0,
            features: []
        },
        width: null,
        height: null,
        zoomMax: 10,
        unit: null,
        maxDepth: 3,
        animation: true,
        toolbar: true,
        bubbleHelp: true,
        showAxis: true,
        positionWithoutLetter: null,
        drawLadder: true,
        ladderWidth: 15,
        ladderSpacing: 10,
        ladderHeight: 18,
    };
    public mobilesize = 951;
    public radius = 5;
    public flagsHeight = 18;
    public maxNumberOfButtons = 0;
    public features: FeaturesList;
    public yData: any;
    public seqShift = 1;
    public scalingPosition: any;
    public lineYScale: any;
    public featureSelected: any;
    public flagSelected = [];
    public animation = true;
    public trigger: any;
    public level = 0;
    public svgElement: any;
    public svg: any;
    public svgContainer: any;
    public tagsContainer: any;
    public tooltipDiv: any;
    public customTooltipDiv: any;
    public divId: string;
    public right_chevron: any;
    public down_chevron: any;
    public yAxisSVG: any;
    public yAxisSVGGroup: any;
    public xAxis: any;
    public line: any;
    public lineBond: any;
    public brush: any;
    public extent: any;
    public pathLevel = 0;
    public step: number = 30; // or 20
    public elementHeight: number = Math.floor(this.step / 2); // or 1.5 if step is 20
    public YPosition: number = this.step;
    public scaling: any;
    public lineGen: any;
    public headMargin: number;
    public stringSequence : string;
    public calculatedTransitions: any={}
    public d3helper: any={};
    public style: any;
    public logger: any;
    public backgroundcolor: string;
    public currentposition: number;
    public currentzoom: number;

    private _current_extend = null;

    public get current_extend() {
        let extend = this._current_extend;
        this._current_extend = null;
        return extend || {
            length: this.viewerOptions.offset.end - this.viewerOptions.offset.start,
            start: this.viewerOptions.offset.start,
            end: this.viewerOptions.offset.end
        }
    };

    public set current_extend(current_extend) {
        this._current_extend = current_extend;
    }

    /*constructor() {
        if (!commons) {
            commons = this;
        }
        return commons
    }*/
    constructor() {
    }
}

export default Commons;
