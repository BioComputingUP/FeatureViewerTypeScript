import ComputingFunctions from './helper';
export declare class SubfeaturesTransition extends ComputingFunctions {
    area(gElement: any, newY: any): void;
    position(gElement: any, parentElementRow: any): void;
    Xaxis(axis: any, newY: any): void;
    containerH(container: any, newH: any): void;
    constructor(commons: {});
}
export declare class Transition extends ComputingFunctions {
    basalLine(object: any): void;
    rectangle(object: any): void;
    multiRec(object: any): void;
    unique(object: any): void;
    lollipop(object: any): void;
    circle(object: any): void;
    path(object: any): void;
    lineTransition(object: any): void;
    text(object: any, start: any): void;
    constructor(commons: {});
}
