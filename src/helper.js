"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_selection_1 = require("d3-selection");
var ComputingFunctions = (function () {
    function ComputingFunctions(commons) {
        var _this = this;
        this.rectWidth2 = function (d) {
            return (_this.commons.scaling([d.y + 0.4]) - _this.commons.scaling([d.x - 0.4]));
        };
        this.rectX = function (object) {
            var scale = _this.commons.scaling([object.x - 0.4]);
            return scale;
        };
        this.commons = commons;
    }
    ComputingFunctions.prototype.displaySequence = function (seq) {
        return this.commons.viewerOptions.width / seq > 5;
    };
    ComputingFunctions.prototype.gradientColor = function (stringContent) {
        var percent = Number(stringContent);
        var hue;
        if (percent === 0) {
            hue = 'white';
        }
        else if (percent > 0 && percent <= 15) {
            hue = 'lightgreen';
        }
        else if (percent > 15 && percent < 50) {
            hue = 'yellow';
        }
        else if (percent >= 50 && percent < 100) {
            hue = 'red';
        }
        else if (percent === 100) {
            hue = 'black';
        }
        return hue;
    };
    ;
    ComputingFunctions.prototype.forcePropagation = function (item) {
        item.on('mousedown', function () {
            var new_click_event = new Event('mousedown');
            new_click_event['pageX'] = d3_selection_1.event.layerX;
            new_click_event['clientX'] = d3_selection_1.event.clientX;
            new_click_event['pageY'] = d3_selection_1.event.layerY;
            new_click_event['clientY'] = d3_selection_1.event.clientY;
        });
    };
    return ComputingFunctions;
}());
exports.default = ComputingFunctions;
//# sourceMappingURL=helper.js.map