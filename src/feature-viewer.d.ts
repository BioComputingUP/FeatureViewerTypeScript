import { FeaturesList, UserOptions } from './interfaces';
declare class FeatureViewer {
    private commons;
    private divId;
    private sequence;
    private transition;
    private subfeaturesTransition;
    private fillSVG;
    private calculate;
    private tool;
    private lastHighlight;
    private lastLen;
    private parseUserOptions;
    private addYAxis;
    private updateYAxis;
    private applyLastHighlight;
    private brushend;
    private resizeForMobile;
    private calcFlagWidth;
    private updateWindow;
    private transition_data;
    private init;
    private addFeatureCore;
    private drawFeatures;
    private recursivelyRemove;
    private recursiveClose;
    private changeFeature;
    private resetTooltip;
    /*** PUBLIC FUNCTIONS ***/
    getCurrentPosition(): number;
    getCurrentZoom(): number;
    showHelp(): void;
    resetHighlight(resetLastHighlight?: boolean): void;
    resetZoom(): void;
    resetAll(): void;
    downloadSvg(): void;
    clickFlag(d: any): void;
    emptyFeatures(): any;
    flagLoading(id: any): void;
    highlightRegion(region: any, featureid: any): void;
    highlightPosition(region: any, reset?: boolean): void;
    highlightPositions(regions: any): void;
    private recursiveClick;
    collapseAll(): void;
    expandAll(): void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onRegionSelected
     * @return {object} Object describing the selected feature */
    onRegionSelected(listener: any): void;
    removeResizeListener(): void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onFeatureSelected
     * @description Expected usage: once flag is selected, addSubFeature()
     * @return {object} Object describing the selected flag */
    onFeatureSelected(listener: any): void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onButtonSelected
     * @return {object} Object describing the selected 3D button */
    onButtonSelected(listener: any): void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onZoom
     * @return {object} Object describing the zoom event */
    onZoom(listener: any): void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onClearSelection
     * @return {object} Object describing the zoom out/clear selection event */
    onClearSelection(listener: any): void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onAnimationOff
     * @return {object} Object describing the zoom out/clear selection event */
    onAnimationOff(listener: any): void;
    stopFlagLoading: (id: any) => void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name resizeViewer
     * @description resizes viewer if element dimensions are changed. Please note: resizing is automatic when window changes, call this function when other elements change
     */
    resizeViewer: () => void;
    /**
     * @function
     * @methodOf FeatureViewer
     * @name addFeature
     * @param {object} object - The input feature
     * @param {number} flagLevel - The indent level for rendering flag
     * @property {Array<object>} feature.data
     * @property {int} feature.data.<Object>.x - first position
     * @property {int} feature.data.<Object>.y - last position (or a value for features of type "curve")
     * @property {string} [feature.data.<Object>.id] - id
     * @property {string} [feature.data.<Object>.description] - description
     * @property {string} [feature.data.<Object>.color] - color
     * @property {string} [feature.data.<Object>.tooltip] - message for the region tooltip
     * @property {string} feature.type -  ("rect","curve","unique","circle") : The type of feature, for a specific rendering
     * @property {string} [feature.name] - The name of theses features, which will be display as a label on the Y-axis
     * @property {string} [feature.className] - a class name, for further personal computing
     * @property {int} [feature.height] - height of the feature
     * @property {string} [feature.color] - The color of the features
     * @property {boolean} [feature.hasSubFeatures] - determines if object is clickable and expands for subFeature visualization
     * @property {string} [feature.filter] - a class filter, for further personal computing
     * @property {number} [feature.disorderContent] - content of disorder content tag (right side of viewer)
     * @property {number} [feature.tooltip] - message for the flag tooltip
     * @property {Array<object>} [feature.links]
     * @property {string} [feature.links.<Object>.name] - The button name, used to identify click event
     * @property {string} [feature.links.<Object>.icon]  - Glyphicon code or text, specify glyphicon in unicode format, ex. \ue030
     * @property {string} [feature.links.<Object>.message] - The message for tooltip
     * @property {string} [feature.links.<Object>.color] - Optional color for the visualized glyphicon
     */
    private addFeature;
    addFeatures(featureList: FeaturesList): void;
    private getLevel;
    constructor(sequence: string, div: string, options?: UserOptions, features?: FeaturesList);
}
export { FeatureViewer };
