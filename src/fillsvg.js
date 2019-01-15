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
var calculate_1 = require("./calculate");
var d3 = require("./custom-d3");
var PreComputing = (function () {
    function PreComputing(commons) {
        this.commons = commons;
        this.calculate = new calculate_1.default(commons);
    }
    PreComputing.prototype.path = function (object) {
        var height;
        if (object.height) {
            height = object.height;
        }
        else {
            height = 3;
        }
        object.data.sort(function (a, b) {
            return a.x - b.x;
        });
        this.commons.level = this.calculate.addNLines(object.data);
        object.data = object.data.map(function (d) {
            return [{
                    x: d.x,
                    y: 0,
                    id: d.id,
                    description: d.description || '',
                    tooltip: d.tooltip || '',
                    color: d.color,
                    stroke: d.stroke,
                    opacity: d.opacity
                }, {
                    x: d.y,
                    y: d.level + 1,
                    id: d.id
                }, {
                    x: d.y,
                    y: 0,
                    id: d.id
                }];
        });
        object.pathLevel = (this.commons.level * height) / 2 + 5;
        this.commons.pathLevel = this.commons.level * height + 5;
        object.height = this.commons.level * height + 5;
    };
    ;
    PreComputing.prototype.preComputingLine = function (object) {
        if (!object.height) {
            object.height = 10;
        }
        ;
        var shift = parseInt(object.height);
        var level = 0;
        var _loop_1 = function (i) {
            object.data[i].sort(function (a, b) {
                return a.x - b.x;
            });
            if (object.data[i][0].y !== 0) {
                object.data[i].unshift({
                    x: object.data[i][0].x - 1,
                    y: 0
                });
            }
            if (object.data[i][object.data[i].length - 1].y !== 0) {
                object.data[i].push({
                    x: object.data[i][object.data[i].length - 1].x + 1,
                    y: 0
                });
            }
            var maxValue = Math.max.apply(Math, object.data[i].map(function (o) {
                return 1;
            }));
            if ('yMax' in object) {
                maxValue = object['yMax'];
            }
            level = maxValue > level ? maxValue : level;
            object.data[i] = [object.data[i].map(function (d) {
                    var yValue = d.y;
                    if (d.y > maxValue) {
                        yValue = maxValue;
                    }
                    return {
                        x: d.x,
                        y: yValue,
                        id: d.id,
                        description: d.description || '',
                        tooltip: d.tooltip || ''
                    };
                })
            ];
        };
        for (var i in object.data) {
            _loop_1(i);
        }
        this.commons.lineYScale.range([0, -(shift)]).domain([0, -(level)]);
        object.pathLevel = shift * 10 + 5;
        object.level = level;
        object.shift = shift * 10 + 5;
    };
    ;
    PreComputing.prototype.multipleRect = function (object) {
        object.data.sort(function (a, b) {
            return a.x - b.x;
        });
        object.level = this.calculate.addNLines(object.data);
        object.pathLevel = this.commons.level * 10 + 5;
        this.commons.level = object.level;
        this.commons.pathLevel = object.pathLevel;
    };
    ;
    return PreComputing;
}());
var FillSVG = (function (_super) {
    __extends(FillSVG, _super);
    function FillSVG(commons) {
        var _this = _super.call(this, commons) || this;
        _this.preComputing = new PreComputing(commons);
        return _this;
    }
    FillSVG.prototype.sbcRip = function (d, i, r) {
        var l = d.length, RGB = {};
        if (l > 9) {
            d = d.split(",");
            if (d.length < 3 || d.length > 4)
                return null;
            RGB[0] = i(d[0].slice(4));
            RGB[1] = i(d[1]);
            RGB[2] = i(d[2]);
            RGB[3] = d[3] ? parseFloat(d[3]) : -1;
        }
        else {
            if (l === 8 || l === 6 || l < 4)
                return null;
            if (l < 6)
                d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? d[4] + "" + d[4] : "");
            d = i(d.slice(1), 16);
            RGB[0] = d >> 16 & 255;
            RGB[1] = d >> 8 & 255;
            RGB[2] = d & 255;
            RGB[3] = l === 9 || l === 5 ? r(((d >> 24 & 255) / 255) * 10000) / 10000 : -1;
        }
        return RGB;
    };
    ;
    FillSVG.prototype.shadeBlendConvert = function (p, from, to) {
        if (from === void 0) { from = "#000"; }
        if (to === void 0) { to = null; }
        if (typeof (p) !== "number" ||
            p < -1 ||
            p > 1 ||
            typeof (from) !== "string" ||
            (from[0] !== 'r' && from[0] !== '#') ||
            (typeof (to) !== "string" && typeof (to) !== "undefined"))
            return null;
        var i = parseInt;
        var r = Math.round;
        var h = from.length > 9;
        h = typeof (to) === "string" ? to.length > 9 ? true : to === "c" ? !h : false : h;
        var b = p < 0;
        p = b ? p * -1 : p;
        to = to && to !== "c" ? to : b ? "#000000" : "#FFFFFF";
        var f = this.sbcRip(from, i, r);
        var t = this.sbcRip(to, i, r);
        if (!f || !t)
            return null;
        if (h)
            return "rgb(" + r((t[0] - f[0]) * p + f[0]) + "," + r((t[1] - f[1]) * p + f[1]) + "," + r((t[2] - f[2]) * p + f[2]) + (f[3] < 0 && t[3] < 0 ? ")" : "," + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 10000) / 10000 : t[3] < 0 ? f[3] : t[3]) + ")");
        else
            return "#" + (0x100000000 + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 255) : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255) * 0x1000000 + r((t[0] - f[0]) * p + f[0]) * 0x10000 + r((t[1] - f[1]) * p + f[1]) * 0x100 + r((t[2] - f[2]) * p + f[2])).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3);
    };
    FillSVG.prototype.typeIdentifier = function (object) {
        this.tagArea(object);
        var thisYPosition;
        if (object.type === "curve") {
            if (!object.height) {
                object.height = 10;
            }
            ;
            var shift = parseInt(object.height);
            thisYPosition = this.commons.YPosition + shift * 10 - 4;
        }
        else {
            thisYPosition = this.commons.YPosition;
        }
        this.commons.yData.push({
            hasSubFeatures: object.hasSubFeatures,
            tooltip: object.tooltip,
            title: object.name,
            dom_id: object.dom_id,
            y: thisYPosition,
            filter: object.filter,
            flagColor: object.flagColor,
            flagLevel: object.flagLevel
        });
        if (object.type === "rect") {
            this.preComputing.multipleRect(object);
            this.rectangle(object, this.commons.YPosition);
        }
        else if (object.type === "text") {
            this.commons.scaling.range([5, this.commons.viewerOptions.width - 5]);
            var seq = this.displaySequence(this.commons.current_extend.length);
            if (seq === false) {
                this.sequenceLine();
            }
            else if (seq === true) {
                this.sequence(object.data, this.commons.YPosition);
            }
        }
        else if (object.type === "unique") {
            this.unique(object, this.commons.YPosition);
            this.commons.YPosition += 5;
        }
        else if (object.type === "circle") {
            this.circle(object, this.commons.YPosition);
            this.commons.YPosition += 5;
        }
        else if (object.type === "multipleRect") {
            this.preComputing.multipleRect(object);
            this.multipleRect(object, this.commons.YPosition, this.commons.level);
            this.commons.YPosition += (this.commons.level - 1) * 10;
        }
        else if (object.type === "path") {
            this.storeData = object.data;
            this.preComputing.path(object);
            this.path(object, this.commons.YPosition);
            object.data = this.storeData;
            this.commons.YPosition += this.commons.pathLevel;
        }
        else if (object.type === "curve") {
            this.storeData = object.data;
            if (!(Array.isArray(object.data[0])))
                object.data = [object.data];
            if (!(Array.isArray(object.color)))
                object.color = [object.color];
            var negativeNumbers_1 = false;
            object.data.forEach(function (d) {
                if (d.filter(function (l) {
                    return l.y < 0;
                }).length)
                    negativeNumbers_1 = true;
            });
            this.preComputing.preComputingLine(object);
            this.fillSVGLine(object, this.commons.YPosition);
            object.data = this.storeData;
            this.commons.YPosition += object.pathLevel;
            this.commons.YPosition += negativeNumbers_1 ? object.pathLevel - 5 : 0;
        }
    };
    FillSVG.prototype.tagArea = function (object) {
        var thisYPosition;
        if (object.type === "curve" || object.type === "path") {
            if (!object.height) {
                object.height = 10;
            }
            ;
            var shift = parseInt(object.height);
            thisYPosition = this.commons.YPosition + shift * 10 - 4;
        }
        else {
            thisYPosition = this.commons.YPosition;
        }
        var id = 't' + object.dom_id + "_tagarea";
        this.commons.tagsContainer.append("g")
            .attr("class", "tagGroup")
            .attr("id", id)
            .attr("transform", "translate(0," + thisYPosition + ")");
        if (object.disorderContent && this.commons.viewerOptions.showDisorderContentTag && this.commons.viewerOptions.buttonTrack) {
            this.commons.tagsContainer.select("#" + id)
                .append('g')
                .attr("id", id + '_disorder')
                .attr("transform", "translate(0,0)")
                .data([{
                    name: object.name,
                    data: object,
                    type: "disorder"
                }]);
        }
        if (object.links && this.commons.viewerOptions.showLinkTag && this.commons.viewerOptions.buttonTrack) {
            for (var i = 0; i < object.links.length; i++) {
                var detailObj = {
                    name: object.name,
                    data: object.data
                };
                object.links[i].featureDetails = detailObj;
                this.commons.tagsContainer.select("#" + id)
                    .append('g')
                    .attr("id", id + '_button_' + object.links[i].name)
                    .data([{
                        feature: object.name,
                        name: object.links[i].name,
                        icon: object.links[i].icon,
                        color: object.links[i].color,
                        message: object.links[i].message,
                    }]);
            }
        }
        var contentLength = 90;
        if (!this.commons.viewerOptions.showDisorderContentTag) {
            contentLength = 0;
        }
        if (object.disorderContent && this.commons.viewerOptions.showDisorderContentTag && this.commons.viewerOptions.buttonTrack) {
            var disordersString = object.disorderContent.toString() + '%';
            var color = this.gradientColor(object.disorderContent);
            var textColor = (color === "black") ? "white" : "black";
            var disId = id + "_disorderContainer";
            var disorderContentTag = '<g style="padding-left:3px; padding-right:3px" id="' + disId +
                '""><button class="mybutton mybutton--square" style="margin-left:4px; font-family: \'sans-serif\'; font-size: 13px; background-color:' +
                color + '"">' + '<span style="color:' + textColor + '">' + disordersString + '</span></button></g>';
            this.commons.tagsContainer.selectAll("#" + id + "_disorder")
                .append('foreignObject')
                .attr("y", -6)
                .attr("width", "100%")
                .attr("height", "100%")
                .append('xhtml:body')
                .style("margin", "0")
                .html(disorderContentTag)
                .call(this.commons.d3helper.genericTooltip("Disorder content"));
            var myd3node = d3.select("#" + disId).node();
            contentLength = myd3node.getBoundingClientRect().width + 10;
        }
        if (object.links) {
            var tagStart = contentLength;
            var size = void 0;
            var _loop_2 = function (i) {
                var obj = object.links[i];
                obj.type = 'button';
                var myid;
                this_1.commons.tagsContainer.selectAll("#" + id + "_button_" + obj.name)
                    .append('foreignObject')
                    .attr("id", function () {
                    myid = id + "_button_" + obj.name + "_foreingObject";
                    return myid;
                })
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("y", -9)
                    .attr("transform", "translate(" + tagStart + ",0)")
                    .append('xhtml:body')
                    .style("margin", "0")
                    .html(obj.html)
                    .call(this_1.commons.d3helper.tooltip(obj));
                if (d3.select("#" + myid).select('.fvlink').node()) {
                    d3.select("#" + myid).select('.fvlink').style("padding-left", "6px");
                    d3.select("#" + myid).select('.fvlink').style("padding-right", "6px");
                }
                size = 40;
                if (d3.select("#" + myid).select('button').node()) {
                    d3.select("#" + myid).select('button').attr("class", "mybutton mybutton--circle");
                }
                tagStart += size;
            };
            var this_1 = this;
            for (var i = 0; i < object.links.length; i++) {
                _loop_2(i);
            }
        }
    };
    FillSVG.prototype.sequence = function (seq, start) {
        var _this = this;
        if (start === void 0) { start = 0; }
        this.commons.svgContainer.selectAll(".mySequence").remove();
        var sequenceAAs = this.commons.svgContainer.append("g")
            .attr("class", "mySequence sequenceGroup");
        sequenceAAs
            .selectAll(".AA")
            .data(seq)
            .enter()
            .append("text")
            .attr("clip-path", "url(#clip)")
            .attr("class", "AA")
            .attr("text-anchor", "middle")
            .attr("x", function (d, i) {
            var position = _this.commons.scaling.range([2, _this.commons.viewerOptions.width - 2])(i + start);
            return position;
        })
            .attr("y", this.commons.step)
            .attr("font-size", "12px")
            .attr("font-family", "monospace")
            .text(function (d) {
            return d;
        });
    };
    FillSVG.prototype.sequenceLine = function () {
        this.commons.svgContainer.selectAll(".mySequence").remove();
        if (this.commons.viewerOptions.dottedSequence) {
            var dottedSeqLine = this.commons.svgContainer.selectAll(".sequenceLine")
                .data([[{ x: 1, y: this.commons.step - this.commons.elementHeight / 2 }, {
                        x: this.commons.fvLength,
                        y: this.commons.step - this.commons.elementHeight / 2
                    }]])
                .enter()
                .append("path")
                .attr("clip-path", "url(#clip)")
                .attr("d", this.commons.line)
                .attr("class", "mySequence sequenceLine")
                .style("z-index", "0")
                .style("stroke", "grey")
                .style("stroke-dasharray", "1,3")
                .style("stroke-width", "1px")
                .style("stroke-opacity", 0);
            dottedSeqLine
                .transition()
                .duration(500)
                .style("stroke-opacity", 1);
        }
    };
    FillSVG.prototype.rectangle = function (object, position) {
        var _this = this;
        if (!object.height)
            object.height = this.commons.elementHeight;
        var rectHeight = this.commons.elementHeight;
        var rectShift = rectHeight + rectHeight / 3;
        var lineShift = rectHeight / 2 - 6;
        position = Number(position) + 3;
        var rectsPro = this.commons.svgContainer.append("g")
            .attr("class", "rectangle featureLine")
            .attr("clip-path", "url(#clip)")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", function () {
            return 'c' + object.dom_id + '_container';
        });
        var dataLine = [];
        if (!this.commons.level) {
            this.commons.level = 1;
        }
        for (var i = 0; i < this.commons.level; i++) {
            dataLine.push([{
                    x: 1,
                    y: (i * rectShift + lineShift),
                }, {
                    x: this.commons.fvLength,
                    y: (i * rectShift + lineShift)
                }]);
        }
        rectsPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", function () {
            return "line " + object.className;
        })
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");
        var rectsProGroup = rectsPro.selectAll("." + object.className + "Group")
            .data(object.data)
            .enter()
            .append("g")
            .attr("class", object.className + "Group")
            .attr("transform", function (d) {
            return "translate(" + _this.rectX(d) + ",0)";
        });
        rectsProGroup
            .append("rect")
            .attr("class", "element " + object.className)
            .attr("id", function (d) {
            var id = "f_" + object.dom_id + Math.random().toString(36).substring(7);
            d.id = id;
            d.tooltip = d.tooltip;
            return id;
        })
            .attr("y", function (d) {
            return d.level * rectShift;
        })
            .attr("ry", function (d) {
            return _this.commons.radius;
        })
            .attr("rx", function (d) {
            return _this.commons.radius;
        })
            .attr("width", function (d) {
            return _this.rectWidth2(d);
        })
            .attr("height", this.commons.elementHeight)
            .style("fill", function (d) {
            return d.color || object.color;
        })
            .style("fill-opacity", function (d) {
            if (d.opacity) {
                return d.opacity;
            }
            else if (object.opacity) {
                return object.opacity;
            }
            else {
                return "0.6";
            }
        })
            .style("stroke", function (d) {
            if ("stroke" in d) {
                return d.stroke;
            }
            else if ("stroke" in object) {
                return object.stroke;
            }
            else {
                return d.color;
            }
        })
            .style("z-index", "13")
            .call(this.commons.d3helper.tooltip(object));
        rectsProGroup
            .append("text")
            .attr("class", "element " + object.className + "Text")
            .attr("y", function (d) {
            return d.level * rectShift + rectHeight / 2;
        })
            .attr("dy", "0.35em")
            .style("font-size", "10px")
            .text(function (d) {
            return d.description;
        })
            .style("fill", "black")
            .style("z-index", "15")
            .style("visibility", function (d) {
            if (d.description) {
                return (_this.commons.scaling(d.y) - _this.commons.scaling(d.x)) > d.description.length * 8 && object.height > 11 ? "visible" : "hidden";
            }
            else
                return "hidden";
        })
            .call(this.commons.d3helper.tooltip(object));
        this.forcePropagation(rectsProGroup);
        var uniqueShift = rectHeight > 12 ? rectHeight - 6 : 0;
        this.commons.YPosition += this.commons.level < 2 ? uniqueShift : (this.commons.level - 1) * rectShift + uniqueShift;
    };
    FillSVG.prototype.unique = function (object, position) {
        var _this = this;
        var rectsPro = this.commons.svgContainer.append("g")
            .attr("class", "uniquePosition featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", function () {
            return 'c' + object.dom_id + '_container';
        });
        var dataLine = [];
        dataLine.push([{
                x: 1,
                y: 0
            }, {
                x: this.commons.fvLength,
                y: 0
            }]);
        rectsPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");
        rectsPro.selectAll("." + object.className)
            .data(object.data)
            .enter()
            .append("rect")
            .attr("clip-path", "url(#clip)")
            .attr("class", "element " + object.className)
            .attr("id", function (d) {
            return "f_" + object.dom_id + Math.random().toString(36).substring(7);
        })
            .attr("x", function (d) {
            return _this.commons.scaling(d.x - 0.4);
        })
            .attr("width", function (d) {
            if (_this.commons.scaling(d.x + 0.4) - _this.commons.scaling(d.x - 0.4) < 2)
                return 2;
            else
                return _this.commons.scaling(d.x + 0.4) - _this.commons.scaling(d.x - 0.4);
        })
            .attr("height", this.commons.elementHeight)
            .style("fill", function (d) {
            return d.color || object.color;
        })
            .style("z-index", "3")
            .call(this.commons.d3helper.tooltip(object));
        this.forcePropagation(rectsPro);
    };
    FillSVG.prototype.circle = function (object, position) {
        var _this = this;
        var circlesPro = this.commons.svgContainer.append("g")
            .attr("class", "pointPosition featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", function () {
            return 'c' + object.dom_id + '_container';
        });
        var dataLine = [];
        dataLine.push([{
                x: 1,
                y: 0
            }, {
                x: this.commons.fvLength,
                y: 0
            }]);
        circlesPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");
        var readyData = [{}].concat(object.data);
        circlesPro.selectAll("." + object.className)
            .data(readyData)
            .enter()
            .append("circle")
            .attr("class", "element " + object.className)
            .attr("id", function (d) {
            return "f_" + object.dom_id + Math.random().toString(36).substring(7);
        })
            .attr("cx", function (d) {
            return _this.commons.scaling(d.x);
        })
            .attr("cy", "5")
            .attr("r", function (d) { return d.y * _this.commons.elementHeight; })
            .attr("width", function (d) {
            if (_this.commons.scaling(d.x + 0.4) - _this.commons.scaling(d.x - 0.4) < 2)
                return 2;
            else
                return _this.commons.scaling(d.x + 0.4) - _this.commons.scaling(d.x - 0.4);
        })
            .style("fill", function (d) {
            return d.color || object.color;
        })
            .style("fill-opacity", function (d) {
            if (d.opacity) {
                return d.opacity;
            }
            else if (object.opacity) {
                return object.opacity;
            }
            else {
                return "1";
            }
        })
            .style("stroke", function (d) {
            if ("stroke" in d) {
                return d.stroke;
            }
            else if ("stroke" in object) {
                return object.stroke;
            }
            else {
                return d.color;
            }
        })
            .call(this.commons.d3helper.tooltip(object));
        this.forcePropagation(circlesPro);
    };
    FillSVG.prototype.path = function (object, position) {
        var pathsDB = this.commons.svgContainer.append("g")
            .attr("class", "pathing featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", function () {
            return 'c' + object.dom_id + '_container';
        });
        var dataLine = [{
                x: 1,
                y: 0
            }, {
                x: this.commons.fvLength,
                y: 0
            }];
        pathsDB.selectAll("." + object.className)
            .data(object.data)
            .enter()
            .append("path")
            .attr("clip-path", "url(#clip)")
            .attr("class", "element " + object.className)
            .attr("id", function (d) {
            return "f_" + d[0].dom_id + Math.random().toString(36).substring(7);
        })
            .attr("d", this.commons.lineBond)
            .style("fill", "none")
            .style("stroke", function (d) {
            return d[0].color || object.color;
        })
            .style("z-index", "3")
            .style("stroke-width", function (d) {
            return d[0].opacity || object.opacity;
        })
            .call(this.commons.d3helper.tooltip(object));
        this.forcePropagation(pathsDB);
    };
    FillSVG.prototype.fillSVGLine = function (object, position) {
        var _this = this;
        if (position === void 0) { position = 0; }
        if (object.fill === undefined)
            object.fill = true;
        var histoG = this.commons.svgContainer.append("g")
            .attr("id", function () { return 'c' + object.dom_id + '_container'; })
            .attr("class", "lining featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("heigth", object.curveHeight);
        var dataLine = [];
        dataLine.push([{
                x: 1,
                y: 0
            }, {
                x: this.commons.fvLength,
                y: 0
            }]);
        object.data.forEach(function (dd, i) {
            histoG.selectAll("." + object.className + i)
                .data(dd)
                .enter()
                .append("path")
                .attr("clip-path", "url(#clip)")
                .attr("class", "element " + object.className + " " + object.className + i)
                .attr("d", function (object) {
                if (object.interpolation) {
                    _this.commons.lineGen.curve(d3[object.interpolation]());
                }
                else {
                    _this.commons.lineGen.curve(d3.curveBasis);
                }
            })
                .style("fill", object.color)
                .style("fill-opacity", "0.8")
                .style("stroke", object.color[i] || "#000")
                .style("z-index", "3")
                .style("stroke-width", "2px")
                .call(_this.commons.d3helper.tooltip(object));
        });
        this.forcePropagation(histoG);
    };
    FillSVG.prototype.multipleRect = function (object, position, level) {
        var _this = this;
        if (position === void 0) { position = 0; }
        if (level === void 0) { level = this.commons.level; }
        var rectHeight = 8;
        var rectShift = 10;
        var rects = this.commons.svgContainer.append("g")
            .attr("class", "multipleRects featureLine")
            .attr("transform", "translate(0," + position + ")");
        for (var i = 0; i < level; i++) {
            rects.append("path")
                .attr("d", this.fillSVGLine([{
                    x: 1,
                    y: (i * rectShift - 2)
                }, {
                    x: this.commons.fvLength,
                    y: (i * rectShift - 2)
                }]))
                .attr("class", function () {
                return "line " + object.className;
            })
                .style("z-index", "0")
                .style("stroke", object.color)
                .style("stroke-width", "1px");
        }
        rects.selectAll("." + object.className)
            .data(object.data)
            .enter()
            .append("rect")
            .attr("clip-path", "url(#clip)")
            .attr("class", "element " + object.className)
            .attr("id", function (d) {
            return "f_" + object.dom_id + Math.random().toString(36).substring(7);
        })
            .attr("x", function (d) {
            return _this.commons.scaling(d.x);
        })
            .attr("y", function (d) {
            return d.level * rectShift;
        })
            .attr("ry", function (d) {
            return _this.commons.radius;
        })
            .attr("rx", function (d) {
            return _this.commons.radius;
        })
            .attr("width", function (d) {
            return (_this.commons.scaling(d.y) - _this.commons.scaling(d.x));
        })
            .attr("height", rectHeight)
            .style("fill", function (d) {
            return d.color || object.color;
        })
            .style("z-index", "13")
            .call(this.commons.d3helper.tooltip(object));
        this.forcePropagation(rects);
    };
    return FillSVG;
}(helper_1.default));
exports.default = FillSVG;
//# sourceMappingURL=fillsvg.js.map