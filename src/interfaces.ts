
export interface UserOptions {
  offset?: {
    start: number,
    end: number
  },
  breakpoint?: number,
  showAxis?: boolean,
  showSequence?: boolean,
  showSequenceLabel?: boolean,
  brushActive?: boolean,
  toolbar?: boolean,
  toolbarPosition?: string,
  zoomMax?: number,
  showSubFeatures?: boolean,
  flagColor?: string,
  flagTrack?: number | string | boolean,
  flagTrackMobile?: number | string | boolean,
  sideBar?: number | string | boolean,
  animation?: boolean,
  unit?: string,
  backgroundcolor?: string,
  maxDepth?: number
}

export interface ViewerOptions {
  showSequence: boolean,
  showSequenceLabel?: boolean,
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
  showSubFeatures: boolean,
  sideBar: boolean,
  labelTrackWidth: number,
  labelTrackWidthMobile: number,
  tagsTrackWidth: number,
  maxDepth?: number,
  margin: {
    top: number,
    bottom: number,
    left: number,
    right: number
  },
  backup: {
    labelTrackWidth: number,
    tagsTrackWidth: number,
    features: any
  },
  width: number,
  height: number,
  zoomMax: number,
  mobileMode: boolean,
  unit: string,
  animation: boolean,
  toolbar: boolean,
  toolbarPosition?: string,
  bubbleHelp: boolean,
  showAxis: boolean,
  positionWithoutLetter: number,
  drawLadder: boolean,
  ladderWidth: number,
  ladderHeight: number,
  ladderSpacing: number,
  labelSidebarWidth?: number
}

export interface FeaturesList extends Array<FeatureObject>{}

export interface FeatureObject {
  id: string,
  type: string // "rect" | "path" | "curve" | "unique" | "circle" | "sequence" | "lollipop",
  data: Array<FeatureData> | string,
  parentId?: any,
  label?: string,
  className?: string,
  height?: number,
  yLim?: number,
  color?: string,
  stroke?: string,
  opacity?: number,
  tooltip?: string,
  sidebar?: Array<SideBarObject>,
  isOpen?: boolean,
  flagLevel?: number,
  subfeatures?: Array<FeatureObject>
}

export interface FeatureData {
  x: number,
  y?: any,
  label?: string,
  className?: string,
  color?: string,
  stroke?: string,
  opacity?: number,
  tooltip?: string
}

export interface SideBarObject {
  id: string,
  tooltip?: string, // or html
  content?: string,
  type?: string,
  width?: number,
  label?: string | number
}

export interface FeatureViewerLogger {
  debug(primaryMessage: string, ...supportingData: any[]): void;
  warn(primaryMessage: string, ...supportingData: any[]): void;
  error(primaryMessage: string, ...supportingData: any[]): void;
  info(primaryMessage: string, ...supportingData: any[]): void;
}

export class FeatureViewerLog implements FeatureViewerLogger {

  public debug(msg: string, ...supportingDetails): void {
    this.emitLogMessage("debug", msg, supportingDetails)
  }

  public info(msg: string, ...supportingDetails): void {
    this.emitLogMessage("info", msg, supportingDetails)
  }

  public warn(msg: string, ...supportingDetails): void {
    this.emitLogMessage("warn", msg, supportingDetails)
  }

  public error(msg: string, ...supportingDetails): void {
    this.emitLogMessage("error", msg, supportingDetails)
  }

  private emitLogMessage(msgType:"debug"|"info"|"warn"|"error", msg:string, supportingDetails:any[]){
    if(supportingDetails.length > 0) {
      console[msgType](msg, supportingDetails);
    } else {
      console[msgType](msg);
    }
  }
}
