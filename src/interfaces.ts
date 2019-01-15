export interface UserOptions {
    offset?: {
        start: number,
        end: number
    },
    showAxis?: boolean,
    showSequence?: boolean,
    brushActive?: boolean,
    bubbleHelp?: boolean,
    zoomMax?: number,
    showSubFeatures?: boolean,
    flagColor?: string,
    flagTrack?: number | string | boolean,
    showLinkTag?: boolean,
    showDisorderContentTag?: boolean,
    buttonTrack?: number | string | boolean,
    animation?: boolean,
    unit?: string
}

export interface ViewerOptions {
    showSequence: boolean,
    brushActive: boolean,
    verticalLine: boolean,
    dottedSequence: boolean,
    offset?: {
        start: number,
        end: number
    },
    tooltipColor: string,
    showHelper: boolean,
    flagColor: string,
    showSubFeatures: boolean;
    showDisorderContentTag: boolean;
    showLinkTag: boolean;
    buttonTrack: boolean;
    labelTrackWidth: number;
    tagsTrackWidth: number;
    margin: {
        top: number,
        bottom: number,
        left: number,
        right: number
    },
    backup: {
        labelTrackWidth: number,
        tagsTrackWidth: number
    },
    width: number,
    height: number,
    zoomMax: number,
    mobileMode: boolean,
    unit: string,
    animation: boolean,
    toolbar: boolean,
    bubbleHelp: boolean,
    showAxis: boolean,
    positionWithoutLetter: number
}

export interface FeaturesList extends Array<FeatureObject>{}

export interface FeatureObject {
    featureId: any,
    type: "rect" | "path" | "curve" | "unique" | "circle" | "sequence",
    data: Array<FeatureData> | string,
    parentId?: string,
    label?: string,
    className?: string,
    height?: number,
    yLim?: number,
    color?: string,
    stroke?: string,
    opacity?: number,
    tooltip?: string
    sidebar?: Array<SideBarObject>
}

export interface FeatureData {
    x: number,
    y: any,
    className?: string,
    color?: string,
    stroke?: string,
    opacity?: number,
    tooltip?: string
}

export interface SideBarObject {
    buttonId: string,
    tooltip?: string,
    htmlContent?: string,
    type?: "button" | "link" | "percentage"
}

