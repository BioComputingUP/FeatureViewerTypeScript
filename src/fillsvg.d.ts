import ComputingFunctions from "./helper";
declare class FillSVG extends ComputingFunctions {
    private preComputing;
    private calculate;
    private storeData;
    private hexToRgb;
    private isLight;
    private sbcRip;
    private shadeBlendConvert;
    typeIdentifier(feature: any): void;
    tagArea(object: any, thisYPosition: any): void;
    sequence(seq: any, start?: number): void;
    sequenceLine(): void;
    rectangle(object: any, position: any): void;
    unique(object: any, position: any): void;
    lollipop(object: any, position: any): void;
    circle(object: any, position: any): void;
    path(object: any, position: any): void;
    fillSVGLine(object: any, position?: number): void;
    multipleRect(object: any, position?: number, level?: any): void;
    reset_axis(): void;
    addXAxis(position: any): void;
    updateXAxis(position: any): void;
    resizeBrush(): void;
    addBrush(): void;
    showHelp(): void;
    constructor(commons: {});
}
export default FillSVG;
