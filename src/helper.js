"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const d3_selection_1 = require("d3-selection");
class ComputingFunctions {
    constructor(commons) {
        this.rectWidth2 = (d) => {
            return (this.commons.scaling([d.y + 0.4]) - this.commons.scaling([d.x - 0.4]));
        };
        this.rectX = (object) => {
            let scale = this.commons.scaling([object.x - 0.4]);
            return scale;
        };
        this.arrowPath = (d) => {
            let h = this.commons.elementHeight;
            let w = this.rectWidth2(d);
            if (w <= h / 2) {
                return `m0 0 h${w} v${h} h${-w}z`;
            }
            if (d.direction === "left") {
                return `m${w} 0 h${-w + h / 2} l${-h / 2} ${h / 2} l${h / 2} ${h / 2} h${w - h / 2} z`;
            }
            else {
                return `m0 0 h${w - h / 2} l${h / 2} ${h / 2} l${-h / 2} ${h / 2} h${-w + h / 2} z`;
            }
        };
        this.commons = commons;
    }
    displaySequence(seq) {
        return this.commons.viewerOptions.width / seq > 5;
    }
    gradientColor(stringContent) {
        let percent = Number(stringContent);
        let hue;
        if (percent === 0) {
            hue = '#ffffff';
        }
        else if (percent > 0 && percent <= 15) {
            hue = '#d2d2f8';
        }
        else if (percent > 15 && percent < 50) {
            hue = '#a6a6f1';
        }
        else if (percent >= 50 && percent < 100) {
            hue = '#7a7aeb';
        }
        else if (percent === 100) {
            hue = '#4e4ee4';
        }
        return hue;
    }
    ;
    forcePropagation(item) {
        item.on('mousedown', () => {
            let new_click_event = new Event('mousedown');
            new_click_event['pageX'] = d3_selection_1.event.layerX;
            new_click_event['clientX'] = d3_selection_1.event.clientX;
            new_click_event['pageY'] = d3_selection_1.event.layerY;
            new_click_event['clientY'] = d3_selection_1.event.clientY;
        });
    }
}
exports.default = ComputingFunctions;
//# sourceMappingURL=helper.js.map