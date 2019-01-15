"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var calculate_1 = require("./calculate");
var d3 = require("./custom-d3");
var Tool = (function (_super) {
    __extends(Tool, _super);
    function Tool(commons) {
        return _super.call(this, commons) || this;
    }
    Tool.prototype.colorSelectedFeat = function (feat, object, divId) {
        if (this.commons.featureSelected !== {}) {
            d3.select("#" + divId).select("#" + this.commons.featureSelected.id).style("fill-opacity", "0.6");
        }
        if (object.type !== "path" && object.type !== "curve" && feat) {
            this.commons.featureSelected = {
                "id": feat
            };
            var thisfeat = d3.select("#" + divId).select("#" + feat);
            thisfeat.style("fill-opacity", "1");
            var currentContainer = this.commons.svgContainer.node().getBoundingClientRect();
            var selectRect = void 0;
            if (d3.select("#" + divId).select(".selectionRect").node()) {
                selectRect = d3.select("#" + divId).select(".selectionRect");
            }
            else {
                selectRect = this.commons.svgContainer
                    .select(".brush")
                    .append("rect")
                    .attr("class", "selectionRect box-shadow")
                    .attr("height", currentContainer.height);
            }
            var thisy_1 = this.getTransf(thisfeat.node().parentElement)[0];
            var myd3node = thisfeat.node();
            var bcr = myd3node.getBoundingClientRect().width;
            selectRect
                .style("display", "block")
                .attr("width", bcr)
                .attr("transform", function () {
                return "translate(" + thisy_1 + ",0)";
            });
        }
    };
    ;
    Tool.prototype.updateLineTooltip = function (mouse, pD, scalingFunction, labelTrackWidth) {
        var xP = mouse - labelTrackWidth;
        var elemHover = "";
        for (var l = 1; l < pD.length; l++) {
            var scalingFirst = scalingFunction(pD[l - 1].x);
            var scalingSecond = scalingFunction(pD[l].x);
            var halfway = (scalingSecond - scalingFirst) / 2;
            if (scalingFirst + halfway < xP && scalingSecond + halfway > xP) {
                elemHover = pD[l];
                break;
            }
        }
        return elemHover;
    };
    ;
    Tool.prototype.clickTagFunction = function (d) {
        if (CustomEvent) {
            var event_1 = new CustomEvent(this.commons.events.TAG_SELECTED_EVENT, {
                detail: d
            });
            this.commons.svgElement.dispatchEvent(event_1);
        }
        else {
            console.warn("CustomEvent is not defined....");
        }
        if (this.commons.trigger)
            this.commons.trigger(this.commons.events.TAG_SELECTED_EVENT, event);
    };
    ;
    Tool.prototype.initTooltip = function (div, divId) {
        var _this = this;
        var getMessage = function (thing, type) {
            if (type === void 0) { type = 'default'; }
            var tooltip_message = '';
            if (thing.hasOwnProperty('title')) {
                tooltip_message += '<p style="margin:2px;font-weight:700;">';
                tooltip_message += thing.title;
                tooltip_message += '</p>';
            }
            else {
                if (thing.hasOwnProperty('x') || thing.hasOwnProperty('y')) {
                    tooltip_message += '<p style="margin:2px; font-weight:700;">';
                    tooltip_message += (+thing.x).toString();
                    if (+thing.y !== +thing.x) {
                        if (type == 'curve') {
                            tooltip_message += ' - ' + (+thing.y).toFixed(2).toString();
                        }
                        else if (type == 'circle') {
                        }
                        else {
                            tooltip_message += ' - ' + (+thing.y).toString();
                        }
                    }
                    tooltip_message += '</p>';
                }
                if (thing.hasOwnProperty('message')) {
                    tooltip_message += '<p style="margin:2px;font-weight:700;">';
                    tooltip_message += thing.message;
                    tooltip_message += '</p>';
                }
            }
            if (thing.hasOwnProperty('tooltip')) {
                var second_line_text = '';
                if (thing.hasOwnProperty('tooltip')) {
                    second_line_text += thing.tooltip;
                }
                if (second_line_text && second_line_text !== '' && second_line_text !== 'undefined') {
                    tooltip_message += '<p style="margin:2px; font-weight:700;">';
                    tooltip_message += second_line_text;
                    tooltip_message += '</p>';
                }
            }
            return tooltip_message;
        };
        var drawTooltip = function (tooltipDiv, absoluteMousePos) {
            tooltipDiv
                .style('top', (absoluteMousePos[1] - 55) + 'px')
                .style("display", "block")
                .style('background-color', 'grey')
                .style('color', "#fff")
                .style('width', 'auto')
                .style('max-width', '170px')
                .style("height", "auto")
                .style('cursor', 'help')
                .style('pointer-events', 'none')
                .style('borderRadius', '2px')
                .style('overflow', 'hidden')
                .style('whiteSpace', 'nowrap')
                .style('textOverflow', 'ellipsis')
                .style('padding', '8px')
                .style('font', '10px sans-serif')
                .style('text-align', 'center')
                .style('position', 'absolute')
                .style('z-index', 45)
                .style('box-shadow', '0 1px 2px 0 #656565')
                .style('fontWeight', '500');
        };
        var scalingFunction = this.commons.scaling;
        var labelTrackWidth = this.commons.viewerOptions.labelTrackWidth;
        var updateLineTooltipFunction = this.updateLineTooltip;
        this.commons.d3helper = {};
        this.commons.d3helper.flagTooltip = function () {
            var tooltipDiv = _this.commons.tooltipDiv;
            var bodyNode = d3.select(div).node();
            var tooltip = function (selection) {
                var absoluteMousePos;
                var drawMyTooltip = function (pD) {
                    absoluteMousePos = d3.mouse(bodyNode);
                    var left, top;
                    left = absoluteMousePos[0].toString();
                    top = absoluteMousePos[1].toString();
                    if ('tooltip' in pD && pD['tooltip']) {
                        tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltipDiv
                            .html(pD['tooltip'])
                            .style("left", left + 'px')
                            .style("top", top + 'px');
                    }
                    else if (_this.commons.viewerOptions.mobileMode) {
                        tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltipDiv
                            .html(pD['title'])
                            .style("left", left + 'px')
                            .style("top", top + 'px');
                    }
                };
                selection
                    .on('mouseover.tooltip', function (pD) {
                    drawMyTooltip(pD);
                })
                    .on('mousemove.tooltip', function (pD) {
                    drawMyTooltip(pD);
                })
                    .on('mouseout.tooltip', function () {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
            };
            return tooltip;
        };
        this.commons.d3helper.genericTooltip = function (message) {
            var tooltipDiv = _this.commons.tooltipDiv;
            var bodyNode = d3.select(div).node();
            var tooltip = function (selection) {
                var absoluteMousePos;
                var drawMyTooltip = function (pD) {
                    absoluteMousePos = d3.mouse(bodyNode);
                    var left, top;
                    left = absoluteMousePos[0].toString();
                    top = absoluteMousePos[1].toString();
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltipDiv
                        .html(message)
                        .style("left", left + 'px')
                        .style("top", top + 'px');
                };
                selection
                    .on('mouseover', function (pD) {
                    drawMyTooltip(pD);
                })
                    .on('mousemove', function (pD) {
                    drawMyTooltip(pD);
                })
                    .on('mouseout', function () {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
            };
            return tooltip;
        };
        this.commons.d3helper.tooltip = function (object) {
            var tooltipDiv = _this.commons.tooltipDiv;
            var viewerWidth = _this.commons.viewerOptions.width;
            var bodyNode = d3.select(div).node();
            var tooltipColor = _this.commons.viewerOptions.tooltipColor ? _this.commons.viewerOptions.tooltipColor : "#fff";
            var tooltip = function (selection) {
                var absoluteMousePos;
                var getPositions = function (absoluteMousePos) {
                    var rightSide = (absoluteMousePos[0] > viewerWidth);
                    var left = 0, top = 0;
                    if (rightSide) {
                        left = absoluteMousePos[0] + 10 - (tooltipDiv.node().getBoundingClientRect().width);
                        top = absoluteMousePos[1] - 55;
                    }
                    else {
                        left = absoluteMousePos[0] - 15;
                        top = absoluteMousePos[1] - 55;
                    }
                    var positions = {
                        left: left,
                        top: top
                    };
                    return positions;
                };
                var getMyMessage = function (pD) {
                    var tooltip_message = '';
                    if (object.type === "path") {
                        tooltip_message = getMessage(pD[0]);
                    }
                    else if (object.type === "curve") {
                        var elemHover = updateLineTooltipFunction(absoluteMousePos[0], pD, scalingFunction, labelTrackWidth);
                        tooltip_message = getMessage(elemHover, 'curve');
                    }
                    else if (object.type === "circle") {
                        tooltip_message = getMessage(pD, 'circle');
                    }
                    else if (object.type === "button") {
                        tooltip_message = getMessage(object);
                    }
                    else {
                        tooltip_message = getMessage(pD);
                    }
                    return tooltip_message;
                };
                var drawMyTooltip = function (pD) {
                    absoluteMousePos = d3.mouse(bodyNode);
                    var positions = getPositions(absoluteMousePos);
                    var tooltip_message = getMyMessage(pD);
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltipDiv
                        .html(tooltip_message)
                        .style("left", positions['left'] + 'px')
                        .style("top", positions['top'] + 'px');
                };
                selection
                    .on("mouseover", function (pD) {
                    drawMyTooltip(pD);
                })
                    .on('mousemove', function (pD) {
                    drawMyTooltip(pD);
                })
                    .on("mouseout", function (d) {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                    .on('click', function (pD) {
                    if (object.type !== "button") {
                        var xTemp = void 0;
                        var yTemp = void 0;
                        var xRect = void 0;
                        var widthRect = void 0;
                        var elemHover = void 0;
                        var forSelection = pD;
                        if (object.type === "curve") {
                            elemHover = updateLineTooltipFunction(absoluteMousePos[0], pD, scalingFunction, labelTrackWidth);
                            forSelection = elemHover;
                        }
                        ;
                        object['selectedFeature'] = forSelection;
                        var feature_detail_object = object;
                        _this.colorSelectedFeat(pD.id, object, divId);
                        if (CustomEvent) {
                            var event_2 = new CustomEvent(_this.commons.events.FEATURE_SELECTED_EVENT, {
                                detail: feature_detail_object
                            });
                            _this.commons.svgElement.dispatchEvent(event_2);
                        }
                        else {
                            console.warn("CustomEvent is not defined....");
                        }
                        if (_this.commons.trigger)
                            _this.commons.trigger(_this.commons.events.FEATURE_SELECTED_EVENT, feature_detail_object);
                    }
                    else {
                        _this.clickTagFunction(object);
                    }
                });
            };
            return tooltip;
        };
    };
    return Tool;
}(calculate_1.default));
exports.default = Tool;
//# sourceMappingURL=tooltip.js.map