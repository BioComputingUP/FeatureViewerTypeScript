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
var helper_1 = require("./helper");
var SubfeaturesTransition = (function (_super) {
    __extends(SubfeaturesTransition, _super);
    function SubfeaturesTransition(commons) {
        return _super.call(this, commons) || this;
    }
    SubfeaturesTransition.prototype.area = function (gElement, newY) {
        gElement
            .attr("transform", "translate(0," + newY + ")")
            .transition().duration(500);
    };
    SubfeaturesTransition.prototype.position = function (gElement, parentElementRow) {
        gElement
            .attr("position", "element(#" + parentElementRow + ")");
    };
    SubfeaturesTransition.prototype.Xaxis = function (axis, newY) {
        axis
            .attr("transform", "translate(0," + newY + ")")
            .transition().duration(500);
    };
    SubfeaturesTransition.prototype.containerH = function (container, newH) {
        container
            .attr("height", newH);
    };
    return SubfeaturesTransition;
}(helper_1.default));
exports.SubfeaturesTransition = SubfeaturesTransition;
var Transition = (function (_super) {
    __extends(Transition, _super);
    function Transition(commons) {
        return _super.call(this, commons) || this;
    }
    Transition.prototype.basalLine = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        if (object.type === "unique" || object.type === "circle") {
            container.selectAll(".line" + object.className)
                .attr("d", this.commons.line.x(function (d) {
                return _this.commons.scaling(d['x']);
            }));
        }
        else {
            container.selectAll(".line")
                .attr("d", this.commons.line);
        }
    };
    Transition.prototype.rectangle = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        var transit1, transit2;
        if (this.commons.animation) {
            transit1 = container.selectAll("." + object.className + "Group")
                .transition()
                .duration(500);
            transit2 = container.selectAll("." + object.className)
                .transition()
                .duration(500);
        }
        else {
            transit1 = container.selectAll("." + object.className + "Group");
            transit2 = container.selectAll("." + object.className);
        }
        transit1.attr("transform", function (d) {
            return "translate(" + _this.rectX(d) + ",0)";
        });
        transit2
            .attr("width", this.rectWidth2);
        container.selectAll("." + object.className + "Text")
            .attr("transform", function (d) {
            if (d.description && _this.commons.scaling(d['x']) < 0) {
                return "translate(" + -_this.rectX(d) + ",0)";
            }
        })
            .style("visibility", function (d) {
            if (d.description && _this.commons.scaling(d['x']) > 0) {
                return (_this.commons.scaling(d.y) - _this.commons.scaling(d['x'])) > d.description.length * 8 && object.height > 11 ? "visible" : "hidden";
            }
            else
                return "hidden";
        });
    };
    Transition.prototype.multiRec = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        container.selectAll("." + object.className)
            .attr("x", function (d) {
            return _this.commons.scaling(d['x']);
        })
            .attr("width", function (d) {
            return _this.commons.scaling(d.y) - _this.commons.scaling(d['x']);
        });
    };
    Transition.prototype.unique = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        var transit;
        if (this.commons.animation) {
            transit = container.selectAll(".element")
                .transition()
                .duration(500);
        }
        else {
            transit = container.selectAll(".element");
        }
        transit
            .attr("x", function (d) {
            return _this.commons.scaling(d['x'] - 0.4);
        })
            .attr("width", function (d) {
            if (_this.commons.scaling(d['x'] + 0.4) - _this.commons.scaling(d['x'] - 0.4) < 2)
                return 2;
            else
                return _this.commons.scaling(d['x'] + 0.4) - _this.commons.scaling(d['x'] - 0.4);
        });
    };
    Transition.prototype.circle = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        var transit;
        if (this.commons.animation) {
            transit = container.selectAll(".element")
                .transition()
                .duration(500);
        }
        else {
            transit = container.selectAll(".element");
        }
        transit
            .attr("cx", function (d) {
            return _this.commons.scaling(d['x']);
        })
            .attr("width", function (d) {
            if (_this.commons.scaling(d['x'] + 0.4) - _this.commons.scaling(d['x'] - 0.4) < 2)
                return 2;
            else
                return _this.commons.scaling(d['x'] + 0.4) - _this.commons.scaling(d['x'] - 0.4);
        });
    };
    Transition.prototype.path = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        container.selectAll(".line" + object.className)
            .attr("d", this.commons.lineBond.x(function (d) {
            return _this.commons.scaling(d['x']);
        })
            .y(function (d) {
            return -d.y * 10 + object.height;
        }));
        var transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + object.className)
                .transition()
                .duration(0);
        }
        else {
            transit = container.selectAll("." + object.className);
        }
        transit
            .attr("d", this.commons.lineBond.y(function (d) {
            return -d.y * 10 + object.height;
        }));
    };
    Transition.prototype.lineTransition = function (object) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        this.commons.lineYScale.range([0, -(object.height)]).domain([0, -(object.level)]);
        container.selectAll(".line " + object.className)
            .attr("d", function (d) {
            return _this.commons.lineYScale(-d.y) * 10 + object.shift;
        });
        var transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + object.className)
                .transition()
                .duration(0);
        }
        else {
            transit = container.selectAll("." + object.className);
        }
        transit
            .attr("d", this.commons.lineGen.y(function (d) {
            return _this.commons.lineYScale(-d.y) * 10 + object.shift;
        }));
    };
    Transition.prototype.text = function (object, start) {
        var _this = this;
        var container = this.commons.svgContainer.select("#c" + object.dom_id + "_container");
        var transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + object.className)
                .transition()
                .duration(500);
        }
        else {
            transit = container.selectAll("." + object.className);
        }
        transit
            .attr("x", function (d, i) {
            return _this.commons.scaling(i + start);
        });
    };
    return Transition;
}(helper_1.default));
exports.Transition = Transition;
;
//# sourceMappingURL=transition.js.map