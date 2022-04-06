"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureViewerLog = void 0;
class FeatureViewerLog {
    debug(msg, ...supportingDetails) {
        this.emitLogMessage("debug", msg, supportingDetails);
    }
    info(msg, ...supportingDetails) {
        this.emitLogMessage("info", msg, supportingDetails);
    }
    warn(msg, ...supportingDetails) {
        this.emitLogMessage("warn", msg, supportingDetails);
    }
    error(msg, ...supportingDetails) {
        this.emitLogMessage("error", msg, supportingDetails);
    }
    emitLogMessage(msgType, msg, supportingDetails) {
        if (supportingDetails.length > 0) {
            console[msgType](msg, supportingDetails);
        }
        else {
            console[msgType](msg);
        }
    }
}
exports.FeatureViewerLog = FeatureViewerLog;
//# sourceMappingURL=interfaces.js.map