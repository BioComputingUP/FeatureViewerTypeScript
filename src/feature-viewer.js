"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("./custom-d3");
var d3_selection_1 = require("d3-selection");
var commons_1 = require("./commons");
var transition_1 = require("./transition");
var fillsvg_1 = require("./fillsvg");
var calculate_1 = require("./calculate");
var tooltip_1 = require("./tooltip");
var fvstyles = require("./../assets/fv.scss");
var FeatureViewer = (function () {
    function FeatureViewer(sequence, div, options) {
        var _this = this;
        this.displaySequence = function (seq) {
            return this.commons.viewerOptions.width / seq > 5;
        };
        this.resizeListener = function () {
            _this.updateWindow();
        };
        this.stopFlagLoading = function (id) {
            console.warn("Loading of flag", id, "was interrupted");
        };
        this.resizeViewer = function () {
            this.updateWindow();
        };
        this.resetZoom = function () {
            this.resetAll();
        };
        this.commons = new commons_1.default();
        this.commons.yData = [];
        this.commons.features = [];
        this.commons.YPosition = this.commons.step;
        this.divId = div.slice(1).toString();
        if (typeof sequence === 'string') {
            this.sequence = sequence;
        }
        else {
            this.sequence = null;
        }
        this.commons.fvLength = typeof sequence === 'string' ? sequence.length : sequence;
        this.parseUserOptions(options);
        this.fillSVG = new fillsvg_1.default(this.commons);
        this.subfeaturesTransition = new transition_1.SubfeaturesTransition(this.commons);
        this.transition = new transition_1.Transition(this.commons);
        this.calculate = new calculate_1.default(this.commons);
        this.tool = new tooltip_1.default(this.commons);
        this.init(div);
        this.resizeViewer();
    }
    FeatureViewer.prototype.parseUserOptions = function (options) {
        var simple_keys = [
            'showAxis',
            'showSequence',
            'brushActive',
            'bubbleHelp',
            'zoomMax',
            'showSubFeatures',
            'flagColor',
            'flagTrack',
            'showLinkTag',
            'showDisorderContentTag',
            'buttonTrack',
            'animation'
        ];
        for (var _i = 0, simple_keys_1 = simple_keys; _i < simple_keys_1.length; _i++) {
            var key = simple_keys_1[_i];
            if (options && key in options) {
                this.commons.viewerOptions[key] = options[key];
            }
        }
        this.commons.viewerOptions.offset = { start: 0, end: this.commons.fvLength + 1 };
        if (options && options.offset) {
            this.commons.viewerOptions.offset = options.offset;
            if (options.offset.start < 1) {
                this.commons.viewerOptions.offset.start = 1;
                console.warn("WARNING ! offset.start should be > 0. Thus, it has been reset to 1.");
            }
        }
        if (!options.unit) {
            this.commons.viewerOptions.unit = "units";
        }
        else {
            this.commons.viewerOptions.unit = options.unit;
        }
        if (options.animation) {
            this.commons.animation = options.animation;
        }
        this.commons.viewerOptions.tagsTrackWidth = 0;
        if (options && options.buttonTrack) {
            if (typeof options.buttonTrack === 'string') {
                this.commons.viewerOptions.tagsTrackWidth = Number(options.buttonTrack.match(/[0-9]+/g)[0]);
            }
            else if (typeof options.buttonTrack === 'number') {
                this.commons.viewerOptions.tagsTrackWidth = options.buttonTrack;
            }
            else if (typeof options.buttonTrack === 'boolean') {
                if (options.buttonTrack) {
                    this.commons.viewerOptions.tagsTrackWidth = 100;
                }
                else {
                    this.commons.viewerOptions.tagsTrackWidth = 0;
                }
            }
            else {
                this.commons.viewerOptions.tagsTrackWidth = 100;
                console.warn("Automatically set tagsTrackWidth to " + this.commons.viewerOptions.tagsTrackWidth);
            }
        }
        this.commons.viewerOptions.backup.tagsTrackWidth = this.commons.viewerOptions.tagsTrackWidth;
        this.commons.viewerOptions.labelTrackWidth = 200;
        if (options && options.flagTrack) {
            if (typeof options.flagTrack === 'string') {
                this.commons.viewerOptions.labelTrackWidth = Number(options.flagTrack.match(/[0-9]+/g)[0]);
            }
            else if (typeof options.flagTrack === 'number') {
                this.commons.viewerOptions.labelTrackWidth = options.flagTrack;
            }
            else if (typeof options.flagTrack === 'boolean') {
                this.commons.viewerOptions.labelTrackWidth = 200;
            }
            else {
                this.commons.viewerOptions.labelTrackWidth = 200;
                console.warn("Automatically set tagsTrackWidth to " + this.commons.viewerOptions.tagsTrackWidth);
            }
        }
        this.commons.viewerOptions.backup.labelTrackWidth = this.commons.viewerOptions.labelTrackWidth;
        this.commons.viewerOptions.margin = {
            top: 10,
            bottom: 20,
            left: this.commons.viewerOptions.labelTrackWidth,
            right: this.commons.viewerOptions.tagsTrackWidth
        };
        var myd3node = d3.select("#" + this.divId).node();
        var totalwidth = myd3node.getBoundingClientRect().width;
        if (totalwidth < this.commons.mobilesize) {
            this.commons.viewerOptions.mobileMode = true;
            this.commons.viewerOptions.margin.left = 40;
            if (this.commons.viewerOptions.tagsTrackWidth !== 0) {
                this.commons.viewerOptions.margin.right = 80;
            }
            ;
        }
        var myvod3node = d3.select("#" + this.divId).node();
        this.commons.viewerOptions.width = myvod3node.getBoundingClientRect().width;
        this.commons.viewerOptions.height = 600 - this.commons.viewerOptions.margin.top - this.commons.viewerOptions.margin.bottom;
    };
    ;
    FeatureViewer.prototype.addXAxis = function (position) {
        this.commons.svgContainer.append("g")
            .attr("class", "x axis XAxis")
            .attr("transform", "translate(0," + (position + 20) + ")")
            .call(this.commons.xAxis);
        if (!this.commons.viewerOptions.showAxis) {
            d3.select("#" + this.divId).selectAll(".tick")
                .attr("display", "none");
        }
    };
    ;
    FeatureViewer.prototype.updateXAxis = function (position) {
        this.commons.svgContainer.selectAll(".XAxis")
            .attr("transform", "translate(0," + (position + this.commons.step) + ")");
    };
    ;
    FeatureViewer.prototype.updateSVGHeight = function (position) {
        this.commons.svg.attr("height", position + 60 + "px");
        this.commons.svg.select("clipPath rect").attr("height", position + 60 + "px");
    };
    ;
    FeatureViewer.prototype.addYAxis = function () {
        this.commons.yAxisSVG = this.commons.svg.append("g")
            .attr("class", "pro axis")
            .attr("transform", "translate(0," + this.commons.viewerOptions.margin.top + ")");
        this.commons.yAxisSVG.append("rect")
            .attr("width", this.commons.viewerOptions.margin.left)
            .attr("class", "flagBackground")
            .attr("height", "100%")
            .attr("fill", "white")
            .attr("fill-opacity", 1);
        this.updateYAxis();
    };
    ;
    FeatureViewer.prototype.updateYAxis = function () {
        var _this = this;
        this.commons.yAxisSVGGroup = this.commons.yAxisSVG
            .selectAll(".yAxis")
            .data(this.commons.yData)
            .enter()
            .append("g")
            .attr("id", function (d) {
            if (d.title === "Sequence") {
                return 'sequence';
            }
            else {
                return d.dom_id;
            }
        })
            .attr("class", "flag")
            .on('click', function (d) {
            if (_this.commons.viewerOptions.showSubFeatures && d.flagLevel === 1 && d.hasSubFeatures) {
                _this.clickFlagFunction(d);
            }
        })
            .call(this.commons.d3helper.flagTooltip());
        this.commons.yAxisSVGGroup
            .append("polygon")
            .attr("class", "boxshadow Arrow")
            .style("stroke", function (d) {
            if (d.flagColor)
                return d.flagColor;
            return _this.commons.viewerOptions.flagColor;
        })
            .attr("points", function (d) {
            return _this.calculate.yxPoints(d);
        })
            .style("fill", function (d) {
            if (d.flagColor)
                return d.flagColor;
            return _this.commons.viewerOptions.flagColor;
        });
        var myobj = this.commons.yAxisSVGGroup
            .append("foreignObject")
            .attr("x", 4)
            .attr("y", function (d) {
            return d.y - 4;
        })
            .attr("width", 30)
            .attr("height", 30)
            .attr("id", "chevron")
            .html(function (d) {
            if (_this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                return _this.commons.right_chevron;
            }
            else {
                return '';
            }
        });
        this.commons.yAxisSVGGroup
            .append("text")
            .attr("class", "yAxis")
            .attr("font-family", "Roboto")
            .style("display", function (d) {
            if (_this.commons.viewerOptions.mobileMode) {
                return "none";
            }
            else {
                return "block";
            }
        })
            .attr("x", function (d) {
            var cvm = 0;
            if (_this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                cvm = 22;
            }
            _this.commons.headMargin = 0;
            if (d.flagLevel) {
                _this.commons.headMargin = 20 * (d.flagLevel - 1);
                return cvm + _this.commons.headMargin + 8;
            }
            else {
                return cvm + 8;
            }
        })
            .attr("y", function (d) {
            return d.y + 12;
        })
            .text(function (d) {
            return d.title;
        });
    };
    ;
    FeatureViewer.prototype.loadingFlag = function (id) {
        d3.select("#" + this.divId).select("#" + id)
            .attr("class", "loading");
    };
    ;
    FeatureViewer.prototype.clickFlagFunction = function (d) {
        var id = d.dom_id;
        this.loadingFlag(id);
        var flag_detail_object = {
            points: this.calculate.yxPoints(d),
            y: d.y,
            dom_id: d.dom_id,
            id: d.title,
            flagLevel: d.flagLevel
        };
        if (CustomEvent) {
            var eventDetail = { detail: flag_detail_object }, event_1 = new CustomEvent(this.commons.events.FLAG_SELECTED_EVENT, eventDetail);
            this.commons.flagSelected.push(flag_detail_object.dom_id);
            this.commons.svgElement.dispatchEvent(event_1);
        }
        else {
            console.warn("CustomEvent is not defined....");
        }
        if (this.commons.trigger)
            this.commons.trigger(this.commons.events.FLAG_SELECTED_EVENT, flag_detail_object);
    };
    ;
    FeatureViewer.prototype.resizeBrush = function () {
        var rectArea = this.commons.svgContainer.node().getBoundingClientRect();
        var thisbrush = this.commons.svgContainer.select(".brush");
        thisbrush.selectAll("rect")
            .attr('height', rectArea.height)
            .attr('width', rectArea.width);
    };
    ;
    FeatureViewer.prototype.addBrush = function () {
        this.commons.svgContainer
            .append("g")
            .attr("class", "brush")
            .call(this.commons.brush);
        this.resizeBrush();
    };
    ;
    FeatureViewer.prototype.brushend = function () {
        if (this.commons.featureSelected !== {}) {
            d3.select("#" + this.divId).select("#" + this.commons.featureSelected.id).style("fill-opacity", "0.6");
            this.commons.featureSelected = {
                id: null
            };
        }
        d3.select("#" + this.divId).select(".selectionRect").remove();
        if (d3_selection_1.event.sourceEvent !== null && typeof d3_selection_1.event.sourceEvent.target !== "function") {
            var zoomScale = void 0;
            this.commons.extent = d3_selection_1.event.selection;
            if (this.commons.extent) {
                var borders = [this.commons.extent[0], this.commons.extent[1]].map(this.commons.scaling.invert, this.commons.scaling);
                var start = Math.round(Number(borders[0])), end = Math.round(Number(borders[1]));
                if (start < 0) {
                    start = 0;
                }
                var extentLength = end - start;
                var seqCheck = this.displaySequence(extentLength);
                if (extentLength > this.commons.viewerOptions.zoomMax) {
                    this.commons.current_extend = {
                        length: extentLength,
                        start: start,
                        end: end
                    };
                    zoomScale = (this.commons.fvLength / extentLength).toFixed(1);
                    d3.select("#" + this.divId).select(".zoomUnit")
                        .text(zoomScale.toString());
                    this.commons.scaling.domain([start, end]);
                    this.commons.scalingPosition.range([start, end]);
                    var currentShift = start ? start : this.commons.viewerOptions.offset.start;
                    this.transition_data(this.commons.features, currentShift);
                    this.reset_axis();
                    this.commons.svgContainer.selectAll(".mySequence").remove();
                    if (this.commons.viewerOptions.showSequence) {
                        if (seqCheck === false) {
                            this.fillSVG.sequenceLine();
                        }
                        else if (seqCheck === true) {
                            this.commons.seqShift = start;
                            this.fillSVG.sequence(this.sequence.substring(start, end), this.commons.seqShift);
                        }
                    }
                }
                else {
                    zoomScale = "Prevented";
                    console.warn("Zoom greater than " + this.commons.viewerOptions.zoomMax + " is prevented");
                }
                if (CustomEvent) {
                    this.commons.svgElement.dispatchEvent(new CustomEvent(this.commons.events.ZOOM_EVENT, {
                        detail: {
                            start: start,
                            end: end,
                            zoom: zoomScale
                        }
                    }));
                }
                if (this.commons.trigger)
                    this.commons.trigger(this.commons.events.ZOOM_EVENT, {
                        start: start,
                        end: end,
                        zoom: zoomScale
                    });
            }
            d3.select("#" + this.divId).select(".brush").call(this.commons.brush.move, null);
        }
        else {
            return;
        }
    };
    FeatureViewer.prototype.resizeForMobile = function () {
        var _this = this;
        var flags = d3.select("#" + this.divId).selectAll(".Arrow")
            .attr("points", function (d) {
            return _this.calculate.yxPoints(d);
        });
        this.commons.yAxisSVG.select(".flagBackground").attr("width", this.commons.viewerOptions.margin.left);
        var flags_text = d3.select("#" + this.divId).selectAll(".yAxis")
            .style("display", function (d) {
            if (_this.commons.viewerOptions.mobileMode) {
                return "none";
            }
            else {
                return "block";
            }
        });
        this.commons.svgContainer.attr("transform", "translate(" + (this.commons.viewerOptions.margin.left).toString() + ",10)");
        this.commons.tagsContainer.attr("transform", "translate(" + (this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left) + "," + this.commons.viewerOptions.margin.top + ")");
    };
    FeatureViewer.prototype.updateWindow = function () {
        var myd3node = d3.select("#" + this.divId).node();
        var totalwidth = myd3node.getBoundingClientRect().width;
        if (totalwidth < this.commons.mobilesize) {
            if (!this.commons.viewerOptions.mobileMode) {
                this.commons.viewerOptions.mobileMode = true;
                this.commons.viewerOptions.margin.left = 40;
                if (this.commons.viewerOptions.tagsTrackWidth !== 0) {
                    this.commons.viewerOptions.margin.right = 80;
                }
                ;
                this.resizeForMobile();
            }
        }
        else {
            if (this.commons.viewerOptions.mobileMode) {
                this.commons.viewerOptions.mobileMode = false;
                this.commons.viewerOptions.margin.left = this.commons.viewerOptions.labelTrackWidth;
                this.commons.viewerOptions.margin.right = this.commons.viewerOptions.tagsTrackWidth;
                this.resizeForMobile();
            }
        }
        this.commons.viewerOptions.width = totalwidth - this.commons.viewerOptions.margin.left - this.commons.viewerOptions.margin.right - 17;
        this.commons.svg
            .attr("width", totalwidth);
        this.commons.svg.select("clipPath rect")
            .attr("width", this.commons.viewerOptions.width);
        if (this.commons.viewerOptions.brushActive) {
            d3.select(this.divId + " .background").attr("width", this.commons.viewerOptions.width - 10);
        }
        d3.select("#" + this.divId).selectAll(".brush").call(this.commons.brush.move, null);
        this.commons.scaling.range([2, this.commons.viewerOptions.width - 2]);
        this.commons.scalingPosition.domain([0, this.commons.viewerOptions.width]);
        var seq = this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);
        this.commons.svgContainer.selectAll(".mySequence").remove();
        if (this.commons.viewerOptions.showSequence) {
            if (seq === false) {
                this.fillSVG.sequenceLine();
            }
            else if (seq === true) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
        }
        if (this.commons.animation) {
            d3.select("#" + this.divId).select('#tags_container')
                .transition().duration(500);
        }
        d3.select("#" + this.divId).select('#tags_container')
            .attr("transform", "translate(" + (this.commons.viewerOptions.margin.left + this.commons.viewerOptions.width).toString() + ",10)");
        this.transition_data(this.commons.features, this.commons.current_extend.start);
        this.reset_axis();
        this.resizeBrush();
    };
    FeatureViewer.prototype.resetAll = function () {
        if (this.commons.featureSelected !== {}) {
            d3.select("#" + this.divId).select("#" + this.commons.featureSelected.id).style("fill-opacity", "0.6");
            this.commons.featureSelected = {
                id: null
            };
        }
        d3.select("#" + this.divId).select(".selectionRect").remove();
        d3.select("#" + this.divId).select(".zoomUnit").text("1");
        this.commons.scaling.domain([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        this.commons.scalingPosition.range([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        var seq = this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);
        d3.select("#" + this.divId).select(".brush").call(this.commons.brush.move, null);
        this.commons.svgContainer.selectAll(".mySequence").remove();
        if (this.commons.viewerOptions.showSequence) {
            if (seq === false) {
                this.fillSVG.sequenceLine();
            }
            else if (seq === true) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
        }
        this.commons.current_extend = {
            length: this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start,
            start: this.commons.viewerOptions.offset.start,
            end: this.commons.viewerOptions.offset.end
        };
        this.commons.seqShift = 0;
        this.transition_data(this.commons.features, this.commons.viewerOptions.offset.start);
        this.reset_axis();
        if (CustomEvent) {
            this.commons.svgElement.dispatchEvent(new CustomEvent(this.commons.events.ZOOM_EVENT, {
                detail: {
                    start: 1,
                    end: this.sequence.length - 1,
                    zoom: 1
                }
            }));
        }
        if (this.commons.trigger)
            this.commons.trigger(this.commons.events.ZOOM_EVENT, {
                start: 1,
                end: this.sequence.length - 1,
                zoom: 1
            });
    };
    FeatureViewer.prototype.transition_data = function (features, start) {
        var _this = this;
        features.forEach(function (o) {
            if (o.type === "rect") {
                _this.transition.rectangle(o);
            }
            else if (o.type === "multipleRect") {
                _this.transition.multiRec(o);
            }
            else if (o.type === "unique") {
                _this.transition.unique(o);
            }
            else if (o.type === "circle") {
                _this.transition.circle(o);
            }
            else if (o.type === "path") {
                _this.transition.path(o);
            }
            else if (o.type === "curve") {
                _this.transition.lineTransition(o);
            }
            _this.transition.basalLine(o);
        });
    };
    FeatureViewer.prototype.reset_axis = function () {
        if (this.commons.animation) {
            this.commons.svgContainer.transition().duration(500);
        }
        this.commons.svgContainer
            .select(".x.axis")
            .call(this.commons.xAxis);
    };
    FeatureViewer.prototype.addVerticalLine = function () {
        var vertical = d3.select("#" + this.divId).select(".chart")
            .append("div")
            .attr("class", "VLine")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", (this.commons.YPosition + 50) + "px")
            .style("top", "30px")
            .style("background", "#000");
    };
    FeatureViewer.prototype.resizeForButtons = function () {
        this.commons.viewerOptions.tagsTrackWidth = 55 + 15 * this.commons.maxNumberOfButtons + 10;
        this.commons.viewerOptions.margin.right = this.commons.viewerOptions.tagsTrackWidth;
        this.updateWindow();
    };
    ;
    FeatureViewer.prototype.init = function (div) {
        var _this = this;
        this.sequence = " " + this.sequence;
        this.commons.stringSequence = this.sequence;
        d3.select(div)
            .style("position", "relative")
            .style("padding", "0px")
            .style("z-index", "2");
        this.commons.scaling = d3.scaleLinear()
            .domain([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end])
            .range([0, this.commons.viewerOptions.width]);
        this.commons.scalingPosition = d3.scaleLinear()
            .domain([0, this.commons.viewerOptions.width])
            .range([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        this.tool.initTooltip(div, this.divId);
        this.commons.lineBond = d3.line()
            .curve(d3.curveStepBefore)
            .x(function (d) {
            return _this.commons.scaling(d['x']);
        })
            .y(function (d) {
            return -d['y'] * 10 + _this.commons.pathLevel;
        });
        this.commons.lineGen = d3.line()
            .x(function (d) {
            return _this.commons.scaling(d['x']);
        })
            .curve(d3.curveBasis);
        this.commons.lineYScale = d3.scaleLinear()
            .domain([0, -30])
            .range([0, -20]);
        this.commons.line = d3.line()
            .curve(d3.curveLinear)
            .x(function (d) {
            return _this.commons.scaling(d['x']);
        })
            .y(function (d) {
            return d['y'] + 6;
        });
        var rtickStep = Math.round(this.commons.fvLength / 10);
        var tickStep = Math.round(rtickStep / 10) * 10;
        var tickArray = Array.apply(null, { length: this.commons.fvLength }).map(Number.call, Number).filter(function (value, index, ar) {
            return (index % tickStep == 0 && index !== 0);
        });
        this.commons.xAxis = d3.axisBottom(this.commons.scaling)
            .tickValues(tickArray);
        var yAxisScale = d3.scaleBand()
            .rangeRound([0, 500]);
        d3.axisLeft(yAxisScale)
            .tickFormat(function (d) {
            return d;
        });
        this.commons.brush = d3.brushX()
            .extent([[this.commons.scaling.range()[0], 0], [this.commons.scaling.range()[1], 1]])
            .on("end", function () {
            _this.brushend();
        });
        this.commons.right_chevron = '<i class="materialicons">keyboard_arrow_right</i>';
        this.commons.down_chevron = '<i class="materialicons">keyboard_arrow_down</i>';
        this.commons.tooltipDiv = d3.select("#" + this.divId)
            .append("div")
            .attr("class", "fvtooltip")
            .attr("id", "fvtooltip")
            .style("opacity", 0);
        this.commons.style = d3.select("#" + this.divId)
            .append("style")
            .html("" + fvstyles);
        if (this.commons.viewerOptions.toolbar) {
            var headerOptions = document.querySelector(div + " .svgHeader") ? d3.select(div + " .svgHeader") : d3.select(div).append("div").attr("class", "svgHeader");
            if (!document.querySelector(div + ' .header-position')) {
                var headerPosition = headerOptions
                    .append("div")
                    .attr("class", "header-position")
                    .style("display", "inline-block")
                    .style("margin", "15px 10px 0px")
                    .style("padding", "0px")
                    .style("line-height", "32px");
                headerPosition
                    .append("div")
                    .attr("class", "position-label")
                    .style("padding", "0px 5px")
                    .style("display", "inline-block")
                    .style("padding", "0px")
                    .style("font-weight", "700")
                    .text("Position  :  ");
                headerPosition
                    .append("div")
                    .style("display", "inline-block")
                    .style("padding", "0px")
                    .style("padding-left", "5px")
                    .append("div")
                    .style("min-width", "50px")
                    .attr("id", "zoomPosition")
                    .text("0");
            }
            var headerZoom = void 0;
            if (!document.querySelector(div + ' .header-zoom')) {
                headerZoom = headerOptions
                    .append("div")
                    .attr("class", "header-zoom")
                    .style("display", "inline-block")
                    .style("margin", "15px 0px 0px")
                    .style("padding", "0px")
                    .style("line-height", "32px");
                headerZoom
                    .append("div")
                    .attr("class", "zoom-label")
                    .style("padding", "0px 5px")
                    .style("display", "inline-block")
                    .style("padding", "0px")
                    .style("font-weight", "700")
                    .text("Zoom : ");
                headerZoom
                    .append("div")
                    .style("display", "inline-block")
                    .style("padding", "0px")
                    .append("div")
                    .style("min-width", "50px")
                    .style("padding-left", "5px")
                    .append("span")
                    .text("x ")
                    .append("span")
                    .attr("class", "zoomUnit")
                    .text("1");
            }
            headerZoom = document.querySelector(div + ' .header-zoom') ? d3.select(div + ' .header-zoom') : headerOptions;
            if (this.commons.viewerOptions.bubbleHelp) {
                if (!document.querySelector(div + ' .header-help')) {
                    var headerHelp = headerOptions
                        .append("div")
                        .attr("class", "header-help")
                        .style("display", "inline-block")
                        .style("margin", "0px")
                        .style("margin-right", "5px")
                        .style("padding-right", "10px")
                        .style("bottom", "0")
                        .style("float", "right");
                    var downloadhtml = '<button id="downloadButton" class="mybutton mybuttonsquare" style="cursor:pointer"><md-icon class="materialicons">file_download</md-icon></button>';
                    var downloadHelp = headerHelp
                        .append("g")
                        .append('foreignObject')
                        .call(this.commons.d3helper.genericTooltip("Download SVG"))
                        .style("display", "inline-block")
                        .append('xhtml:body')
                        .html(downloadhtml);
                    var helphtml = '<button id="helpButton" class="mybutton mybuttoncircle"><md-icon class="materialicons">help_outline</md-icon></button>';
                    var buttonHelp = headerHelp
                        .append("g")
                        .append('foreignObject')
                        .call(this.commons.d3helper.genericTooltip("Show help"))
                        .style("display", "inline-block")
                        .style("padding-left", "4px")
                        .append('xhtml:body')
                        .html(helphtml);
                    downloadHelp
                        .on("click", function () {
                        _this.downloadSVG();
                    });
                    buttonHelp
                        .on("click", function () {
                        _this.showHelp();
                    });
                }
            }
        }
        this.commons.svg = d3.select(div).append("svg")
            .attr("width", this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left + this.commons.viewerOptions.margin.right)
            .attr("height", this.commons.viewerOptions.height + this.commons.viewerOptions.margin.top + this.commons.viewerOptions.margin.bottom)
            .style("z-index", "2")
            .attr("id", "svgContent")
            .on("contextmenu", function (d, i) {
            _this.resetAll();
            if (CustomEvent) {
                var event_2 = new CustomEvent(_this.commons.events.CLEAR_SELECTION_EVENT, { detail: {} });
                _this.commons.svgElement.dispatchEvent(event_2);
            }
            else {
                console.warn("CustomEvent is not defined....");
            }
            if (_this.commons.trigger)
                _this.commons.trigger(_this.commons.events.CLEAR_SELECTION_EVENT);
        });
        this.commons.svgElement = d3.select("#" + this.divId).select('svg').node();
        this.commons.svgContainer = this.commons.svg
            .append("g")
            .attr("transform", "translate(" + this.commons.viewerOptions.margin.left + "," + this.commons.viewerOptions.margin.top + ")")
            .attr("id", "tracks_container")
            .on("contextmenu", function (d, i) {
            d3_selection_1.event.preventDefault();
        });
        this.commons.tagsContainer = this.commons.svg.append("g")
            .attr("transform", "translate(" + (this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left) + "," + this.commons.viewerOptions.margin.top + ")")
            .attr("id", "tags_container");
        if (this.commons.viewerOptions.buttonTrack) {
            this.commons.tagsContainer.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white");
        }
        this.commons.svgContainer.on('mousemove', function () {
            var absoluteMousePos = d3.mouse(_this.commons.svgContainer.node());
            var posN = Math.round(_this.commons.scalingPosition(absoluteMousePos[0]));
            var pos;
            if (!_this.commons.viewerOptions.positionWithoutLetter) {
                pos = "" + posN + (_this.sequence[posN] || "");
            }
            else {
                pos = posN.toString();
            }
            document.querySelector("#" + _this.divId + " #zoomPosition").innerHTML = pos;
        });
        if (this.commons.viewerOptions.showSequence) {
            this.commons.viewerOptions.showSequence = true;
            if (this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start)) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
            else {
                this.fillSVG.sequenceLine();
            }
            this.commons.features.push({
                data: this.sequence,
                name: "Sequence",
                className: "AA",
                color: "black",
                type: "text",
                dom_id: "sequence"
            });
            this.commons.yData.push({
                title: "Sequence",
                y: this.commons.YPosition - 8,
                flagLevel: 1
            });
        }
        this.addXAxis(this.commons.YPosition);
        this.addYAxis();
        if (this.commons.viewerOptions.brushActive) {
            this.addBrush();
        }
        if (this.commons.viewerOptions.verticalLine) {
            this.addVerticalLine();
        }
        this.updateSVGHeight(this.commons.YPosition);
        window.addEventListener("resize", this.resizeListener);
    };
    FeatureViewer.prototype.getTransformation = function (transform) {
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttributeNS(null, "transform", transform);
        var matrix = g.transform.baseVal.consolidate().matrix;
        var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, e = matrix.e, f = matrix.f;
        var scaleX, scaleY, skewX;
        if (scaleX = Math.sqrt(a * a + b * b))
            a /= scaleX, b /= scaleX;
        if (skewX = a * c + b * d)
            c -= a * skewX, d -= b * skewX;
        if (scaleY = Math.sqrt(c * c + d * d))
            c /= scaleY, d /= scaleY, skewX /= scaleY;
        if (a * d < b * c)
            a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
        return {
            translateX: e,
            translateY: f,
            rotate: Math.atan2(b, a) * 180 / Math.PI,
            skewX: Math.atan(skewX) * 180 / Math.PI,
            scaleX: scaleX,
            scaleY: scaleY
        };
    };
    FeatureViewer.prototype.addFeatureCore = function (object, flagLevel, position) {
        if (flagLevel === void 0) { flagLevel = 1; }
        if (position === void 0) { position = null; }
        this.commons.YPosition += this.commons.step;
        if (!object.subFeaturesOn) {
            object.subFeaturesOn = false;
        }
        if (this.commons.animation && this.commons.features.length > 80) {
            this.commons.animation = false;
            if (CustomEvent) {
                var event_3 = new CustomEvent(this.commons.events.ANIMATIONS_FALSE_EVENT, { detail: {} });
                this.commons.svgElement.dispatchEvent(event_3);
            }
            else {
                console.warn("CustomEvent is not defined....");
            }
            if (this.commons.trigger)
                this.commons.trigger(this.commons.events.ANIMATIONS_FALSE_EVENT);
        }
        ;
        if (!object.className) {
            object.className = object.type + "fv";
        }
        if (!object.color) {
            object.color = "lightgrey";
        }
        object.flagLevel = flagLevel;
        if (!object.dom_id) {
            object.dom_id = 'f' + Math.random().toString(36).substring(7);
        }
        if (position) {
            this.commons.features.splice(position, 0, object);
        }
        else {
            this.commons.features.push(object);
        }
        this.fillSVG.typeIdentifier(object);
        this.updateYAxis();
        if (object.type === "curve" || object.type === "path") {
            this.updateWindow();
        }
    };
    FeatureViewer.prototype.draw_subfeatures = function (parentRowY, subfeatures, parent, parentPos) {
        var _this = this;
        this.commons.YPosition = parentRowY;
        subfeatures.forEach(function (subf) {
            _this.addFeatureCore(subf, parent['flagLevel'] + 1, parentPos);
        });
        var height = this.commons.YPosition - parentRowY;
        return height;
    };
    FeatureViewer.prototype.remove_subfeatures_data = function (parentRowY, parentPos, parent) {
        var checkButtons = false;
        var checkCurve = false;
        var totalHeigth = 0, tranformedY;
        for (var i = parentPos + 1; i < this.commons.features.length; i++) {
            var childfeat = this.commons.features[i];
            if (!checkCurve && (childfeat['type'] === "curve" || childfeat['type'] === "path")) {
                checkCurve = true;
                totalHeigth += childfeat['height'];
            }
            ;
            if (childfeat['links'] && childfeat['links'].length >= this.commons.maxNumberOfButtons) {
                checkButtons = true;
            }
            ;
            if (childfeat['flagLevel'] > parent['flagLevel']) {
                var dom_id = childfeat['dom_id'];
                d3.select("#t" + dom_id + "_tagarea").remove();
                d3.select("#c" + dom_id + "_container").remove();
                d3.select("#" + dom_id).remove();
                this.commons.features.splice(i, 1);
                this.commons.yData.splice(i, 1);
                i--;
            }
            else {
                break;
            }
        }
        var height = this.commons.YPosition - parentRowY;
        return height;
    };
    FeatureViewer.prototype.feature_transition_data = function (featuresToMove, start) {
        var _this = this;
        featuresToMove.forEach(function (f) {
            var feature_id = f['dom_id'];
            var parentElementTagArea = d3.select("#t" + feature_id + "_tagarea");
            var currentTagY = _this.getTransformation(parentElementTagArea.attr("transform")).translateY;
            _this.subfeaturesTransition.area(parentElementTagArea, currentTagY + start);
            var parentElementRow = d3.select("#c" + feature_id + "_container");
            var currentRowY = _this.getTransformation(parentElementRow.attr("transform")).translateY;
            _this.subfeaturesTransition.area(parentElementRow, currentRowY + start);
            var parentElementFlag = d3.select("#" + feature_id);
            var currentParentY = 0;
            if (parentElementFlag.attr("transform")) {
                currentParentY = _this.getTransformation(parentElementFlag.attr("transform")).translateY;
            }
            _this.subfeaturesTransition.area(parentElementFlag, currentParentY + start);
        });
        var axis = d3.select("#" + this.divId + " .XAxis");
        var currentAxisY = this.getTransformation(axis.attr("transform")).translateY;
        this.subfeaturesTransition.Xaxis(axis, currentAxisY + start);
        var container = d3.select("#" + this.divId + " #svgContent");
        var currentContainerH = container.node().getBoundingClientRect().height;
        this.subfeaturesTransition.containerH(container, currentContainerH + start);
        if (this.commons.viewerOptions.brushActive) {
            this.commons.svgContainer.selectAll(".brush rect")
                .attr('height', currentContainerH);
        }
        if (this.commons.viewerOptions.verticalLine)
            d3.selectAll(".VLine").style("height", (currentContainerH) + "px");
    };
    ;
    FeatureViewer.prototype.showHelp = function () {
        var helpContent = "To zoom in : Left click to select area of interest\n To zoom out : Right click to reset the scale\n Zoom max : Limited to" +
            this.commons.viewerOptions.zoomMax.toString() + " " + this.commons.viewerOptions.unit;
        alert(helpContent);
    };
    FeatureViewer.prototype.downloadSVG = function () {
        function clone(svg_el) {
            var clone = svg_el.node().appendChild(this.cloneNode(true));
            return d3.select(clone).attr("class", "clone");
        }
        var width = 500, height = 500, filename = "download_fv.png";
        var svg_el = this.commons.svgContainer.getElementsById("#svgContent");
        var tagarea = svg_el.select("#tags_container").remove();
        var foreingobjects = svg_el.select("#chevron").remove();
        var source = (new XMLSerializer()).serializeToString(svg_el.node());
        svg_el.node().append(tagarea.node());
        svg_el.node().append(foreingobjects.node());
        var svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "download.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    FeatureViewer.prototype.onFeatureSelected = function (listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FEATURE_SELECTED_EVENT, listener);
    };
    ;
    FeatureViewer.prototype.removeResizeListener = function () {
        window.removeEventListener("resize", this.resizeListener);
    };
    ;
    FeatureViewer.prototype.onFlagSelected = function (listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FLAG_SELECTED_EVENT, listener);
    };
    ;
    FeatureViewer.prototype.onButtonSelected = function (listener) {
        this.commons.svgElement.addEventListener(this.commons.events.TAG_SELECTED_EVENT, listener);
    };
    ;
    FeatureViewer.prototype.onZoom = function (listener) {
        this.commons.svgElement.addEventListener(this.commons.events.ZOOM_EVENT, listener);
    };
    ;
    FeatureViewer.prototype.onClearSelection = function (listener) {
        this.commons.svgElement.addEventListener(this.commons.events.CLEAR_SELECTION_EVENT, listener);
    };
    ;
    FeatureViewer.prototype.onAnimationOff = function (listener) {
        this.commons.svgElement.addEventListener(this.commons.events.ANIMATIONS_FALSE_EVENT, listener);
    };
    ;
    FeatureViewer.prototype.addFeature = function (object, flagLevel) {
        if (flagLevel === void 0) { flagLevel = 1; }
        this.addFeatureCore(object, flagLevel);
        if (this.commons.viewerOptions.showSubFeatures && object.hasSubFeatures) {
            object.hasChildren === true;
        }
        this.updateXAxis(this.commons.YPosition);
        this.updateSVGHeight(this.commons.YPosition);
        if (this.commons.viewerOptions.brushActive) {
            this.commons.svgContainer.selectAll(".brush rect")
                .attr('height', this.commons.YPosition + 50);
        }
        if (this.commons.viewerOptions.verticalLine)
            d3.selectAll(".VLine").style("height", (this.commons.YPosition + 50) + "px");
        if (d3.selectAll(".element") && d3.selectAll(".element")['_groups'].length > 1500)
            this.commons.animation = false;
        return object.dom_id;
    };
    FeatureViewer.prototype.addSubFeature = function (object) {
        d3.select("#" + this.divId).select("#" + object.parentId)
            .attr("class", "");
        if (object.parentId && object.subFeatures) {
            var parent_id = object.parentId;
            var subfeatures = object.subFeatures;
            var elementPos = this.commons.features.map(function (x) {
                return x["dom_id"];
            }).indexOf(parent_id);
            var thisFeature = this.commons.features[elementPos];
            var parentElementRow = d3.select("#c" + parent_id + "_container");
            var parentRowY = void 0;
            parentRowY = this.getTransformation(parentElementRow.attr("transform")).translateY;
            if (thisFeature['type'] === 'curve' || thisFeature['type'] === 'path') {
                parentRowY += thisFeature["height"] * 10 - 4;
                parentRowY += this.commons.step / 2;
            }
            else {
                var parentRowN = this.calculate.addNLines(thisFeature['data']);
                parentRowY += this.calculate.getHeightRect(parentRowN);
            }
            var diff = 0;
            var featuresToMove = this.commons.features.slice(elementPos + 1);
            if (thisFeature['subFeaturesOn']) {
                d3.select("#" + parent_id).select('#chevron')
                    .attr("x", 4)
                    .attr("y", function (d) {
                    return d['y'] - 4;
                })
                    .html(this.commons.right_chevron);
                thisFeature['subFeaturesOn'] = false;
                if (parent_id in this.commons.calculatedTransitions) {
                    this.remove_subfeatures_data(parentRowY, elementPos, thisFeature);
                    diff = this.commons.calculatedTransitions[parent_id];
                    featuresToMove = this.commons.features.slice(elementPos + 1);
                }
                else {
                    var changedHeight = this.remove_subfeatures_data(parentRowY, elementPos, thisFeature);
                    diff = changedHeight;
                    this.commons.calculatedTransitions[parent_id] = changedHeight;
                    featuresToMove = this.commons.features.slice(elementPos + 1);
                }
                ;
                diff = diff * -1;
            }
            else {
                d3.select("#" + parent_id).select('#chevron')
                    .attr("x", 4)
                    .attr("y", function (d) {
                    return d['y'] - 4;
                })
                    .html(this.commons.down_chevron);
                thisFeature['subFeaturesOn'] = true;
                if (parent_id in this.commons.calculatedTransitions) {
                    this.draw_subfeatures(parentRowY, subfeatures, thisFeature, elementPos + 1);
                    diff = this.commons.calculatedTransitions[parent_id];
                }
                else {
                    var changedHeight = this.draw_subfeatures(parentRowY, subfeatures, thisFeature, elementPos + 1);
                    diff = changedHeight;
                    this.commons.calculatedTransitions[parent_id] = changedHeight;
                }
                ;
            }
            this.feature_transition_data(featuresToMove, diff);
            this.resizeBrush();
        }
        else {
            console.warn("Wrong addSubFeature input");
        }
    };
    return FeatureViewer;
}());
exports.FeatureViewer = FeatureViewer;
//# sourceMappingURL=feature-viewer.js.map