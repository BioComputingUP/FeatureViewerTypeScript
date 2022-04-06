"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureViewer = void 0;
const d3 = require("./custom-d3");
const d3_selection_1 = require("d3-selection");
const htmlToImage = require("html-to-image");
const interfaces_1 = require("./interfaces");
const commons_1 = require("./commons");
const transition_1 = require("./transition");
const fillsvg_1 = require("./fillsvg");
const calculate_1 = require("./calculate");
const tooltip_1 = require("./tooltip");
class FeatureViewer {
    constructor(sequence, div, options, features) {
        this.stopFlagLoading = function (id) {
            d3.select(`#${this.divId}`).select("#fvoverlay").attr("class", null);
        };
        this.resizeViewer = function () {
            this.updateWindow();
        };
        this.commons = new commons_1.default();
        this.commons.yData = [];
        this.commons.features = [];
        this.commons.YPosition = this.commons.step;
        this.commons.divId = this.divId = div.slice(1).toString();
        this.commons.logger = new interfaces_1.FeatureViewerLog();
        this.sequence = sequence;
        this.commons.fvLength = sequence.length;
        if (options) {
            this.parseUserOptions(options);
        }
        else {
            this.parseUserOptions({});
        }
        this.fillSVG = new fillsvg_1.default(this.commons);
        this.subfeaturesTransition = new transition_1.SubfeaturesTransition(this.commons);
        this.transition = new transition_1.Transition(this.commons);
        this.calculate = new calculate_1.default(this.commons);
        this.tool = new tooltip_1.default(this.commons);
        this.init(div);
        if (features) {
            this.addFeatures(features);
        }
        this.resizeViewer();
    }
    parseUserOptions(options) {
        const simple_keys = [
            'showAxis',
            'showSequence',
            'brushActive',
            'toolbar',
            'toolbarPosition',
            'zoomMax',
            'showSubFeatures',
            'flagColor',
            'flagTrack',
            'flagTrackMobile',
            'breakpoint',
            'sideBar',
            'unit',
            'backgroundcolor'
        ];
        for (let key of simple_keys) {
            if (options && key in options) {
                this.commons.viewerOptions[key] = options[key];
            }
        }
        if (options.breakpoint) {
            if (typeof options.breakpoint === 'string') {
                this.commons.mobilesize = Number(options.breakpoint);
            }
            else if (typeof options.breakpoint === 'number') {
                this.commons.mobilesize = options.breakpoint;
            }
            else if (typeof options.breakpoint === 'boolean') {
                this.commons.mobilesize = 951;
            }
        }
        this.commons.viewerOptions.offset = { start: 0, end: this.commons.fvLength + 1 };
        if (options && options.offset) {
            this.commons.viewerOptions.offset = options.offset;
            if (options.offset.start < 1) {
                this.commons.viewerOptions.offset.start = 1;
                this.commons.logger.warn("Offset.start should be > 0. Thus, it has been reset to 1.", { fvId: this.divId });
            }
        }
        this.commons.viewerOptions.brushActive = options.brushActive ? options.brushActive : true;
        this.commons.viewerOptions.tagsTrackWidth = 0;
        if (options && options.sideBar) {
            if (typeof options.sideBar === 'string') {
                this.commons.viewerOptions.tagsTrackWidth = Number(options.sideBar.match(/[0-9]+/g)[0]);
            }
            else if (typeof options.sideBar === 'number') {
                this.commons.viewerOptions.tagsTrackWidth = options.sideBar;
            }
            else if (typeof options.sideBar === 'boolean') {
                if (options.sideBar) {
                    this.commons.viewerOptions.tagsTrackWidth = 100;
                }
                else {
                    this.commons.viewerOptions.tagsTrackWidth = 0;
                }
            }
            else {
                this.commons.viewerOptions.tagsTrackWidth = 100;
                this.commons.logger.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`, { fvId: this.divId });
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
                this.commons.viewerOptions.labelTrackWidth = options.flagTrack ? 200 : 0;
            }
            else {
                this.commons.viewerOptions.labelTrackWidth = 200;
                this.commons.logger.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`, { fvId: this.divId });
            }
        }
        this.commons.viewerOptions.backup.labelTrackWidth = this.commons.viewerOptions.labelTrackWidth;
        this.commons.viewerOptions.labelTrackWidthMobile = 30;
        if (options && options.flagTrackMobile) {
            if (typeof options.flagTrackMobile === 'string') {
                this.commons.viewerOptions.labelTrackWidthMobile = Number(options.flagTrackMobile.match(/[0-9]+/g)[0]);
            }
            else if (typeof options.flagTrackMobile === 'number') {
                this.commons.viewerOptions.labelTrackWidthMobile = options.flagTrackMobile;
            }
            else if (typeof options.flagTrackMobile === 'boolean') {
                this.commons.viewerOptions.labelTrackWidthMobile = options.flagTrackMobile ? 30 : 0;
            }
            else {
                this.commons.viewerOptions.labelTrackWidthMobile = 30;
                this.commons.logger.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`, { fvId: this.divId });
            }
        }
        this.commons.viewerOptions.margin = {
            top: 10,
            bottom: 20,
            left: this.commons.viewerOptions.labelTrackWidth,
            right: this.commons.viewerOptions.tagsTrackWidth
        };
        let myd3node = d3.select(`#${this.divId}`).node();
        if (myd3node) {
            let totalwidth = myd3node.getBoundingClientRect().width;
            if (totalwidth < this.commons.mobilesize) {
                this.commons.viewerOptions.mobileMode = true;
                this.commons.viewerOptions.margin.left = this.commons.viewerOptions.labelTrackWidthMobile;
                if (this.commons.viewerOptions.tagsTrackWidth !== 0) {
                    this.commons.viewerOptions.margin.right = 80;
                }
            }
        }
        let myvod3node = d3.select(`#${this.divId}`).node();
        if (myvod3node) {
            this.commons.viewerOptions.width = myvod3node.getBoundingClientRect().width;
            this.commons.viewerOptions.height = 600 - this.commons.viewerOptions.margin.top - this.commons.viewerOptions.margin.bottom;
        }
        this.commons.backgroundcolor = options.backgroundcolor ? options.backgroundcolor : "white";
    }
    ;
    addYAxis() {
        this.commons.yAxisSVG = this.commons.svg.append("g")
            .attr("class", "labels_container")
            .attr("transform", "translate(0," + this.commons.viewerOptions.margin.top + ")");
        this.commons.yAxisSVG.append("rect")
            .attr("width", this.commons.viewerOptions.margin.left)
            .attr("class", "flagBackground")
            .attr("height", "100%")
            .attr("fill", this.commons.backgroundcolor)
            .attr("fill-opacity", 1);
    }
    ;
    updateYAxis() {
        this.commons.yAxisSVGGroup = this.commons.yAxisSVG
            .selectAll(".yAxis")
            .data(this.commons.yData)
            .enter()
            .append("g")
            .attr("id", function (d) {
            return d.id;
        })
            .attr("class", (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                return "flag withsubfeatures";
            }
            else {
                return "flag";
            }
        })
            .on('click', (d) => {
            this.clickFlag(d);
        })
            .on('mouseover', (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                d3.select(`#${this.divId}`).select(`#${d.id}`).selectAll(".Arrow").style("fill-opacity", 0.9);
            }
        })
            .on('mouseout', (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                d3.select(`#${this.divId}`).select(`#${d.id}`).selectAll(".Arrow").style("fill-opacity", 0.6);
            }
        })
            .call(this.commons.d3helper.flagTooltip());
        this.commons.yAxisSVGGroup
            .append("polygon")
            .attr("class", (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                return "boxshadow Arrow withsubfeatures";
            }
            else {
                return "boxshadow Arrow";
            }
        })
            .style("stroke", (d) => {
            return d.flagColor ? d.flagColor : this.commons.viewerOptions.flagColor;
        })
            .attr("points", (d) => {
            let polypoints = this.calculate.yxPoints(d);
            return polypoints;
        })
            .attr("transform", d => "translate(" + (20 * (d.flagLevel - 1)) + ",0)")
            .style("fill", (d) => {
            return d.flagColor ? d.flagColor : this.commons.viewerOptions.flagColor;
        });
        this.commons.yAxisSVGGroup
            .append("g")
            .attr("transform", (d) => {
            let x = 0;
            this.commons.headMargin = 0;
            if (d.flagLevel) {
                this.commons.headMargin = 20 * (d.flagLevel - 1);
                x = this.commons.headMargin + 5;
            }
            let y = d.y - 4;
            return "translate(" + x + "," + y + ")";
        })
            .append("path")
            .attr("id", "chevron")
            .attr("class", (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                return "chevron withsubfeatures";
            }
            else {
                return "chevron";
            }
        })
            .attr("fill", "rgba(39, 37, 37, 0.71)")
            .attr("d", (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                if (d.isOpen) {
                    return this.commons.down_chevron;
                }
                else {
                    return this.commons.right_chevron;
                }
            }
            else {
                return '';
            }
        });
        this.commons.yAxisSVGGroup
            .append("foreignObject")
            .attr("class", (d) => {
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                return "yAxis withsubfeatures";
            }
            else {
                return "yAxis";
            }
        })
            .attr("x", (d) => {
            let cvm = 0;
            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                cvm = 17;
            }
            this.commons.headMargin = 0;
            if (d.flagLevel) {
                this.commons.headMargin = 20 * (d.flagLevel - 1);
                return cvm + this.commons.headMargin + 8;
            }
            else {
                return cvm + 8;
            }
        })
            .attr("y", function (d) {
            return d.y - 5;
        })
            .attr("width", (d) => {
            if (this.commons.viewerOptions.mobileMode) {
                return this.calcFlagWidth(d);
            }
            else {
                let margin = 20 + (20 * d.flagLevel);
                return this.commons.viewerOptions.margin.left - margin;
            }
        })
            .attr("height", this.commons.step - 11)
            .html((d) => {
            return d.label;
        });
    }
    applyLastHighlight() {
        if (this.lastHighlight) {
            if (this.lastHighlight.type === 'single') {
                this.highlightPosition(this.lastHighlight.selection);
            }
            else if (this.lastHighlight.type === 'multi') {
                this.highlightPositions(this.lastHighlight.selection);
            }
        }
    }
    brushend() {
        this.commons.customTooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        this.commons.customTooltipDiv.html("");
        this.commons.customTooltipDiv.status == "closed";
        if (this.commons.featureSelected) {
            d3.select(`#${this.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
            this.commons.featureSelected = null;
        }
        this.resetHighlight(false);
        this.applyLastHighlight();
        if (d3_selection_1.event.sourceEvent !== null && typeof d3_selection_1.event.sourceEvent.target !== "function") {
            let zoomScale;
            this.commons.extent = d3_selection_1.event.selection;
            if (this.commons.extent) {
                let borders = [this.commons.extent[0], this.commons.extent[1]].map(this.commons.scaling.invert, this.commons.scaling);
                let start = Math.round(Number(borders[0])), end = Math.round(Number(borders[1]));
                if (start < 0) {
                    start = 0;
                }
                let extentLength = end - start;
                let seqCheck = this.calculate.displaySequence(extentLength);
                if (extentLength > this.commons.viewerOptions.zoomMax) {
                    this.commons.current_extend = {
                        length: extentLength,
                        start: start,
                        end: end
                    };
                    zoomScale = (this.commons.fvLength / extentLength).toFixed(1);
                    d3.select(`#${this.divId}`).select(".zoomUnit")
                        .text(zoomScale.toString());
                    this.commons.scaling.domain([start, end]);
                    this.commons.scalingPosition.range([start, end]);
                    let currentShift = start ? start : this.commons.viewerOptions.offset.start;
                    this.transition_data(this.commons.features, currentShift);
                    this.fillSVG.reset_axis();
                    this.commons.svgContainer.select(".mySequence").remove();
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
                    this.commons.logger.warn("Zoom greater than " + this.commons.viewerOptions.zoomMax + " is prevented", { fvId: this.divId });
                }
                this.commons.currentzoom = zoomScale;
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
            d3.select(`#${this.divId}`).select(".brush").call(this.commons.brush.move, null);
        }
        else {
            return;
        }
    }
    resizeForMobile() {
        let flags = d3.select(`#${this.divId}`).selectAll(".Arrow")
            .attr("points", (d) => {
            return this.calculate.yxPoints(d);
        });
        this.commons.yAxisSVG.select(".flagBackground").attr("width", this.commons.viewerOptions.margin.left);
        let flags_text = d3.select(`#${this.divId}`).selectAll(".yAxis")
            .attr("width", (d) => {
            if (this.commons.viewerOptions.mobileMode) {
                return this.calcFlagWidth(d);
            }
            else {
                let margin = 20 + this.commons.viewerOptions.ladderSpacing * this.commons.viewerOptions.maxDepth;
                return this.commons.viewerOptions.margin.left - margin;
            }
        });
        this.commons.svgContainer.attr("transform", "translate(" + (this.commons.viewerOptions.margin.left).toString() + ",12)");
    }
    calcFlagWidth(d) {
        this.commons.headMargin = 20;
        let totalspace = 0;
        if ('hasSubFeatures' in d && d.hasSubFeatures) {
            totalspace;
        }
        if (this.commons.headMargin) {
            totalspace += this.commons.headMargin + 8;
        }
        let space = this.commons.viewerOptions.labelTrackWidthMobile - 15 - totalspace;
        if (space < 20) {
            return '0px';
        }
        else {
            return space + 'px';
        }
    }
    updateSequenceView() {
        const showfullseq = this.calculate.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);
        if (this.commons.viewerOptions.showSequence) {
            if (showfullseq === false) {
                this.fillSVG.sequenceLine();
            }
            else if (showfullseq === true) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
        }
    }
    updateWindow() {
        if (d3.select(`#${this.divId}`).node() !== null) {
            let d3node = d3.select(`#${this.commons.divId}`).node();
            let totalwidth = d3node.getBoundingClientRect().width;
            if (totalwidth < this.commons.mobilesize) {
                if (!this.commons.viewerOptions.mobileMode) {
                    this.commons.viewerOptions.mobileMode = true;
                    if (this.commons.viewerOptions.tagsTrackWidth !== 0) {
                        this.commons.viewerOptions.margin.right = 80;
                    }
                    this.commons.viewerOptions.margin.left = this.calculate.getMarginLeft() - (this.commons.viewerOptions.labelTrackWidth - this.commons.viewerOptions.labelTrackWidthMobile);
                }
                else {
                    this.commons.viewerOptions.margin.left = this.calculate.getMarginLeft();
                }
            }
            else {
                let margins = this.calculate.getMarginLeft();
                if (this.commons.viewerOptions.mobileMode) {
                    this.commons.viewerOptions.mobileMode = false;
                    margins += (this.commons.viewerOptions.labelTrackWidth - this.commons.viewerOptions.labelTrackWidthMobile);
                }
                this.commons.viewerOptions.margin.left = margins;
            }
            this.resizeForMobile();
            this.commons.viewerOptions.width = totalwidth - this.commons.viewerOptions.margin.left - this.commons.viewerOptions.margin.right - 17;
            this.commons.svg
                .attr("width", totalwidth);
            this.commons.svg.select("clipPath rect")
                .attr("width", this.commons.viewerOptions.width);
            if (this.commons.viewerOptions.brushActive) {
                d3.select(`${this.commons.divId} .background`).attr("width", this.commons.viewerOptions.width - 10);
            }
            d3.select(`#${this.commons.divId}`).select(".fvbrush").call(this.commons.brush.move, null);
            this.commons.scaling.range([2, this.commons.viewerOptions.width - 2]);
            this.commons.scalingPosition.domain([0, this.commons.viewerOptions.width]);
            this.updateSequenceView();
            if (this.commons.animation) {
                d3.select(`#${this.commons.divId}`).select('#tags_container').transition().duration(500);
            }
            d3.select(`#${this.commons.divId}`).select('#tags_container')
                .attr("transform", "translate(" + (this.commons.viewerOptions.margin.left + this.commons.viewerOptions.width + 10).toString() + ",10)");
            this.transition_data(this.commons.features, this.commons.current_extend.start);
            this.fillSVG.reset_axis();
            this.fillSVG.resizeBrush();
        }
    }
    transition_data(features, start) {
        for (const o of features) {
            if (o.type === "rect") {
                this.transition.rectangle(o);
            }
            else if (o.type === "multipleRect") {
                this.transition.multiRec(o);
            }
            else if (o.type === "unique") {
                this.transition.unique(o);
            }
            else if (o.type === "circle") {
                this.transition.circle(o);
            }
            else if (o.type === "path") {
                this.transition.path(o);
            }
            else if (o.type === "lollipop") {
                this.transition.lollipop(o);
            }
            else if (o.type === "curve") {
                this.transition.lineTransition(o);
            }
            else if (o.type === "arrow") {
                this.transition.arrow(o);
            }
            else {
                console.log("Feature", o.id, "type unknown");
            }
            this.transition.basalLine(o);
            if (o.subfeatures && o.isOpen) {
                this.transition_data(o.subfeatures, start);
            }
        }
    }
    addFeatureCore(object, flagLevel = 1, position = null) {
        this.commons.YPosition += this.commons.step;
        if (!object.label) {
            object.label = object.id;
        }
        if (!object.isOpen) {
            object.isOpen = false;
        }
        if (this.commons.animation) {
            if (CustomEvent) {
                let event = new CustomEvent(this.commons.events.ANIMATIONS_FALSE_EVENT, { detail: {} });
                if (this.commons.svgElement) {
                    this.commons.svgElement.dispatchEvent(event);
                }
            }
            else {
                this.commons.logger.warn("CustomEvent is not defined", { fvId: this.divId });
            }
            if (this.commons.trigger)
                this.commons.trigger(this.commons.events.ANIMATIONS_FALSE_EVENT);
        }
        if (!object.className) {
            object.className = object.type + "fv";
        }
        else {
            if (object.className !== object.type + "fv") {
                object.className = object.className + " " + object.type + "fv";
            }
        }
        if (!object.color) {
            object.color = "#DFD5F5";
        }
        object.flagLevel = flagLevel;
        this.fillSVG.typeIdentifier(object);
        this.updateYAxis();
        this.updateWindow();
    }
    drawFeatures() {
        if (this.commons.features.length > 100) {
            this.commons.animation = false;
            this.commons.logger.warn("Animation is turned off with more than 100 features", { method: "addFeatureCore", fvId: this.divId, featuresNumber: this.commons.features.length });
        }
        for (const ft of this.commons.features) {
            this.addFeature(ft);
        }
        this.fillSVG.updateXAxis(this.commons.YPosition);
        this.calculate.updateSVGHeight(this.commons.YPosition);
        if (this.commons.viewerOptions.brushActive) {
            this.fillSVG.resizeBrush();
        }
    }
    recursivelyRemove(ft) {
        if (ft.subfeatures) {
            for (const sft of ft.subfeatures) {
                this.recursivelyRemove(sft);
            }
        }
        d3.select(`#t${ft.id}_tagarea`).remove();
        d3.select(`#c${ft.id}_container`).remove();
        d3.select(`#${ft.id}`).remove();
    }
    recursiveClose(array) {
        for (const sbt of array) {
            sbt.isOpen = false;
            if (sbt.subfeatures) {
                this.recursiveClose(sbt.subfeatures);
            }
        }
    }
    changeFeature(feature, bool) {
        this.flagLoading(feature.id);
        feature.isOpen = bool;
        if (!feature.isOpen) {
            if (feature.subfeatures) {
                this.recursiveClose(feature.subfeatures);
            }
        }
        if (feature.isOpen) {
            if (feature.subfeatures.length > 200) {
                setTimeout(() => {
                    this.commons.features = this.emptyFeatures();
                    this.drawFeatures();
                    this.stopFlagLoading(feature.id);
                }, 1);
                return;
            }
        }
        this.commons.features = this.emptyFeatures();
        this.drawFeatures();
        this.stopFlagLoading(feature.id);
    }
    resetTooltip(tooltipdiv) {
        tooltipdiv.transition()
            .duration(500)
            .style("opacity", 0);
        tooltipdiv.html("");
        tooltipdiv.status = 'closed';
    }
    getLevel(f, l) {
        l++;
        if (f.hasOwnProperty('subfeatures')) {
            l = this.getLevel(f.subfeatures, l);
        }
        return l;
    }
    addFeature(object, flagLevel = 1) {
        this.addFeatureCore(object, flagLevel);
        if (object.subfeatures && object.isOpen) {
            flagLevel += 1;
            for (const sft of object.subfeatures) {
                this.addFeature(sft, flagLevel);
            }
        }
        return object.id;
    }
    init(div) {
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
        let overlayhtml = '<div id="fvoverlay" data-container="body"></div>';
        d3.select(`#${this.divId}`)
            .append("foreignObject")
            .html(overlayhtml);
        this.commons.lineBond = d3.line()
            .curve(d3.curveStepBefore)
            .x((d) => {
            return this.commons.scaling(d['x']);
        })
            .y((d) => {
            return -d['y'] * 10 + this.commons.pathLevel;
        });
        this.commons.lineGen = d3.line()
            .x((d) => {
            return this.commons.scaling(d['x']);
        })
            .curve(d3.curveBasis);
        this.commons.lineYScale = d3.scaleLinear()
            .domain([0, -30])
            .range([0, -20]);
        this.commons.line = d3.line()
            .curve(d3.curveLinear)
            .x((d) => {
            return this.commons.scaling(d['x']);
        })
            .y((d) => {
            return d['y'] + 6;
        });
        let rtickStep = Math.round(this.commons.fvLength / 10);
        let tickStep = Math.round(rtickStep / 10) * 10;
        let tickArray = Array.from(Array(this.commons.fvLength).keys())
            .filter(function (value, index, ar) {
            return (index % tickStep == 0 && index !== 0);
        });
        this.commons.xAxis = d3.axisBottom(this.commons.scaling)
            .tickValues(tickArray);
        let yAxisScale = d3.scaleBand()
            .rangeRound([0, 500]);
        d3.axisLeft(yAxisScale)
            .tickFormat(function (d) {
            return d;
        });
        this.commons.brush = d3.brushX()
            .on("end", () => {
            this.brushend();
        });
        this.commons.right_chevron = "M12.95 10.707l0.707-0.707-5.657-5.657-1.414 1.414 4.242 4.243-4.242 4.243 1.414 1.414 4.95-4.95z";
        this.commons.down_chevron = "M9.293 12.95l0.707 0.707 5.657-5.657-1.414-1.414-4.243 4.242-4.243-4.242-1.414 1.414z";
        this.commons.tooltipDiv = d3.select(`#${this.divId}`)
            .append("div")
            .attr("class", "fvtooltip")
            .attr("id", "fvtooltip")
            .style("opacity", 0)
            .style("z-index", 1070);
        this.commons.customTooltipDiv = d3.select(`#${this.divId}`)
            .append("div")
            .attr("class", "fvcustomtooltip")
            .attr("id", "fvcustomtooltip")
            .style("opacity", 0)
            .style("z-index", 1070);
        this.commons.style = d3.select(`#${this.divId}`);
        if (this.commons.viewerOptions.toolbar) {
            let headerOptions = document.querySelector(div + " .svgHeader") ? d3.select(div + " .svgHeader") : d3.select(div).append("div").attr("class", "svgHeader");
            if (this.commons.viewerOptions.toolbarPosition) {
                if (this.commons.viewerOptions.toolbarPosition === "right") {
                    this.commons.viewerOptions.toolbarPosition = "flex-end";
                }
                else if (this.commons.viewerOptions.toolbarPosition === "left") {
                    this.commons.viewerOptions.toolbarPosition = "flex-start";
                }
                headerOptions.attr("style", "color: rgba(39, 37, 37, 0.71); display: flex; justify-content: " + this.commons.viewerOptions.toolbarPosition);
            }
            else {
                headerOptions.attr("style", "color: rgba(39, 37, 37, 0.71);");
            }
            if (!document.querySelector(div + ' .header-position')) {
                let headerPosition = headerOptions
                    .append("div")
                    .attr("class", "header-position")
                    .style("display", "inline-block")
                    .style("padding-top", "5px");
                let button = headerPosition
                    .append("div")
                    .attr("class", "position-label")
                    .style("display", "inline-block");
                button
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M10 20s-7-9.13-7-13c0-3.866 3.134-7 7-7s7 3.134 7 7v0c0 3.87-7 13-7 13zM10 9c1.105 0 2-0.895 2-2s-0.895-2-2-2v0c-1.105 0-2 0.895-2 2s0.895 2 2 2v0z");
                button
                    .append("text")
                    .text("Position:");
                headerPosition
                    .append("div")
                    .style("display", "inline-block")
                    .style("padding-left", "5px")
                    .append("div")
                    .style("padding-right", "15px")
                    .style("width", "80px")
                    .attr("id", "zoomPosition")
                    .text("0");
            }
            let headerZoom;
            if (!document.querySelector(div + ' .header-zoom')) {
                headerZoom = headerOptions
                    .append("div")
                    .attr("class", "header-zoom")
                    .style("display", "inline-block")
                    .style("padding-top", "5px");
                let button = headerZoom
                    .append("div")
                    .attr("class", "zoom-label")
                    .style("display", "inline-block");
                button
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M12.9 14.32c-1.34 1.049-3.050 1.682-4.908 1.682-4.418 0-8-3.582-8-8s3.582-8 8-8c4.418 0 8 3.582 8 8 0 1.858-0.633 3.567-1.695 4.925l0.013-0.018 5.35 5.33-1.42 1.42-5.33-5.34zM8 14c3.314 0 6-2.686 6-6s-2.686-6-6-6v0c-3.314 0-6 2.686-6 6s2.686 6 6 6v0z");
                button
                    .append("text")
                    .text("Zoom:");
                headerZoom
                    .append("div")
                    .style("display", "inline-block")
                    .append("div")
                    .style("padding-left", "5px")
                    .style("width", "80px")
                    .append("span")
                    .text("x ")
                    .append("span")
                    .style("padding-right", "15px")
                    .attr("class", "zoomUnit")
                    .text("1");
            }
            if (!document.querySelector(div + ' .header-help')) {
                let headerHelp = headerOptions
                    .append("div")
                    .attr("class", "header-help")
                    .style("display", "inline-block");
                headerHelp
                    .append("button")
                    .attr("class", "mybuttoncircle")
                    .attr("id", "downloadButton")
                    .on("click", () => {
                    this.downloadPNG();
                })
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M13 8v-6h-6v6h-5l8 8 8-8h-5zM0 18h20v2h-20v-2z");
                headerHelp
                    .append("button")
                    .attr("id", "helpButton")
                    .attr("class", "mybuttoncircle")
                    .on("click", () => {
                    this.fillSVG.showHelp();
                })
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M2.93 17.070c-1.884-1.821-3.053-4.37-3.053-7.193 0-5.523 4.477-10 10-10 2.823 0 5.372 1.169 7.19 3.050l0.003 0.003c1.737 1.796 2.807 4.247 2.807 6.947 0 5.523-4.477 10-10 10-2.7 0-5.151-1.070-6.95-2.81l0.003 0.003zM9 11v4h2v-6h-2v2zM9 5v2h2v-2h-2z");
            }
        }
        this.commons.svg = d3.select(div).append("svg")
            .attr("width", this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left + this.commons.viewerOptions.margin.right)
            .attr("height", this.commons.viewerOptions.height + this.commons.viewerOptions.margin.top + this.commons.viewerOptions.margin.bottom)
            .style("z-index", "2")
            .attr("id", "svgContent")
            .on("dblclick", (d, i) => {
            this.resetZoom();
            if (CustomEvent) {
                let event = new CustomEvent(this.commons.events.CLEAR_SELECTION_EVENT, { detail: {} });
                this.commons.svgElement.dispatchEvent(event);
            }
            else {
                this.commons.logger.warn("CustomEvent is not defined", { fvId: this.divId });
            }
            if (this.commons.trigger)
                this.commons.trigger(this.commons.events.CLEAR_SELECTION_EVENT);
        })
            .on("contextmenu", (d, i) => {
            this.resetZoom();
            if (CustomEvent) {
                let event = new CustomEvent(this.commons.events.CLEAR_SELECTION_EVENT, { detail: {} });
                this.commons.svgElement.dispatchEvent(event);
            }
            else {
                this.commons.logger.warn("CustomEvent is not defined", { fvId: this.divId });
            }
            if (this.commons.trigger)
                this.commons.trigger(this.commons.events.CLEAR_SELECTION_EVENT);
        });
        this.commons.svgElement = d3.select(`#${this.divId}`).select('svg').node();
        this.commons.svgContainer = this.commons.svg
            .append("g")
            .attr("transform", "translate(" + this.commons.viewerOptions.margin.left + "," + this.commons.viewerOptions.margin.top + ")")
            .attr("id", "tracks_container")
            .on("contextmenu", function (d, i) {
            d3_selection_1.event.preventDefault();
        });
        this.commons.svgContainer.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", this.commons.backgroundcolor);
        this.commons.tagsContainer = this.commons.svg.append("g")
            .attr("transform", "translate(" + (this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left) + "," + this.commons.viewerOptions.margin.top + ")")
            .attr("id", "tags_container");
        if (this.commons.viewerOptions.sideBar) {
            this.commons.tagsContainer.append("rect")
                .attr("x", -6)
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", this.commons.backgroundcolor);
        }
        this.commons.svgContainer.on('mousemove', () => {
            let absoluteMousePos = d3.mouse(this.commons.svgContainer.node());
            let posN = Math.round(this.commons.scalingPosition(absoluteMousePos[0]));
            let pos;
            if (!this.commons.viewerOptions.positionWithoutLetter) {
                pos = `${posN}${this.sequence[posN] || ""}`;
            }
            else {
                pos = posN.toString();
            }
            this.commons.currentposition = pos;
            if (this.commons.viewerOptions.toolbar) {
                document.querySelector(`#${this.divId} #zoomPosition`).innerHTML = pos;
            }
        });
        if (this.commons.viewerOptions.showSequence) {
            if (this.calculate.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start)) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
            else {
                this.fillSVG.sequenceLine();
            }
            this.commons.yData.push({
                id: "sequence",
                label: "Sequence",
                y: this.commons.YPosition - 8,
                flagLevel: 1
            });
        }
        this.fillSVG.addXAxis(this.commons.YPosition);
        this.addYAxis();
        if (this.commons.viewerOptions.brushActive) {
            this.fillSVG.addBrush();
        }
        this.calculate.updateSVGHeight(this.commons.YPosition);
        window.addEventListener("resize", () => {
            this.updateWindow();
        });
    }
    getCurrentPosition() {
        return this.commons.currentposition;
    }
    getCurrentZoom() {
        return this.commons.currentzoom;
    }
    showHelp() {
        this.fillSVG.showHelp();
    }
    resetHighlight(resetLastHighlight = true) {
        this.resetTooltip(this.commons.customTooltipDiv);
        this.resetTooltip(this.commons.tooltipDiv);
        if (this.commons.featureSelected) {
            d3.select(`#${this.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
            this.commons.featureSelected = null;
        }
        d3.select(`#${this.divId}`).selectAll(".selectionRect").remove();
        if (resetLastHighlight === true) {
            this.lastHighlight = null;
        }
    }
    resetZoom() {
        this.resetHighlight();
        d3.select(`#${this.divId}`).select(".zoomUnit").text("1");
        this.commons.scaling.domain([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        this.commons.scalingPosition.range([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        let seq = this.calculate.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);
        d3.select(`#${this.divId}`).select(".fvbrush").call(this.commons.brush.move, null);
        this.commons.svgContainer.select(".mySequence").remove();
        this.updateSequenceView();
        this.commons.current_extend = {
            length: this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start,
            start: this.commons.viewerOptions.offset.start,
            end: this.commons.viewerOptions.offset.end
        };
        this.commons.seqShift = 0;
        this.transition_data(this.commons.features, this.commons.viewerOptions.offset.start);
        this.fillSVG.reset_axis();
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
        this.commons.currentzoom = 1;
    }
    resetAll() {
        this.resetHighlight();
        this.resetZoom();
        this.emptyFeatures();
        this.commons.features = this.commons.viewerOptions.backup.features;
        this.drawFeatures();
    }
    downloadJpeg() {
        let svg_el = document.getElementById(this.divId);
        let filename = "feature_viewer.jpeg";
        htmlToImage.toJpeg(svg_el, { quality: 0.95 })
            .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
        })
            .catch(function (error) {
            console.error('Error in Jpeg Image download', error);
        });
    }
    downloadPNG() {
        let svg_el = document.getElementById(this.divId);
        let filename = "feature_viewer.png";
        htmlToImage.toPng(svg_el)
            .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
        })
            .catch(function (error) {
            console.error('Error in PNG Image download', error);
        });
    }
    clickFlag(d) {
        if (d) {
            if (this.commons.featureSelected) {
                d3.select(`#${this.commons.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
                this.commons.featureSelected = null;
            }
            d3.select(`#${this.commons.divId}`).select(".selectionRect").remove();
            this.commons.customTooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
            this.commons.customTooltipDiv.html("");
            let id = d.id;
            let flag_detail_object = {
                points: this.calculate.yxPoints(d),
                y: d.y,
                id: d.id,
                label: d.label,
                flagLevel: d.flagLevel
            };
            if (CustomEvent) {
                let eventDetail = { detail: flag_detail_object }, event = new CustomEvent(this.commons.events.FLAG_SELECTED_EVENT, eventDetail);
                this.commons.svgElement.dispatchEvent(event);
                if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                    this.commons.flagSelected.push(flag_detail_object.id);
                    let width = d.isOpen ? this.commons.viewerOptions.labelTrackWidth : this.commons.viewerOptions.labelTrackWidth;
                    if (this.commons.viewerOptions.mobileMode) {
                        width = d.isOpen ? this.commons.viewerOptions.labelTrackWidthMobile : this.commons.viewerOptions.labelTrackWidthMobile;
                    }
                    this.commons.yAxisSVG.select(".flagBackground").attr("width", width);
                    this.updateWindow();
                    var i;
                    var result = null;
                    for (i = 0; result == null && i < this.commons.features.length; i++) {
                        result = this.calculate.searchTree(this.commons.features[i], flag_detail_object.id);
                    }
                    let featureToChange = result;
                    if (featureToChange) {
                        this.changeFeature(featureToChange, !featureToChange.isOpen);
                    }
                    else {
                        this.commons.logger.warn("Feature not found in feature array", { fvId: this.commons.divId, featureId: flag_detail_object.id });
                    }
                }
            }
            else {
                this.commons.logger.warn("CustomEvent is not defined", { fvId: this.commons.divId });
            }
            if (this.commons.trigger)
                this.commons.trigger(this.commons.events.FLAG_SELECTED_EVENT, flag_detail_object);
        }
    }
    ;
    emptyFeatures() {
        let deepCopy = JSON.parse(JSON.stringify(this.commons.features));
        for (const ft of this.commons.features) {
            this.recursivelyRemove(ft);
        }
        function checkSequence(ft) {
            return ft.id === 'fv_sequence';
        }
        this.commons.features = this.commons.features.filter(checkSequence);
        this.commons.yData = this.commons.yData.filter(checkSequence);
        this.fillSVG.updateXAxis(this.commons.step);
        let container = d3.select(`#${this.divId} #svgContent`);
        let newContainerH = this.commons.step * 3;
        this.subfeaturesTransition.containerH(container, newContainerH);
        if (this.commons.viewerOptions.brushActive) {
            this.commons.svgContainer.selectAll(".brush rect")
                .attr('height', newContainerH);
        }
        this.commons.YPosition = this.commons.step;
        return deepCopy;
    }
    flagLoading(id) {
        d3.select(`#${this.commons.divId}`).select("#fvoverlay").attr("class", "pageoverlay");
    }
    ;
    highlightRegion(region, featureid) {
        this.resetHighlight();
        let flatted = this.calculate.flatten(this.commons.features);
        let feature = flatted.find(i => i.id === featureid);
        if (feature) {
            if (feature.parent) {
                for (const i of Object.keys(feature.parent)) {
                    let ptftid = feature.parent[i];
                    let parentft = this.commons.yData.find(i => i.id === ptftid);
                    if (!parentft.isOpen) {
                        this.clickFlag(parentft);
                    }
                }
            }
            let regionid = '';
            if (region.id) {
                regionid = region.id;
            }
            else {
                regionid = "f_" + featureid + '_' + region.x + '-' + region.y;
            }
            this.tool.colorSelectedFeat(regionid, feature, this.commons.divId);
        }
        else {
            this.commons.logger.warn("Selected feature id does not exist!");
        }
    }
    ;
    highlightPosition(region, reset = true) {
        if (reset === true) {
            this.resetHighlight();
        }
        let start = this.commons.scaling(region.start - .5);
        let end = this.commons.scaling(region.end + .5);
        let selectRect;
        if (this.commons.svgContainer.node()) {
            let currentContainer = this.commons.svgContainer.node().getBoundingClientRect();
            selectRect = this.commons.svgContainer
                .select(".brush")
                .append("rect")
                .attr("class", "selectionRect box-shadow")
                .attr("height", currentContainer.height);
            selectRect
                .style("display", "block")
                .attr("width", end - start)
                .attr("transform", () => {
                return "translate(" + start + ",0)";
            });
        }
        this.lastHighlight = { type: 'single', selection: region };
    }
    highlightPositions(regions) {
        this.resetHighlight();
        for (const region of regions) {
            this.highlightPosition(region, false);
        }
        this.lastHighlight = { type: 'multi', selection: regions };
    }
    recursiveClick(f, condition) {
        if (f.isOpen === condition) {
            this.clickFlag(this.commons.yData.find(i => i.id === f.id));
            if (f.subfeatures) {
                for (const i of Object.keys(f.subfeatures)) {
                    let sf = f.subfeatures[i];
                    if (sf.isOpen === condition) {
                        this.recursiveClick(sf, condition);
                    }
                }
            }
        }
    }
    collapseAll() {
        for (const i of Object.keys(this.commons.features)) {
            this.recursiveClick(this.commons.features[i], true);
        }
    }
    expandAll() {
        for (const i of Object.keys(this.commons.features)) {
            this.recursiveClick(this.commons.features[i], false);
        }
    }
    removeResizeListener() {
        window.removeEventListener("resize", this.updateWindow);
    }
    ;
    addFeatures(featureList) {
        this.commons.viewerOptions.backup.features = featureList;
        let featureids = featureList.map(item => item.id).filter(e => { return e; });
        if (featureids.length !== featureList.length) {
            this.commons.logger.error("Feature ids are not present on all features, creating random ids", { method: 'addFeatures', fvId: this.divId });
            for (let f of featureList) {
                if (!f.id) {
                    f.id = 'customid' + Math.random().toString(36).substring(7);
                }
            }
            featureids = featureList.map(item => item.id).filter(e => { return e; });
        }
        let regexIds = new RegExp('^[a-zA-Z]');
        for (let f of featureList) {
            if (!regexIds.test(f.id)) {
                this.commons.logger.error("Id " + f.id + "is not a valid html id, substituting it randomly", { method: 'addFeatures', fvId: this.divId });
                f.id = 'customid' + Math.random().toString(36).substring(7);
            }
        }
        featureids = featureList.map(item => item.id).filter(e => { return e; });
        const uniqueIds = [...new Set(featureids)];
        if (uniqueIds.length !== featureList.length) {
            this.commons.logger.error("Feature ids are not unique, substituting the non unique ones randomly", { method: 'addFeatures', fvId: this.divId });
            let idsencountered = [];
            for (let f of featureList) {
                if (idsencountered.includes(f.id)) {
                    f.id = 'customid' + Math.random().toString(36).substring(7);
                }
                idsencountered.push(f.id);
            }
            featureids = featureList.map(item => item.id).filter(e => { return e; });
        }
        let unflatted = this.calculate.unflatten(featureList, null, null, this.commons.features.length !== 0 ? this.commons.features : null);
        this.commons.features = this.commons.features.concat(unflatted.tree);
        let ftsIds = unflatted.ids;
        this.commons.viewerOptions.maxDepth = Math.max(...this.commons.features.map(f => this.getLevel(f, 1)));
        let unprocessedIds = uniqueIds.filter((x) => {
            return !(ftsIds.has(x));
        });
        if (unprocessedIds.length !== 0) {
            this.commons.logger.error("Subfeatures with no known parentId", { method: 'addFeatures', fvId: this.divId, features: unprocessedIds });
        }
        this.commons.features = this.emptyFeatures();
        this.drawFeatures();
    }
    onRegionSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FEATURE_SELECTED_EVENT, listener);
    }
    ;
    onFeatureSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FLAG_SELECTED_EVENT, listener);
    }
    ;
    onButtonSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.TAG_SELECTED_EVENT, listener);
    }
    ;
    onZoom(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.ZOOM_EVENT, listener);
    }
    ;
    onClearSelection(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.CLEAR_SELECTION_EVENT, listener);
    }
    ;
    onAnimationOff(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.ANIMATIONS_FALSE_EVENT, listener);
    }
    ;
}
exports.FeatureViewer = FeatureViewer;
window.FeatureViewer = FeatureViewer;
//# sourceMappingURL=feature-viewer.js.map