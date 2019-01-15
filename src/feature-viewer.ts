
//import './css/feature-viewer.css';
//import css from './css/feature-viewer.css'
//import './css/tooltip.css'
//import './css/bootstrap.css'

//import * as d3 from 'd3';
import * as d3 from './custom-d3'
import {event as currentEvent} from 'd3-selection';

import {UserOptions} from './interfaces';
import {FeaturesList, FeatureObject} from './interfaces';
import Commons from './commons';
import {Transition, SubfeaturesTransition} from "./transition";
import FillSVG from "./fillsvg";
import Calculate from "./calculate";
import Tool from "./tooltip";


import * as fvstyles from './../assets/fv.scss';
//import * as fvstyles from './../assets/fv';



class FeatureViewer {

    private commons: Commons;
    private divId: string;
    private sequence: string;

    private transition: Transition;
    private subfeaturesTransition: SubfeaturesTransition;
    private fillSVG: FillSVG;
    private calculate: Calculate;
    private tool: Tool;


    private parseUserOptions(options: UserOptions): void {

        const simple_keys = [
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

        for (let key of simple_keys) {
            if (options && key in options) {
                this.commons.viewerOptions[key] = options[key];
            }
        }

        this.commons.viewerOptions.offset = {start: 0, end: this.commons.fvLength + 1};
        if (options && options.offset) {
            this.commons.viewerOptions.offset = options.offset;
            if (options.offset.start < 1) {
                this.commons.viewerOptions.offset.start = 1;
                console.warn("WARNING ! offset.start should be > 0. Thus, it has been reset to 1.");
            }
        }

        if (!options.unit) {
            this.commons.viewerOptions.unit = "units";
        } else {
            this.commons.viewerOptions.unit = options.unit;
        }

        if (options.animation) {
            this.commons.animation = options.animation;
        }

        this.commons.viewerOptions.tagsTrackWidth = 0;
        if (options && options.buttonTrack) {
            if (typeof options.buttonTrack === 'string') {
                this.commons.viewerOptions.tagsTrackWidth = Number(options.buttonTrack.match(/[0-9]+/g)[0]);
            } else if (typeof  options.buttonTrack === 'number') {
                this.commons.viewerOptions.tagsTrackWidth = options.buttonTrack;
            } else if (typeof  options.buttonTrack === 'boolean') {
                if (options.buttonTrack) {
                    this.commons.viewerOptions.tagsTrackWidth = 100;
                } else {
                    this.commons.viewerOptions.tagsTrackWidth = 0;
                }
            } else {
                this.commons.viewerOptions.tagsTrackWidth = 100;
                console.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`)
            }
        }
        this.commons.viewerOptions.backup.tagsTrackWidth = this.commons.viewerOptions.tagsTrackWidth;

        this.commons.viewerOptions.labelTrackWidth = 200;
        if (options && options.flagTrack) {
            if (typeof options.flagTrack === 'string') {
                this.commons.viewerOptions.labelTrackWidth = Number(options.flagTrack.match(/[0-9]+/g)[0]);
            } else if (typeof  options.flagTrack === 'number') {
                this.commons.viewerOptions.labelTrackWidth = options.flagTrack;
            } else if (typeof  options.flagTrack === 'boolean') {
                this.commons.viewerOptions.labelTrackWidth = 200;
            } else {
                this.commons.viewerOptions.labelTrackWidth = 200;
                console.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`)
            }
        }
        this.commons.viewerOptions.backup.labelTrackWidth = this.commons.viewerOptions.labelTrackWidth;

        this.commons.viewerOptions.margin = {
            top: 10,
            bottom: 20,
            left: this.commons.viewerOptions.labelTrackWidth,
            right: this.commons.viewerOptions.tagsTrackWidth
        };

        // resize if width < 480, initial view
        // let totalwidth = d3.select(`#${this.divId}`).node().getBoundingClientRect().width;
        let myd3node = d3.select(`#${this.divId}`).node();
        let totalwidth = (<HTMLElement>myd3node).getBoundingClientRect().width;
        if (totalwidth < this.commons.mobilesize) {
            this.commons.viewerOptions.mobileMode = true;
            this.commons.viewerOptions.margin.left = 40;
            if (this.commons.viewerOptions.tagsTrackWidth !== 0) {
                this.commons.viewerOptions.margin.right = 80
            };
        }

        // this.commons.viewerOptions.width = d3.select(`#${this.divId}`).node().getBoundingClientRect().width - this.commons.viewerOptions.margin.left - this.commons.viewerOptions.margin.right - 17;
        let myvod3node = d3.select(`#${this.divId}`).node();
        this.commons.viewerOptions.width = (<HTMLElement>myvod3node).getBoundingClientRect().width;
        this.commons.viewerOptions.height = 600 - this.commons.viewerOptions.margin.top - this.commons.viewerOptions.margin.bottom;

    };

    private displaySequence = function (seq) {
        // checks if dotted sequence or letters
        return this.commons.viewerOptions.width / seq > 5;
    };

    private addXAxis(position) {
        this.commons.svgContainer.append("g")
            .attr("class", "x axis XAxis")
            .attr("transform", "translate(0," + (position + 20) + ")")
            .call(this.commons.xAxis);
        if (!this.commons.viewerOptions.showAxis) {
            d3.select(`#${this.divId}`).selectAll(".tick")
                .attr("display", "none")
        }
    };

    private updateXAxis(position) {
        this.commons.svgContainer.selectAll(".XAxis")
            .attr("transform", "translate(0," + (position + this.commons.step) + ")");
    };

    private updateSVGHeight(position) {
        this.commons.svg.attr("height", position + 60 + "px");
        this.commons.svg.select("clipPath rect").attr("height", position + 60 + "px");
    };

    private addYAxis() {
        // flags box
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

    private updateYAxis() {

        // "on click" function (clickFlagFunction) both attribute of text and flag
        // unique ids
        this.commons.yAxisSVGGroup = this.commons.yAxisSVG
            .selectAll(".yAxis")
            .data(this.commons.yData)
            .enter()
            .append("g")
            .attr("id", function (d) {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                if (d.title === "Sequence") {
                    return 'sequence'
                } else {
                    return d.featureId
                }
            })
            .attr("class", "flag")
            .on('click', (d) => {
                if (this.commons.viewerOptions.showSubFeatures && d.flagLevel === 1 && d.hasSubFeatures) {
                    this.clickFlagFunction(d)
                }
            })
            .call(this.commons.d3helper.flagTooltip());
            //.call(d3.helper.genericTooltip({}));
        this.commons.yAxisSVGGroup
            .append("polygon") // attach a polygon
            .attr("class", "boxshadow Arrow")
            .style("stroke", (d) => {
                if (d.flagColor) return d.flagColor;
                return this.commons.viewerOptions.flagColor // or flagColor
            }) // colour the border if selected
            .attr("points", (d) => {
                // match points with subFeature level
                return this.calculate.yxPoints(d)
            })
            .style("fill", (d) => {
                // if (d.filter && d.filter == "subFeature") return flagColor; // change here if you want different color for subFeatures
                if (d.flagColor) return d.flagColor;
                return this.commons.viewerOptions.flagColor // or flagColor
            });

        let myobj = this.commons.yAxisSVGGroup
            /*.append("g")
            .attr("x", 0)
            .attr("y", function (d) {
                // vertical flag placement
                return d.y - 12;
            })
            .attr("id", "chevron")
            .html((d) => {
                if (d.hasSubFeatures) {
                    return this.commons.right_chevron
                } else {
                    return ''
                }
            })*/
            .append("foreignObject")
            .attr("x", 4)
            .attr("y", function (d) {
                // vertical flag placement
                return d.y - 4;
            })
            .attr("width", 30)
            .attr("height", 30)
            .attr("id", "chevron")
            //.append('xhtml:body')
            .html((d) => {
                if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                    return this.commons.right_chevron
                } else {
                    return ''
                }
            });


        this.commons.yAxisSVGGroup
            .append("text")
            .attr("class", "yAxis")
            .attr("font-family", "Roboto")
            .style("display", (d) => {
                // text only if space is enough
                if (this.commons.viewerOptions.mobileMode) {
                    return "none";
                } else {
                    return "block";
                }
            })
            .attr("x", (d) => {
                let cvm = 0;
                if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                    // chevron margin
                    cvm = 22;
                }
                // horizontal flag placement
                this.commons.headMargin = 0;
                if (d.flagLevel) {
                    this.commons.headMargin = 20 * (d.flagLevel - 1);
                    return cvm + this.commons.headMargin + 8;
                } else {
                    return cvm + 8
                }
            })
            .attr("y", function (d) {
                // vertical flag placement
                return d.y + 12
            })
            .text((d) => {
                // text only if space is enough
                return d.title;
            });
    };

    private loadingFlag(id) {
        // animation 'pulse' while loading subFeatures after clicking
        d3.select(`#${this.divId}`).select(`#${id}`)
            .attr("class", "loading");
    };

    private clickFlagFunction(d) {

        // dispatches selected flag event
        let id = d.featureId;
        // show animation in flag
        this.loadingFlag(id);
        let flag_detail_object = {
            points: this.calculate.yxPoints(d),
            y: d.y,
            featureId: d.featureId,
            id: d.title,
            flagLevel: d.flagLevel
        };
        // trigger flag_selected event
        if (CustomEvent) {
            let eventDetail = {detail: flag_detail_object},
                event = new CustomEvent(this.commons.events.FLAG_SELECTED_EVENT, eventDetail);

            this.commons.flagSelected.push(flag_detail_object.featureId);
            this.commons.svgElement.dispatchEvent(event);

        } else {
            console.warn("CustomEvent is not defined....");
        }

        if (this.commons.trigger) this.commons.trigger(this.commons.events.FLAG_SELECTED_EVENT, flag_detail_object);
    };

    private resizeBrush() {

        let rectArea = this.commons.svgContainer.node().getBoundingClientRect();
        let thisbrush = this.commons.svgContainer.select(".brush");
        thisbrush.selectAll("rect")
            .attr('height', rectArea.height)
            .attr('width', rectArea.width);
    };

    private addBrush() {

        this.commons.svgContainer
            .append("g")
            .attr("class", "brush")
            .call(this.commons.brush)
        //.call(this.commons.brush.move, this.commons.scaling());
        this.resizeBrush()

    };

    private brushend() {

        // remove selected features
        if (this.commons.featureSelected) {
            d3.select(`#${this.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
            this.commons.featureSelected = null;
        }
        // remove selection rectangle
        d3.select(`#${this.divId}`).select(".selectionRect").remove();

        if (currentEvent.sourceEvent !== null && typeof currentEvent.sourceEvent.target !== "function") {

            // ZOOMING CASE & REZISING FOR BUTTONS
            // zoom: mouseup & Object (removed with check currentEvent.sourceEvent.target !== "function")
            // resizing for buttons: click
            let zoomScale;

            // d3 v4
            this.commons.extent = currentEvent.selection;
            if (this.commons.extent) { // zooming

                let borders = [this.commons.extent[0], this.commons.extent[1]].map(this.commons.scaling.invert, this.commons.scaling);
                let start = Math.round(Number(borders[0])),
                    end = Math.round(Number(borders[1]));
                if (start < 0) {
                    start = 0
                }
                let extentLength = end - start;
                let seqCheck = this.displaySequence(extentLength);

                if (extentLength > this.commons.viewerOptions.zoomMax) {

                    this.commons.current_extend = {
                        length: extentLength,
                        start: start,
                        end: end
                    };

                    // variables for logger
                    zoomScale = (this.commons.fvLength / extentLength).toFixed(1);
                    d3.select(`#${this.divId}`).select(".zoomUnit")
                        .text(zoomScale.toString());

                    //modify scale
                    this.commons.scaling.domain([start, end]);
                    this.commons.scalingPosition.range([start, end]);

                    let currentShift = start ? start : this.commons.viewerOptions.offset.start;

                    // apply transitions
                    this.transition_data(this.commons.features, currentShift);
                    this.reset_axis();

                    // remove sequence
                    this.commons.svgContainer.selectAll(".mySequence").remove();
                    // draw sequence
                    if (this.commons.viewerOptions.showSequence) {
                        if (seqCheck === false) {
                            this.fillSVG.sequenceLine();
                        }
                        else if (seqCheck === true) {
                            this.commons.seqShift = start;
                            this.fillSVG.sequence(this.sequence.substring(start, end), this.commons.seqShift);
                        }
                    }

                } else {

                    zoomScale = "Prevented";
                    console.warn("Zoom greater than " + this.commons.viewerOptions.zoomMax + " is prevented")
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
                if (this.commons.trigger) this.commons.trigger(this.commons.events.ZOOM_EVENT, {
                    start: start,
                    end: end,
                    zoom: zoomScale
                });
            }

            // remove brush now that transition is complete
            d3.select(`#${this.divId}`).select(".brush").call(this.commons.brush.move, null);

        } else {
            return
        }


    }

    private resizeForMobile() {
        let flags = d3.select(`#${this.divId}`).selectAll(".Arrow")
            .attr("points", (d) => {
                // match points with subFeature level
                return this.calculate.yxPoints(d)
            });
        this.commons.yAxisSVG.select(".flagBackground").attr("width", this.commons.viewerOptions.margin.left);
        let flags_text = d3.select(`#${this.divId}`).selectAll(".yAxis")
            .style("display", (d) => {
                // text only if space is enough
                if (this.commons.viewerOptions.mobileMode) {
                    return "none";
                } else {
                    return "block";
                }
            });
        // background containers, update width
        this.commons.svgContainer.attr("transform", "translate(" + (this.commons.viewerOptions.margin.left).toString() + ",10)");
        this.commons.tagsContainer.attr("transform","translate(" + (this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left) + "," + this.commons.viewerOptions.margin.top + ")")
    }

    private updateWindow() {

        // change width now
        // let totalwidth = d3.select(`#${this.divId}`).node().getBoundingClientRect().width;
        let myd3node = d3.select(`#${this.divId}`).node();
        let totalwidth = (<HTMLElement>myd3node).getBoundingClientRect().width;

        if (totalwidth < this.commons.mobilesize) {
            if (!this.commons.viewerOptions.mobileMode) {
                this.commons.viewerOptions.mobileMode = true;
                this.commons.viewerOptions.margin.left = 40;
                if (this.commons.viewerOptions.tagsTrackWidth !== 0) {
                    this.commons.viewerOptions.margin.right = 80
                };
                // resize for mobile
                this.resizeForMobile();
            }
        } else {
            if (this.commons.viewerOptions.mobileMode) {
                this.commons.viewerOptions.mobileMode = false;
                this.commons.viewerOptions.margin.left = this.commons.viewerOptions.labelTrackWidth;
                this.commons.viewerOptions.margin.right = this.commons.viewerOptions.tagsTrackWidth;
                // resize back to options
                this.resizeForMobile();
            }
        }

        this.commons.viewerOptions.width = totalwidth - this.commons.viewerOptions.margin.left - this.commons.viewerOptions.margin.right - 17;

        this.commons.svg
            .attr("width", totalwidth);
        this.commons.svg.select("clipPath rect")
            .attr("width", this.commons.viewerOptions.width);
        if (this.commons.viewerOptions.brushActive) {
            d3.select(`${this.divId} .background`).attr("width", this.commons.viewerOptions.width - 10);
        }

        // d3 v4
        d3.select(`#${this.divId}`).selectAll(".brush").call(this.commons.brush.move, null);

        this.commons.scaling.range([2, this.commons.viewerOptions.width - 2]);
        this.commons.scalingPosition.domain([0, this.commons.viewerOptions.width]);


        let seq = this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);
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
            d3.select(`#${this.divId}`).select('#tags_container')
                .transition().duration(500)
        }
        d3.select(`#${this.divId}`).select('#tags_container')
            .attr("transform", "translate(" + (this.commons.viewerOptions.margin.left + this.commons.viewerOptions.width).toString() + ",10)");


        this.transition_data(this.commons.features, this.commons.current_extend.start);
        this.reset_axis();
        this.resizeBrush()

    }

    private resetAll() {

        // remove selected features
        if (this.commons.featureSelected) {
            d3.select(`#${this.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
            this.commons.featureSelected = null;
        }

        // remove selection rectangle
        d3.select(`#${this.divId}`).select(".selectionRect").remove();

        //reset scale
        d3.select(`#${this.divId}`).select(".zoomUnit").text("1");
        this.commons.scaling.domain([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        this.commons.scalingPosition.range([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);
        let seq = this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);

        d3.select(`#${this.divId}`).select(".brush").call(this.commons.brush.move, null);

        // remove sequence
        this.commons.svgContainer.selectAll(".mySequence").remove();

        // draw sequence
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

        // Fire Event
        if (CustomEvent) {
            this.commons.svgElement.dispatchEvent(new CustomEvent(this.commons.events.ZOOM_EVENT, {
                detail: {
                    start: 1,
                    end: this.sequence.length-1,
                    zoom: 1
                }
            }));
        }
        if (this.commons.trigger) this.commons.trigger(this.commons.events.ZOOM_EVENT, {
            start: 1,
            end: this.sequence.length-1,
            zoom: 1
        });
    }

    private transition_data(features, start) {
        features.forEach(o => {
            if (o.type === "rect") {
                this.transition.rectangle(o);
            } else if (o.type === "multipleRect") {
                this.transition.multiRec(o);
            } else if (o.type === "unique") {
                this.transition.unique(o);
            } else if (o.type === "circle") {
                this.transition.circle(o);
            } else if (o.type === "path") {
                this.transition.path(o);
            } else if (o.type === "curve") {
                this.transition.lineTransition(o);
            }
            // resize basal line too
            this.transition.basalLine(o);
        });
    }

    private reset_axis() {
        if (this.commons.animation) {
            this.commons.svgContainer.transition().duration(500);
        }
        this.commons.svgContainer
            .select(".x.axis")
            .call(this.commons.xAxis);
    }

    private addVerticalLine() {
        let vertical = d3.select(`#${this.divId}`).select(".chart")
            .append("div")
            .attr("class", "VLine")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", (this.commons.YPosition + 50) + "px")
            .style("top", "30px")
            // .style("left", "0px")
            .style("background", "#000");

        // uncompatible with d3 types
        /*d3.select(`#${this.divId}`).select(".chart")
            .on("mousemove.VLine", function () {
                let mouseX = d3.mouse(this)[0] - 2;
                // let mouseX = d3.mouse(this)[0] - 2;
                vertical.style("left", mouseX + "px")
            });*/


        //.on("click", function(){
        //    mouseX = d3.mouse(this);
        //    mouseX = mouseX[0] + 5;
        //    vertical.style("left", mouseX + "px")});
    }

    private resizeForButtons() {
        this.commons.viewerOptions.tagsTrackWidth = 55 + 15 * this.commons.maxNumberOfButtons + 10; // length of disorder content tag + 15 px for each button + 10 px of margin
        this.commons.viewerOptions.margin.right = this.commons.viewerOptions.tagsTrackWidth;
        this.updateWindow()
    };

    private init(div) {

        // first element is 0
        this.sequence = " " + this.sequence;
        this.commons.stringSequence = this.sequence;

        d3.select(div)
            .style("position", "relative")
            .style("padding", "0px")
            .style("z-index", "2");

        this.commons.scaling = d3.scaleLinear()
            .domain([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end])
            .range([0, this.commons.viewerOptions.width]); // borders

        this.commons.scalingPosition = d3.scaleLinear()
            .domain([0, this.commons.viewerOptions.width])
            .range([this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end]);

        // init objects

        this.tool.initTooltip(div, this.divId);

        this.commons.lineBond = d3.line()
            .curve(d3.curveStepBefore)
            .x((d) => {
                return this.commons.scaling(d['x']);
                // return this.commons.scaling(d[0]);
                // return this.commons.scaling(d[0].x);
            })
            .y((d) => {
                //return -d[1] * 10 + this.commons.pathLevel;
                return -d['y'] * 10 + this.commons.pathLevel;
                // return -(d[0] as any).y * 10 + this.commons.pathLevel;
            });

        this.commons.lineGen = d3.line()
            .x((d) => {
                // return this.commons.scaling(d[0]);
                return this.commons.scaling(d['x']);
                // return this.commons.scaling((d[0] as any).x);
            })
            .curve(d3.curveBasis);

        this.commons.lineYScale = d3.scaleLinear()
            .domain([0, -30])
            .range([0, -20]);

        this.commons.line = d3.line()
            .curve(d3.curveLinear)
            .x((d) => {
                // return this.commons.scaling(d[0]);
                return this.commons.scaling(d['x']);
                // return this.commons.scaling((d[0] as any).x);
            })
            .y((d) => {
                // return d[1] + 6;
                return d['y'] + 6;
                //return (d[0] as any).y + 6;
            });

        let rtickStep = Math.round(this.commons.fvLength/10); // fraction of a tenth
        let tickStep = Math.round(rtickStep/10)*10; // nearest 10th multiple

        let tickArray = Array.apply(null, {length: this.commons.fvLength}).map(Number.call, Number).filter(function (value, index, ar) {
            return (index % tickStep == 0 && index !== 0);
        } );

        //Create Axis
        this.commons.xAxis = d3.axisBottom(this.commons.scaling)
            .tickValues(tickArray)
            //.scale(this.commons.scaling) // TODO
            //.tickFormat(d3.format("d"));

        let yAxisScale = d3.scaleBand()
            //.domain([0, this.commons.yData.length])
            .rangeRound([0, 500]);

        // Y Axis
        d3.axisLeft(yAxisScale)
            //.scale(yAxisScale) // TODO
            //.tickValues(this.commons.yData)
            .tickFormat(function (d) {
                return d
            });

        this.commons.brush = d3.brushX()
            .extent([[this.commons.scaling.range()[0], 0], [this.commons.scaling.range()[1], 1]])
            .on("end", () => {
                this.brushend()
            });

        /*this.commons.zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);*/

        /*let triangle = '<polygon points="5,57,5,78,235,78,243,69,235,57" style="stroke: rgb(223, 213, 245); fill: rgb(223, 213, 0);"></polygon>';
        let translated_triangle = '<polyline points="5,57,5,78,235,78,243,69,235,57" transform="rotate(45deg)" style="stroke: rgb(223, 213, 245); fill: rgb(223, 213, 0);"></polyline>';*/

        this.commons.right_chevron = '<i class="materialicons">keyboard_arrow_right</i>';
        this.commons.down_chevron = '<i class="materialicons">keyboard_arrow_down</i>';

        // Define the div for the tooltip
        this.commons.tooltipDiv = d3.select(`#${this.divId}`)
            .append("div")
            .attr("class", "fvtooltip")
            .attr("id", "fvtooltip")
            .style("opacity", 0);

        this.commons.style = d3.select(`#${this.divId}`)
            .append("style")
            .html(`${fvstyles}`)
        // <style>${fvstyles}</style>
        // `<style>${fvstyles}</style>`


        // Create SVG
        if (this.commons.viewerOptions.toolbar) {

            let headerOptions = document.querySelector(div + " .svgHeader") ? d3.select(div + " .svgHeader") : d3.select(div).append("div").attr("class", "svgHeader");

            if (!document.querySelector(div + ' .header-position')) {

                let headerPosition = headerOptions
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

            let headerZoom;
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

                    let headerHelp = headerOptions
                        .append("div")
                        .attr("class", "header-help")
                        .style("display", "inline-block")
                        .style("margin", "0px")
                        .style("margin-right", "5px")
                        .style("padding-right", "10px")
                        .style("bottom", "0")
                        .style("float", "right");



                    let downloadhtml = '<button id="downloadButton" class="mybutton mybuttonsquare" style="cursor:pointer"><md-icon class="materialicons">file_download</md-icon></button>';
                    let downloadHelp = headerHelp
                        .append("g")
                        .append('foreignObject')
                        .call(this.commons.d3helper.genericTooltip("Download SVG"))
                        .style("display", "inline-block")
                        .append('xhtml:body')
                        .html(downloadhtml);

                    let helphtml = '<button id="helpButton" class="mybutton mybuttoncircle"><md-icon class="materialicons">help_outline</md-icon></button>';
                    let buttonHelp = headerHelp
                        .append("g")
                        .append('foreignObject')
                        .call(this.commons.d3helper.genericTooltip("Show help"))
                        .style("display", "inline-block")
                        .style("padding-left", "4px")
                        .append('xhtml:body')
                        .html(helphtml);

                    downloadHelp
                        .on("click", () => {
                            this.downloadSVG()
                        });

                    buttonHelp
                        .on("click", () => {
                            this.showHelp()
                        });

                }
            }
        }

        this.commons.svg = d3.select(div).append("svg")
            .attr("width", this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left + this.commons.viewerOptions.margin.right)
            .attr("height", this.commons.viewerOptions.height + this.commons.viewerOptions.margin.top + this.commons.viewerOptions.margin.bottom)
            .style("z-index", "2")
            .attr("id", "svgContent")
            .on("contextmenu", (d, i) => {
                //currentEvent.preventDefault();
                this.resetAll();
                // react on right-clicking
                if (CustomEvent) {
                    let event = new CustomEvent(this.commons.events.CLEAR_SELECTION_EVENT, {detail: {}});
                    this.commons.svgElement.dispatchEvent(event);
                } else {
                    console.warn("CustomEvent is not defined....");
                }
                if (this.commons.trigger) this.commons.trigger(this.commons.events.CLEAR_SELECTION_EVENT);
            });

        // this.commons.svgElement = document.querySelector("svg")[0];
        this.commons.svgElement = d3.select(`#${this.divId}`).select('svg').node();

        // features track box
        this.commons.svgContainer = this.commons.svg
            .append("g")
            .attr("transform", "translate(" + this.commons.viewerOptions.margin.left + "," + this.commons.viewerOptions.margin.top + ")")
            .attr("id", "tracks_container")
            // prevent right-click
            .on("contextmenu", function (d, i) {
                currentEvent.preventDefault();
                // react on right-clicking
            });

        // tags space
        this.commons.tagsContainer = this.commons.svg.append("g")
            .attr("transform", "translate(" + (this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left) + "," + this.commons.viewerOptions.margin.top + ")")
            .attr("id", "tags_container");

        if (this.commons.viewerOptions.buttonTrack) {
            // only if buttontrack
            this.commons.tagsContainer.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white");
        }

        //Create Clip-Path
        // TODO: work on this for shadow
        /*let defs = this.commons.svgContainer.append("defs");

        defs.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", this.commons.viewerOptions.width)
            .attr("height", this.commons.viewerOptions.height);

        let filter = defs.append("filter")
            .attr("id", "dropShadow")
            .attr("height", "200%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", -2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");

        let feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");*/

        this.commons.svgContainer.on('mousemove', () => {
            // let absoluteMousePos = this.commons.viewerOptions.brushActive ? d3.mouse(d3.select(".brush").node()) : d3.mouse(this.commons.svgContainer.node()); // TODO
            let absoluteMousePos = d3.mouse(this.commons.svgContainer.node());

            let posN = Math.round(this.commons.scalingPosition(absoluteMousePos[0]));
            let pos;
            if (!this.commons.viewerOptions.positionWithoutLetter) {
                pos = `${posN}${this.sequence[posN] || ""}`;
            } else {
                pos = posN.toString();
            }

            // d3.select(`${this.divId} #zoomPosition`).text(pos);
            document.querySelector(`#${this.divId} #zoomPosition`).innerHTML = pos;
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
                label: "Sequence",
                className: "AA",
                color: "black",
                type: "sequence",
                featureId: "sequence"
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
            // this.commons.viewerOptions.brushActive = true;
            this.addBrush();
        }
        if (this.commons.viewerOptions.verticalLine) {
            // this.commons.viewerOptions.verticalLine = true;
            this.addVerticalLine();
        }

        this.updateSVGHeight(this.commons.YPosition);

        // listen to resizing
        window.addEventListener("resize", this.resizeListener);

    }

    private resizeListener = () => {
        this.updateWindow()
    };

    private getTransformation(transform) {
        // Create a dummy g for calculation purposes only. This will never
        // be appended to the DOM and will be discarded once this function
        // returns.
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Set the transform attribute to the provided string value.
        g.setAttributeNS(null, "transform", transform);

        // consolidate the SVGTransformList containing all transformations
        // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
        // its SVGMatrix.
        var matrix = g.transform.baseVal.consolidate().matrix;

        // Below calculations are taken and adapted from the private function
        // transform/decompose.js of D3's module d3-interpolate.
        var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
        // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
        var scaleX, scaleY, skewX;
        if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
        if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
        if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
        if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
        return {
            translateX: e,
            translateY: f,
            rotate: Math.atan2(b, a) * 180 / Math.PI,
            skewX: Math.atan(skewX) * 180 / Math.PI,
            scaleX: scaleX,
            scaleY: scaleY
        };
    }

    private addFeatureCore(object, flagLevel = 1, position = null) {

        this.commons.YPosition += this.commons.step;

        // deselect it
        if (!object.subFeaturesOn) {
            object.subFeaturesOn = false;
        }
        if (this.commons.animation && this.commons.features.length > 80) {
            this.commons.animation = false;
            if (CustomEvent) {
                let event = new CustomEvent(this.commons.events.ANIMATIONS_FALSE_EVENT, {detail: {}});
                this.commons.svgElement.dispatchEvent(event);
            } else {
                console.warn("CustomEvent is not defined....");
            }
            if (this.commons.trigger) this.commons.trigger(this.commons.events.ANIMATIONS_FALSE_EVENT);
        };
        

        if (!object.className) {
            object.className = object.type + "fv";
        }
        if (!object.color) {
            object.color = "lightgrey";
        }

        // check number of links and update tagsTrackWidth accordingly
        // not disabled, fixed size
        /*if (object.links) {
            this.commons.viewerOptions.showLinkTag = true;
            if (object.links.length > this.commons.maxNumberOfButtons) {
                this.commons.maxNumberOfButtons = object.links.length;
                this.resizeForButtons()
            }
        }*/

        //object.height = this.commons.elementHeight;
        object.flagLevel = flagLevel;

        if (!object.featureId) {
            object.featureId = 'f' + Math.random().toString(36).substring(7);
        }
        if (position) {
            this.commons.features.splice(position, 0, object);
        } else {
            this.commons.features.push(object);
        }

        // chack feature order
        //var order = this.commons.features.map(function(a) {return a['name'];});

        this.fillSVG.typeIdentifier(object);
        // flags
        this.updateYAxis();
        if (object.type === "curve" || object.type === "path") {
            this.updateWindow();
        }
        // updating subfeatures updateXaxis should not be done here
        // it is done by feature_transition_dat

    }

    private draw_subfeatures(parentRowY, subfeatures, parent, parentPos) {
        // add subfeatures
        this.commons.YPosition = parentRowY;
        subfeatures.forEach(subf => {
            this.addFeatureCore(subf, parent['flagLevel'] + 1, parentPos)
        });
        // this.commons.YPosition += this.commons.step;
        let height = this.commons.YPosition - parentRowY;
        return height
        // this.commons.YPosition += 5;
    }

    private remove_subfeatures_data(parentRowY, parentPos, parent) {

        // reload all features
        // retrieve feature details
        // identify all children
        let checkButtons = false;
        let checkCurve = false;
        let totalHeigth = 0,
            tranformedY;
        for (let i = parentPos + 1; i < this.commons.features.length; i++) {

            let childfeat = this.commons.features[i];
            if (!checkCurve && (childfeat['type'] === "curve" || childfeat['type'] === "path")) {
                checkCurve = true;
                totalHeigth += childfeat['height']
            };
            if (childfeat['links'] && childfeat['links'].length >= this.commons.maxNumberOfButtons) {
                checkButtons = true
            };

            if (childfeat['flagLevel'] > parent['flagLevel']) {

                let featureId = childfeat['featureId'];

                // remove from feature array and from html
                d3.select(`#t${featureId}_tagarea`).remove();
                d3.select(`#c${featureId}_container`).remove();
                d3.select(`#${featureId}`).remove();

                this.commons.features.splice(i, 1);
                this.commons.yData.splice(i, 1);
                i--; // decrement index to handle array size changes
            } else {
                break
            }
        }

        let height = this.commons.YPosition - parentRowY;
        return height

    }

    private feature_transition_data(featuresToMove, start) {

        featuresToMove.forEach(f => {
            let feature_id = f['featureId'];
            // once for each feature

            // area with buttons
            let parentElementTagArea = d3.select(`#t${feature_id}_tagarea`);
            let currentTagY = this.getTransformation(parentElementTagArea.attr("transform")).translateY;
            this.subfeaturesTransition.area(parentElementTagArea, currentTagY + start);

            // features container
            let parentElementRow = d3.select(`#c${feature_id}_container`);
            let currentRowY = this.getTransformation(parentElementRow.attr("transform")).translateY;
            this.subfeaturesTransition.area(parentElementRow, currentRowY + start);

            // feature flag
            // flag should always be at features container height
            let parentElementFlag = d3.select(`#${feature_id}`);
            let currentParentY = 0;
            if (parentElementFlag.attr("transform")) {
                currentParentY = this.getTransformation(parentElementFlag.attr("transform")).translateY;
            }
            this.subfeaturesTransition.area(parentElementFlag, currentParentY + start);
        });

        // now, transitions to be applied once

        // transit axis too
        let axis = d3.select(`#${this.divId} .XAxis`);
        let currentAxisY = this.getTransformation(axis.attr("transform")).translateY;
        // transition of xaxis is slightly less
        this.subfeaturesTransition.Xaxis(axis, currentAxisY + start);

        // transit svgContent
        let container = d3.select(`#${this.divId} #svgContent`);
        let currentContainerH = (<HTMLElement>container.node()).getBoundingClientRect().height;
        this.subfeaturesTransition.containerH(container, currentContainerH + start);

        // final updates based on svg heigth
        if (this.commons.viewerOptions.brushActive) {
            this.commons.svgContainer.selectAll(".brush rect")
                .attr('height', currentContainerH);
        }
        if (this.commons.viewerOptions.verticalLine) d3.selectAll(".VLine").style("height", (currentContainerH) + "px");

    };

    private showHelp() {

        /*let helpContent = "<div><strong>To zoom in :</strong> Left click to select area of interest</div>" +
            "<div><strong>To zoom out :</strong> Right click to reset the scale</div>" +
            "<div><strong>Zoom max  :</strong> Limited to <strong>" + this.commons.zoomMax.toString() + " " + this.commons.viewerOptions.unit + "</strong></div>";*/
        let helpContent = "To zoom in : Left click to select area of interest\n To zoom out : Right click to reset the scale\n Zoom max : Limited to" +
            this.commons.viewerOptions.zoomMax.toString() + " " + this.commons.viewerOptions.unit

        alert(helpContent)
    }

    private downloadSVG() {

        function clone(svg_el) {
            let clone = svg_el.node().appendChild(this.cloneNode(true));
            return d3.select(clone).attr("class", "clone");
        }

        let width = 500,
            height = 500,
            filename = "download_fv.png";

        // serialize our SVG XML to a string.
        // let svg_el = d3.select(`#${this.divId}`).select("#svgContent");
        let svg_el = this.commons.svgContainer.getElementsById("#svgContent");
        // temporarily remove foreingobject area
        let tagarea = svg_el.select("#tags_container").remove();
        let foreingobjects = svg_el.select("#chevron").remove();
        // workaround: exclude tags container while serializing object, then append it again
        let source = (new XMLSerializer()).serializeToString(svg_el.node());
        // restore removed parts
        svg_el.node().append(tagarea.node());
        svg_el.node().append(foreingobjects.node());


        let svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
        let svgUrl = URL.createObjectURL(svgBlob);
        let downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "download.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }


    /**
     * @function
     * @methodOf FeatureViewer
     * @name onFeatureSelected
     * @return {object} Object describing the selected feature */
    public onFeatureSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FEATURE_SELECTED_EVENT, listener);
    };

    public removeResizeListener() {
        window.removeEventListener("resize", this.resizeListener);
    };

    // edit: listener of selected flag
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onFlagSelected
     * @description Expected usage: once flag is selected, addSubFeature()
     * @return {object} Object describing the selected flag */
    public onFlagSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FLAG_SELECTED_EVENT, listener);
    };

    /**
     * @function
     * @methodOf FeatureViewer
     * @name onButtonSelected
     * @return {object} Object describing the selected 3D button */
    public onButtonSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.TAG_SELECTED_EVENT, listener);
    };

    /**
     * @function
     * @methodOf FeatureViewer
     * @name onZoom
     * @return {object} Object describing the zoom event */
    public onZoom(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.ZOOM_EVENT, listener);
    };

    // edit: listener of clear selection
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onClearSelection
     * @return {object} Object describing the zoom out/clear selection event */
    public onClearSelection(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.CLEAR_SELECTION_EVENT, listener);
    };

    // edit: listener of animation off
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onAnimationOff
     * @return {object} Object describing the zoom out/clear selection event */
    public onAnimationOff(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.ANIMATIONS_FALSE_EVENT, listener);
    };

    /**
     * @function
     * @methodOf FeatureViewer
     * @name stopFlagLoading
     * @description interrupts loading of a selected flag
     * @param {string} id - The flag title, <output of onFlagSelected>.detail.id
     */
    public stopFlagLoading = function (id) {
        /*document.getElementById(id).setAttribute("class", "flag");
        // change text icon
        d3.select(`#${id}`).selectAll('text')
            .text(function (d) {
                let mygliph = '\ue080'; // right
                return mygliph + '\u0020' + d.title;
            });*/
        console.warn("Loading of flag", id, "was interrupted");
    };

    // function to call resize from external
    /**
     * @function
     * @methodOf FeatureViewer
     * @name resizeViewer
     * @description resizes viewer if element dimensions are changed. Please note: resizing is automatic when window changes, call this function when other elements change
     */
    public resizeViewer = function () {
        this.updateWindow()
    };

    /**
     * @function
     * @methodOf FeatureViewer
     * @name resetZoom
     * @description resets viewer zoom
     */
        // this.resetZoom = function (start, end) {
    public resetZoom = function () {
        this.resetAll();
    };

    /**
     * @function
     * @methodOf FeatureViewer
     * @name addFeature
     * @param {object} object - The input feature
     * @param {number} flagLevel - The indent level for rendering flag
     * @property {Array<object>} feature.data
     * @property {int} feature.data.<Object>.x - first position
     * @property {int} feature.data.<Object>.y - last position (or a value for features of type "curve")
     * @property {string} [feature.data.<Object>.id] - id
     * @property {string} [feature.data.<Object>.description] - description
     * @property {string} [feature.data.<Object>.color] - color
     * @property {string} [feature.data.<Object>.tooltip] - message for the region tooltip
     * @property {string} feature.type -  ("rect","curve","unique","circle") : The type of feature, for a specific rendering
     * @property {string} [feature.name] - The name of theses features, which will be display as a label on the Y-axis
     * @property {string} [feature.className] - a class name, for further personal computing
     * @property {int} [feature.height] - height of the feature
     * @property {string} [feature.color] - The color of the features
     * @property {boolean} [feature.hasSubFeatures] - determines if object is clickable and expands for subFeature visualization
     * @property {string} [feature.filter] - a class filter, for further personal computing
     * @property {number} [feature.disorderContent] - content of disorder content tag (right side of viewer)
     * @property {number} [feature.tooltip] - message for the flag tooltip
     * @property {Array<object>} [feature.links]
     * @property {string} [feature.links.<Object>.name] - The button name, used to identify click event
     * @property {string} [feature.links.<Object>.icon]  - Glyphicon code or text, specify glyphicon in unicode format, ex. \ue030
     * @property {string} [feature.links.<Object>.message] - The message for tooltip
     * @property {string} [feature.links.<Object>.color] - Optional color for the visualized glyphicon
     */
    // TODO: path currently not supported
    public addFeature(object, flagLevel = 1) {

        this.addFeatureCore(object, flagLevel);
        // check presence of both hasSubfeatures and hasChildren
        if (this.commons.viewerOptions.showSubFeatures && object.hasSubFeatures) { object.hasChildren === true }
        this.updateXAxis(this.commons.YPosition);
        this.updateSVGHeight(this.commons.YPosition);

        if (this.commons.viewerOptions.brushActive) {
            this.commons.svgContainer.selectAll(".brush rect")
                .attr('height', this.commons.YPosition + 50);
        }
        if (this.commons.viewerOptions.verticalLine) d3.selectAll(".VLine").style("height", (this.commons.YPosition + 50) + "px");
        if (d3.selectAll(".element") && d3.selectAll(".element")['_groups'].length > 1500) this.commons.animation = false;

        return object.featureId

    }

    /**
     * @function
     * @methodOf FeatureViewer
     * @name addSubFeature
     * @param {object} target - The input subfeature
     * @property {id} target.parentId - The id of parent feature, <output of onFlagSelected>.detail.id
     * @property {Array.<Object>} target.subfeatures
     * @property {Array.<Object>} target.subfeatures.<SubfeatureObject>.data
     * @property {int} target.subfeatures.<SubfeatureObject>.data.<Object>.x - first position
     * @property {int} target.subfeatures.<SubfeatureObject>.data.<Object>.y - last position (or a value for features of type "line")
     * @property {string} [target.subfeatures.<SubfeatureObject>.data.<Object>.id] - id
     * @property {int} target.subfeatures.<SubfeatureObject>.data.<Object>.y - message for the region tooltip
     * @property {string} [target.subfeatures.<SubfeatureObject>.data.<Object>.description] - description
     * @property {string} target.subfeatures.<SubfeatureObject>.data.<Object>.color - color ! Please note, at the moment color is needed in the subfeature object, WIP
     * @property {string} target.subfeatures.<SubfeatureObject>.type -  ("rect","curve","unique","circle") : The type of feature, for a specific rendering
     * @property {int} target.subfeatures.<SubfeatureObject>.yMax -  if type is curve, defines max value
     * @property {string} [target.subfeatures.<SubfeatureObject>.name] - The name of theses features, which will be display as a label on the Y-axis
     * @property {string} [target.subfeatures.<SubfeatureObject>.className] - a class name, for further personal computing
     * @property {int} [target.subfeatures.<SubfeatureObject>.height] - height of the feature
     * @property {string} target.subfeatures.<SubfeatureObject>.color - The color of the features
     * @property {boolean} [target.subfeatures.<SubfeatureObject>.hasSubfeatures] - determines if object is clickable and expands for subfeature visualization
     * @property {boolean} [target.subfeatures.<SubfeatureObject>.filter] - a class filter, for further personal computing
     * @property {number} [target.subfeatures.<SubfeatureObject>.disorderContent] - content of disorder content tag (right side of viewer)
     * @property {number} [target.subfeatures.<SubfeatureObject>.tooltip] - message for the flag tooltip
     * @property {Array.<Objects>} [target.subfeatures.<SubfeatureObject>.link]
     * @property {string} [target.subfeatures.<SubfeatureObject>.link.name] - The button name, used to identify click event
     * @property {string} [target.subfeatures.<SubfeatureObject>.link.icon]  - Glyphicon code or text, specify glyphicon in unicode format, ex. \ue030
     * @property {string} [target.subfeatures.<SubfeatureObject>.link.message] - The message for tooltip
     * @property {string} [target.subfeatures.<SubfeatureObject>.link.color] - Optional color for the visualized glyphicon
     */
    public addSubFeature(object) {

        // stop flag loading
        d3.select(`#${this.divId}`).select(`#${object.parentId}`)
            .attr("class", "");

        // check input
        if (object.parentId && object.subFeatures) {

            // check first if open or close flag
            // object contains id and subfeatures
            let parent_id = object.parentId;
            let subfeatures = object.subFeatures;

            // get position of parent feature and move whatever is under
            // retrieve parent feature
            let elementPos = this.commons.features.map(function (x) {
                return x["featureId"];
            }).indexOf(parent_id);
            let thisFeature = this.commons.features[elementPos];

            // thisFeature is parent feature
            let parentElementRow = d3.select(`#c${parent_id}_container`);
            // get heigth of parent row and add its level
            let parentRowY;
            parentRowY = this.getTransformation(parentElementRow.attr("transform")).translateY;
            if (thisFeature['type'] === 'curve' || thisFeature['type'] === 'path') {
                parentRowY += thisFeature["height"] * 10 - 4;
                parentRowY += this.commons.step / 2;
            } else {
                let parentRowN = this.calculate.addNLines(thisFeature['data']);
                parentRowY += this.calculate.getHeightRect(parentRowN);
            }

            // calculate necessary movement
            // get level for each features to write
            let diff = 0;
            let featuresToMove = this.commons.features.slice(elementPos + 1);

            if (thisFeature['subFeaturesOn']) { // flag is already selected

                // change text icon
                d3.select(`#${parent_id}`).select('#chevron')
                    .attr("x", 4)
                    .attr("y", function (d) {
                        // vertical flag placement
                        return d['y'] - 4;
                        // return d[1] - 4; // TODO
                    })
                    .html(this.commons.right_chevron);
                // deselect feature
                thisFeature['subFeaturesOn'] = false;

                if (parent_id in this.commons.calculatedTransitions) {
                    // remove subfeatures
                    this.remove_subfeatures_data(parentRowY, elementPos, thisFeature);
                    diff = this.commons.calculatedTransitions[parent_id];
                    // apply transitions to featuresToMove elements
                    // new features!
                    featuresToMove = this.commons.features.slice(elementPos + 1);
                } else {
                    let changedHeight = this.remove_subfeatures_data(parentRowY, elementPos, thisFeature);
                    diff = changedHeight;
                    // avoid recalculation of distances: use calculatedTransitions object
                    this.commons.calculatedTransitions[parent_id] = changedHeight;
                    // apply transitions to featuresToMove elements
                    // new features!
                    featuresToMove = this.commons.features.slice(elementPos + 1);
                };

                // check start for flag
                // closing
                diff = diff * -1;

            } else { // flag is not selected

                // change text icon
                d3.select(`#${parent_id}`).select('#chevron')
                    .attr("x", 4)
                    .attr("y", function (d) {
                        // vertical flag placement
                        return d['y'] - 4; // TODO
                        // return d[1] - 4;
                    })
                    .html(this.commons.down_chevron);
                // select feature
                thisFeature['subFeaturesOn'] = true;

                if (parent_id in this.commons.calculatedTransitions) {
                    this.draw_subfeatures(parentRowY, subfeatures, thisFeature, elementPos + 1);
                    diff = this.commons.calculatedTransitions[parent_id];
                } else {
                    let changedHeight = this.draw_subfeatures(parentRowY, subfeatures, thisFeature, elementPos + 1);
                    diff  = changedHeight;
                    // avoid recalculation of distances: use calculatedTransitions object
                    this.commons.calculatedTransitions[parent_id] = changedHeight;
                };

            }

            this.feature_transition_data(
                featuresToMove,
                diff
            );
            this.resizeBrush()

        } else {
            console.warn("Wrong addSubFeature input")
        }

    }

    public addFeatures(flist: FeaturesList) {

        // check ids are unique
        const unique = [...new Set(flist.map(item => item.featureId))];
        console.log(unique)

    }

    constructor(sequence: string | number, div: string, options: UserOptions) {

        this.commons = new Commons();

        // init commons
        this.commons.yData = [];
        this.commons.features = [];
        this.commons.YPosition = this.commons.step;

        // read divId
        this.divId = div.slice(1).toString();

        // sequence and seq length
        if (typeof sequence === 'string') {
            this.sequence = sequence;
        } else {
            this.sequence = null;
        }
        this.commons.fvLength = typeof sequence === 'string' ? sequence.length : sequence;

        // parse user options
        this.parseUserOptions(options);
        // sets width too, new re-set it again but in case of window resize

        this.fillSVG = new FillSVG(this.commons);
        this.subfeaturesTransition = new SubfeaturesTransition(this.commons);
        this.transition = new Transition(this.commons); // extends computingFunctions
        this.calculate = new Calculate(this.commons);
        this.tool = new Tool(this.commons);

        this.init(div);
        this.resizeViewer()
    }
}

export {FeatureViewer};
//export = FeatureViewer;
