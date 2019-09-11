
//import './css/feature-viewer.css';
//import css from './css/feature-viewer.css'
//import './css/tooltip.css'
//import './css/bootstrap.css'

import * as d3 from './custom-d3'
import {event as currentEvent} from 'd3-selection';
import * as _ from 'underscore';
import htmlToImage from 'html-to-image';

import {UserOptions} from './interfaces';
import {FeaturesList, FeatureObject} from './interfaces';
import {FeatureViewerLog} from './interfaces';
import Commons from './commons';
import {Transition, SubfeaturesTransition} from "./transition";
import FillSVG from "./fillsvg";
import Calculate from "./calculate";
import Tool from "./tooltip";


import * as fvstyles from './../assets/fv.scss';


class FeatureViewer {

    private commons: Commons;
    private divId: string;
    private sequence: string;

    private transition: Transition;
    private subfeaturesTransition: SubfeaturesTransition;
    private fillSVG: FillSVG;
    private calculate: Calculate;
    private tool: Tool;

    private searchTree(element, matchingId){
        if (element.id == matchingId) {
            return element;
        } else if (element.subfeatures) {
            var i;
            var result = null;
            for (i = 0; result == null && i < element.subfeatures.length; i++) {
                result = this.searchTree(element.subfeatures[i], matchingId);
            }
            return result;
        }
        return null;
    }

    private unflatten = function( array: FeaturesList, parent=null, processedIds=null, tree=null ){

        tree = tree !== null ? tree : [];
        parent = parent !== null ? parent : { id: 0 };
        processedIds = processedIds !== null ? processedIds : new Set();

        var children = _.filter( array, (child) => {
            if (child.parentId === undefined) {
                child.parentId = 0
            }
            if (child.parentId === parent.id) {
                processedIds.add(child.id)
            }
            return child.parentId == parent.id;
        });

        if( !_.isEmpty( children )  ){
            if( parent.id == 0 ){
                tree = children;
            }else{
                parent['subfeatures'] = children
            }
            _.each( children, ( child ) => { this.unflatten( array, child, processedIds ) } );
        }

        let res = {
            tree:tree,
            ids:processedIds
        }

        return res;
    }

    private flatten(features, flatted=[], parent=null) {
        for (let i in features) {
            let ft = features[i]
            ft.parent = parent;
            flatted.push(ft);
            if (ft.subfeatures) { this.flatten(ft.subfeatures, flatted=flatted, parent=ft.parent+'_'+ft.id) }
        }
        return flatted
    }

    private parseUserOptions(options: UserOptions): void {

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
            'sideBar',
            'animation'
        ];

        for (let key of simple_keys) {
            if (options && key in options) {
                this.commons.viewerOptions[key] = options[key];
            }
        }

        if (options.breakpoint) {
            this.commons.mobilesize = options.breakpoint;
        }

        this.commons.viewerOptions.offset = {start: 0, end: this.commons.fvLength + 1};
        if (options && options.offset) {
            this.commons.viewerOptions.offset = options.offset;
            if (options.offset.start < 1) {
                this.commons.viewerOptions.offset.start = 1;
                this.commons.logger.warn("Offset.start should be > 0. Thus, it has been reset to 1.", {fvId:this.divId});
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

        if (!this.commons.viewerOptions.brushActive) {
            this.commons.viewerOptions.brushActive = true
        }

        // set width of sidebar
        this.commons.viewerOptions.tagsTrackWidth = 0;
        if (options && options.sideBar) {
            if (typeof options.sideBar === 'string') {
                this.commons.viewerOptions.tagsTrackWidth = Number(options.sideBar.match(/[0-9]+/g)[0]);
            } else if (typeof  options.sideBar === 'number') {
                this.commons.viewerOptions.tagsTrackWidth = options.sideBar;
            } else if (typeof  options.sideBar === 'boolean') {
                if (options.sideBar) {
                    this.commons.viewerOptions.tagsTrackWidth = 100;
                } else {
                    this.commons.viewerOptions.tagsTrackWidth = 0;
                }
            } else {
                this.commons.viewerOptions.tagsTrackWidth = 100;
                this.commons.logger.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`, {fvId:this.divId});
            }
        }
        this.commons.viewerOptions.backup.tagsTrackWidth = this.commons.viewerOptions.tagsTrackWidth;

        // set width of flags
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
                this.commons.logger.warn(`Automatically set tagsTrackWidth to ${this.commons.viewerOptions.tagsTrackWidth}`, {fvId:this.divId});
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
        // let totalwidth = d3.select(`#${this.divId}`).node().getBoundingClientRect().width;
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

        // create g
        this.commons.yAxisSVGGroup = this.commons.yAxisSVG
            .selectAll(".yAxis")
            .data(this.commons.yData)
            .enter()
            .append("g")
            .attr("id", function (d) {
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                if (d.title === "Sequence") {
                    return 'sequence'
                } else {
                    return d.id
                }
            })
            .attr("class", "flag")
            .on('click', (d) => {
                // if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                //     this.clickFlagFunction(d)
                // }
                this.clickFlagFunction(d)
            })
            .call(this.commons.d3helper.flagTooltip());
            //.call(d3.helper.genericTooltip({}));

        // create polygon
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
                if (d.flagColor) return d.flagColor;
                return this.commons.viewerOptions.flagColor // or flagColor
            });

        // foreingObject for chevron
        this.commons.yAxisSVGGroup
            .append("g") // position
            .attr("transform", (d) => {
                let x = 0;
                // horizontal flag placement
                this.commons.headMargin = 0;
                if (d.flagLevel) {
                    this.commons.headMargin = 20 * (d.flagLevel - 1);
                    x = this.commons.headMargin + 5;
                }
                // vertical flag placement
                let y = d.y - 4;
                return "translate(" + x + "," + y + ")"
            })
            .append("path")
            .attr("id", "chevron")
            .attr("fill", "rgba(39, 37, 37, 0.71)")
            .attr("d", (d) => {
                if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                    if (d.isOpen) {return this.commons.down_chevron} else {return this.commons.right_chevron}
                } else {
                    return ''
                }
            });

        this.commons.yAxisSVGGroup
            .append("foreignObject")
            .attr("class", "yAxis")
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
                    cvm = 17
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
                return d.y
            })
            .attr("width", (d) => {
                // text only if space is enough
                if (this.commons.viewerOptions.mobileMode) {
                    return "15px";
                } else {
                    let margin = 20 * (d.flagLevel - 1)
                    return this.commons.viewerOptions.margin.left - (18+margin); // chevron margin and text indent
                }
            })
            .attr("height", this.commons.step - 11)
            .html((d) => {
                // text only if space is enough
                return d.label;
            });
    };

    private clickFlagFunction(d) {

        // remove selected features
        if (this.commons.featureSelected) {
            d3.select(`#${this.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
            this.commons.featureSelected = null;
        }
        // remove selection rectangle
        d3.select(`#${this.divId}`).select(".selectionRect").remove();

        // empty custom tooltip
        this.commons.customTooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        this.commons.customTooltipDiv.html("");

        // dispatches selected flag event
        let id = d.id;
        let flag_detail_object = {
            points: this.calculate.yxPoints(d),
            y: d.y,
            id: d.id,
            label: d.label,
            flagLevel: d.flagLevel
        };
        // trigger flag_selected event
        if (CustomEvent) {

            let eventDetail = {detail: flag_detail_object},
                event = new CustomEvent(this.commons.events.FLAG_SELECTED_EVENT, eventDetail);
            this.commons.svgElement.dispatchEvent(event);

            if (this.commons.viewerOptions.showSubFeatures && d.hasSubFeatures) {
                this.commons.flagSelected.push(flag_detail_object.id);

                // let featureToChange = this.searchTree(this.commons.features, flag_detail_object.id)
                var i;
                var result = null;
                for (i = 0; result == null && i < this.commons.features.length; i++) {
                    result = this.searchTree(this.commons.features[i], flag_detail_object.id);
                }
                let featureToChange = result;
                if (featureToChange) {
                    this.changeFeature(featureToChange, !featureToChange.isOpen);
                } else {
                    this.commons.logger.warn("Feature not found in feature array", {fvId:this.divId, featureId:flag_detail_object.id})
                }
            }


        } else {
            this.commons.logger.warn("CustomEvent is not defined", {fvId:this.divId});
        }

        if (this.commons.trigger) this.commons.trigger(this.commons.events.FLAG_SELECTED_EVENT, flag_detail_object);
    };

    private resizeBrush() {

        let rectArea = this.commons.svgContainer.node().getBoundingClientRect();
        let thisbrush = this.commons.svgContainer.select(".brush");
        thisbrush.select("rect")
            .attr('height', rectArea.height)
            .attr('width', rectArea.width);
    };

    private addBrush() {

        this.commons.svgContainer
            .append("g")
            .attr("class", "brush")
            .attr("id", "fvbrush")
            .call(this.commons.brush)
        //.call(this.commons.brush.move, this.commons.scaling());
        this.resizeBrush()

    };

    private brushend() {

        // zoom and unzoom

        this.commons.customTooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        this.commons.customTooltipDiv.html("");
        this.commons.customTooltipDiv.status == 'closed';


        // remove selected features
        if (this.commons.featureSelected) {
            d3.select(`#${this.divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
            this.commons.featureSelected = null;
        }
        // remove selection rectangle
        d3.select(`#${this.divId}`).select(".selectionRect").remove();

        if (currentEvent.sourceEvent !== null && typeof currentEvent.sourceEvent.target !== "function") {

            // ZOOMING CASE & REZISING FOR BUTTONS (deprecated)
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
                    this.commons.svgContainer.select(".mySequence").remove();
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
                    this.commons.logger.warn("Zoom greater than " + this.commons.viewerOptions.zoomMax + " is prevented", {fvId:this.divId});
                }


                if (CustomEvent) {

                    // zooming in
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
        // change flags
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
        let myd3node = d3.select(`#${this.commons.divId}`).node();
        let totalwidth = (<HTMLElement>myd3node).getBoundingClientRect().width;

        // resize for mobile?
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
        }
        else if (this.commons.viewerOptions.mobileMode) {
                this.commons.viewerOptions.mobileMode = false;
                this.commons.viewerOptions.margin.left = this.commons.viewerOptions.labelTrackWidth;
                this.commons.viewerOptions.margin.right = this.commons.viewerOptions.tagsTrackWidth;
                // resize back to options
                this.resizeForMobile()
        }
        else {
            // no mobile size, resize flags
            // change flags
            let flags = d3.select(`#${this.divId}`).selectAll(".Arrow")
                .attr("points", (d) => {
                    // match points with subFeature level
                    return this.calculate.yxPoints(d)
                });
        }

        this.commons.viewerOptions.width = totalwidth - this.commons.viewerOptions.margin.left - this.commons.viewerOptions.margin.right - 17;

        // resize containers
        this.commons.svg
            .attr("width", totalwidth);
        this.commons.svg.select("clipPath rect")
            .attr("width", this.commons.viewerOptions.width);
        if (this.commons.viewerOptions.brushActive) {
            d3.select(`${this.commons.divId} .background`).attr("width", this.commons.viewerOptions.width - 10);
        }

        // resize brush
        d3.select(`#${this.commons.divId}`).select(".fvbrush").call(this.commons.brush.move, null);

        // new scaling
        this.commons.scaling.range([2, this.commons.viewerOptions.width - 2]);
        this.commons.scalingPosition.domain([0, this.commons.viewerOptions.width]);

        // update seq visualization
        let seq = this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start);
        this.commons.svgContainer.select(".mySequence").remove();
        if (this.commons.viewerOptions.showSequence) {
            if (seq === false) {
                this.fillSVG.sequenceLine();
            }
            else if (seq === true) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
        }


        if (this.commons.animation) {
            d3.select(`#${this.commons.divId}`).select('#tags_container')
                .transition().duration(500)
        }
        d3.select(`#${this.commons.divId}`).select('#tags_container')
            .attr("transform", "translate(" + (this.commons.viewerOptions.margin.left + this.commons.viewerOptions.width).toString() + ",10)");


        this.transition_data(this.commons.features, this.commons.current_extend.start);
        this.reset_axis();
        this.resizeBrush()

    }

    public resetAll() {

        // empty custom tooltip in reset
        this.commons.customTooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        this.commons.customTooltipDiv.html("");

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

        d3.select(`#${this.divId}`).select(".fvbrush").call(this.commons.brush.move, null);

        // remove sequence
        this.commons.svgContainer.select(".mySequence").remove();
        // draw sequence
        if (this.commons.viewerOptions.showSequence) {
            if (seq === false) {
                this.fillSVG.sequenceLine();
            }
            else if (seq === true) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
        }

        this.commons.customTooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        this.commons.customTooltipDiv.html("");
        this.commons.customTooltipDiv.status == 'closed';

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
        // no usage of start
        // apply transition data recursively?
        for (const o of features) {
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
            // apply recursively to subfeatures (if shown)
            if (o.subfeatures && o.isOpen) {
                this.transition_data(o.subfeatures, start)
            }
        };
    }

    private reset_axis() {
        if (this.commons.animation) {
            this.commons.svgContainer.transition().duration(500);
        }
        this.commons.svgContainer
            .select(".x.axis")
            .call(this.commons.xAxis);
    }

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

        // init overlay div
        let overlayhtml = '<div id="fvoverlay" data-container="body"></div>'
        d3.select(`#${this.divId}`)
            .append("foreignObject")
            .html(overlayhtml)

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
            //.extent([[this.commons.scaling.range()[0], 0], [this.commons.scaling.range()[1], 1]])
            .on("end", () => {
                this.brushend()
            });

        //this.commons.right_chevron = '<i class="materialicons">keyboard_arrow_right</i>';
        //this.commons.down_chevron = '<i class="materialicons">keyboard_arrow_down</i>';
        this.commons.right_chevron = "M12.95 10.707l0.707-0.707-5.657-5.657-1.414 1.414 4.242 4.243-4.242 4.243 1.414 1.414 4.95-4.95z"
        this.commons.down_chevron = "M9.293 12.95l0.707 0.707 5.657-5.657-1.414-1.414-4.243 4.242-4.243-4.242-1.414 1.414z"

        // Define the divs for the tooltip
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

        this.commons.style = d3.select(`#${this.divId}`)
            .append("style")
            .html(`${fvstyles}`)


        // Create SVG
        if (this.commons.viewerOptions.toolbar) {

            let headerOptions = document.querySelector(div + " .svgHeader") ? d3.select(div + " .svgHeader") : d3.select(div).append("div").attr("class", "svgHeader");

            if (this.commons.viewerOptions.toolbarPosition) {
                // flex-end
                if (this.commons.viewerOptions.toolbarPosition === "right") {this.commons.viewerOptions.toolbarPosition = "flex-end"}
                else if (this.commons.viewerOptions.toolbarPosition === "left")  {this.commons.viewerOptions.toolbarPosition = "flex-start"}
                headerOptions.attr("style", "color: rgba(39, 37, 37, 0.71); display: flex; justify-content: " + this.commons.viewerOptions.toolbarPosition)
            }
            else {
                headerOptions.attr("style", "color: rgba(39, 37, 37, 0.71);");
            }

            // position
            if (!document.querySelector(div + ' .header-position')) {

                let headerPosition = headerOptions
                    .append("div")
                    .attr("class", "header-position")
                    .style("display", "inline-block")
                    .style("padding-top", "5px")
                let button = headerPosition
                    .append("div")
                    .attr("class", "position-label")
                    .style("display", "inline-block")
                button
                    // draw icon
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M10 20s-7-9.13-7-13c0-3.866 3.134-7 7-7s7 3.134 7 7v0c0 3.87-7 13-7 13zM10 9c1.105 0 2-0.895 2-2s-0.895-2-2-2v0c-1.105 0-2 0.895-2 2s0.895 2 2 2v0z");
                button
                    .append("text")
                    .text("Position:")
                headerPosition
                    .append("div")
                    .style("display", "inline-block")
                    .style("padding-left", "5px")
                    .append("div")
                    .style("padding-right", "15px")
                    .style("width", "80px") // fix width otherwise responsive to length number;
                    .attr("id", "zoomPosition")
                    .text("0")
            }

            //zoom
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
                    .style("display", "inline-block")
                button
                    // draw icon
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M12.9 14.32c-1.34 1.049-3.050 1.682-4.908 1.682-4.418 0-8-3.582-8-8s3.582-8 8-8c4.418 0 8 3.582 8 8 0 1.858-0.633 3.567-1.695 4.925l0.013-0.018 5.35 5.33-1.42 1.42-5.33-5.34zM8 14c3.314 0 6-2.686 6-6s-2.686-6-6-6v0c-3.314 0-6 2.686-6 6s2.686 6 6 6v0z");
                button
                    .append("text")
                    .text("Zoom:")

                headerZoom
                    .append("div")
                    .style("display", "inline-block")
                    .append("div")
                    .style("padding-left", "5px")
                    .style("width", "80px") // fix width otherwise responsive to length number;
                    .append("span")
                    .text("x ")
                    .append("span")
                    .style("padding-right", "15px")
                    .attr("class", "zoomUnit")
                    .text("1");
            }

            // help
            if (!document.querySelector(div + ' .header-help')) {

                let headerHelp = headerOptions
                    .append("div")
                    .attr("class", "header-help")
                    .style("display", "inline-block")

                headerHelp
                    .append("button")
                    .attr("class", "mybuttoncircle")
                    .attr("id", "downloadButton")
                    .on("click", () => {
                        this.downloadJpeg()
                    })
                    // draw icon
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M13 8v-6h-6v6h-5l8 8 8-8h-5zM0 18h20v2h-20v-2z")


                headerHelp
                    .append("button")
                    .attr("id", "helpButton")
                    .attr("class", "mybuttoncircle")
                    .on("click", () => {
                        this.showHelp()
                    })
                    // draw icon
                    .append("svg")
                    .attr("class", "helperButton")
                    .append("path")
                    .attr("d", "M2.93 17.070c-1.884-1.821-3.053-4.37-3.053-7.193 0-5.523 4.477-10 10-10 2.823 0 5.372 1.169 7.19 3.050l0.003 0.003c1.737 1.796 2.807 4.247 2.807 6.947 0 5.523-4.477 10-10 10-2.7 0-5.151-1.070-6.95-2.81l0.003 0.003zM9 11v4h2v-6h-2v2zM9 5v2h2v-2h-2z")

                }

        }

        this.commons.svg = d3.select(div).append("svg")
            .attr("width", this.commons.viewerOptions.width + this.commons.viewerOptions.margin.left + this.commons.viewerOptions.margin.right)
            .attr("height", this.commons.viewerOptions.height + this.commons.viewerOptions.margin.top + this.commons.viewerOptions.margin.bottom)
            .style("z-index", "2")
            .attr("id", "svgContent")
            .on("dblclick", (d,i)=>{
                // react to double click
                this.resetAll();
                if (CustomEvent) {
                    let event = new CustomEvent(this.commons.events.CLEAR_SELECTION_EVENT, {detail: {}});
                    this.commons.svgElement.dispatchEvent(event);
                } else {
                    this.commons.logger.warn("CustomEvent is not defined", {fvId:this.divId});
                }
                if (this.commons.trigger) this.commons.trigger(this.commons.events.CLEAR_SELECTION_EVENT);
            })
            .on("contextmenu", (d, i) => {
                // react on right click
                this.resetAll();
                if (CustomEvent) {
                    let event = new CustomEvent(this.commons.events.CLEAR_SELECTION_EVENT, {detail: {}});
                    this.commons.svgElement.dispatchEvent(event);
                } else {
                    this.commons.logger.warn("CustomEvent is not defined", {fvId:this.divId});
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

        if (this.commons.viewerOptions.sideBar) {
            // add white rect to hide feature zoom exceeding the viewer length
            this.commons.tagsContainer.append("rect")
                .attr("x", -6)
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white");
        }

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

            if (this.commons.viewerOptions.toolbar) {
                // d3.select(`${this.divId} #zoomPosition`).text(pos);
                document.querySelector(`#${this.divId} #zoomPosition`).innerHTML = pos;
            };
        });

        if (this.commons.viewerOptions.showSequence) {
            if (this.displaySequence(this.commons.viewerOptions.offset.end - this.commons.viewerOptions.offset.start)) {
                this.fillSVG.sequence(this.sequence.substring(this.commons.viewerOptions.offset.start, this.commons.viewerOptions.offset.end), this.commons.viewerOptions.offset.start);
            }
            else {
                this.fillSVG.sequenceLine();
            }
            // check if sequence already initialized, alse add it to yData
            // if (this.commons.yData.filter((e) => {e.id === 'fv_sequence'}).length === 0) {
            //     // features
            //     // this.commons.features.push({
            //     //     data: this.sequence,
            //     //     label: "Sequence",
            //     //     className: "AA",
            //     //     color: "black",
            //     //     type: "sequence",
            //     //     id: "fv_sequence"
            //     // });
            //     // yData
            //     this.commons.yData.push({
            //         id: "fv_sequence",
            //         label: "Sequence",
            //         y: this.commons.YPosition - 8,
            //         flagLevel: 1
            //     });
            // }
            this.commons.yData.push({
                id: "fv_sequence",
                label: "Sequence",
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
        /* feature removed
        if (this.commons.viewerOptions.verticalLine) {
            // this.commons.viewerOptions.verticalLine = true;
            this.addVerticalLine();
        }
        */

        this.updateSVGHeight(this.commons.YPosition);

        // listen to resizing
        window.addEventListener("resize", () => {
            this.updateWindow()
        }); // window.addEventListener works, but iupdateWindow needs to access to internal commons

    }

    private addFeatureCore(object, flagLevel = 1, position = null) {

        this.commons.YPosition += this.commons.step;
        // if no label is given, id on flag
        if (!object.label) {object.label = object.id}
        // deselect it if no isOpen input
        if (!object.isOpen) {
            object.isOpen = false;
        }
        if (this.commons.animation) {
            if (CustomEvent) {
                let event = new CustomEvent(this.commons.events.ANIMATIONS_FALSE_EVENT, {detail: {}});
                this.commons.svgElement.dispatchEvent(event);
            } else {
                this.commons.logger.warn("CustomEvent is not defined", {fvId:this.divId});
            }
            if (this.commons.trigger) this.commons.trigger(this.commons.events.ANIMATIONS_FALSE_EVENT);
        };

        if (!object.className) {
            object.className = object.type + "fv";
        }
        else {
            // initialized by user or by viewer?
            if (object.className !== object.type + "fv") {
                object.className = object.className + " " + object.type + "fv";
            }
        }

        if (!object.color) {
            object.color = "#DFD5F5";
        }

        //object.height = this.commons.elementHeight;
        object.flagLevel = flagLevel;

        this.fillSVG.typeIdentifier(object);
        // flags
        this.updateYAxis();
        if (object.type === "curve" || object.type === "path") {
            this.updateWindow();
        }

    }

    private showHelp() {

        /*let helpContent = "<div><strong>To zoom in :</strong> Left click to select area of interest</div>" +
            "<div><strong>To zoom out :</strong> Right click to reset the scale</div>" +
            "<div><strong>Zoom max  :</strong> Limited to <strong>" + this.commons.zoomMax.toString() + " " + this.commons.viewerOptions.unit + "</strong></div>";*/
        let helpContent = "To zoom in : Left click to select area of interest\n To zoom out : Right click to reset the scale\n Zoom max : Limited to" +
            this.commons.viewerOptions.zoomMax.toString() + " " + this.commons.viewerOptions.unit

        alert(helpContent)
    }

    public downloadJpeg() {

        //let svg_el = this.commons.svgContainer.getElementsById("#svgContent");
        let svg_el = document.getElementById(this.divId)
        let filename = "feature_viewer.jpeg";

        htmlToImage.toJpeg(svg_el, { quality: 0.95 })
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error) {
                console.error('Error in Image download', error);
            });

    }

    private recursiveClose (array) {
        for (const sbt of array) {
            sbt.isOpen = false
            if (sbt.subfeatures) {
                this.recursiveClose(sbt.subfeatures)
            }
        }
    }

    private changeFeature(feature, bool) {

        // freeze viewer
        this.flagLoading(feature.id);
        // close or open it
        feature.isOpen = bool;
        // if close, reset children status
        if (!feature.isOpen) {
            if (feature.subfeatures) {
                this.recursiveClose(feature.subfeatures)
            }
        }

        // overlay if opening many subfeatures
        if (feature.isOpen) {
            if (feature.subfeatures.length > 200) {
                setTimeout(()=>{
                    // empty features
                    this.commons.features = this.emptyFeatures()
                    // redraw features
                    this.drawFeatures()
                    // defreeze viewer
                    this.stopFlagLoading(feature.id)
                }, 1)
                return
            }
        }

        // empty features
        this.commons.features = this.emptyFeatures()
        // redraw features
        this.drawFeatures()
        // defreeze viewer
        this.stopFlagLoading(feature.id)


    }

    private drawFeatures() {

        // turn off features if more than 100
        if (this.commons.features.length > 100) {
            this.commons.animation = false;
            this.commons.logger.warn("Animation is turned off with more than 100 features", {method:"addFeatureCore", fvId:this.divId, featuresNumber:this.commons.features.length})
        }
        for (const ft of this.commons.features) {
            this.addFeature(ft)
        };

        this.updateXAxis(this.commons.YPosition);
        this.updateSVGHeight(this.commons.YPosition);

        // update brush
        if (this.commons.viewerOptions.brushActive) {
            this.resizeBrush()
        }

    }

    private recursivelyRemove(ft) {
        // remove subfeatures
        if (ft.subfeatures) {
            for (const sft of ft.subfeatures) {
                this.recursivelyRemove(sft)
            }
        }
        // remove from feature array and from html
        d3.select(`#t${ft.id}_tagarea`).remove();
        d3.select(`#c${ft.id}_container`).remove();
        d3.select(`#${ft.id}`).remove();
    }


    /*** PUBLIC FUNCTIONS ***/

    public emptyFeatures() {

        this.resetAll()

        // clean feature object
        let deepCopy = JSON.parse(JSON.stringify(this.commons.features))
        for (const ft of this.commons.features) {
            this.recursivelyRemove(ft)
        };

        function checkSequence(ft) {
            return ft.id === 'fv_sequence';
        }


        // re-init features and yData
        // this.commons.features = [];
        // this.commons.yData = [];
        this.commons.features = this.commons.features.filter(checkSequence)
        this.commons.yData = this.commons.yData.filter(checkSequence);

        // fix axis
        this.updateXAxis(this.commons.step)

        // transit svgContent
        let container = d3.select(`#${this.divId} #svgContent`);
        let newContainerH = this.commons.step * 3;
        this.subfeaturesTransition.containerH(container, newContainerH); // header, sequence, axis

        // final updates based on svg heigth
        if (this.commons.viewerOptions.brushActive) {
            this.commons.svgContainer.selectAll(".brush rect")
                .attr('height', newContainerH);
        }
        // re-init YPosition
        this.commons.YPosition = this.commons.step;

        return deepCopy

    }

    /**
     * @function
     * @methodOf FeatureViewer
     * @name onRegionSelected
     * @return {object} Object describing the selected feature */
    public onRegionSelected(listener) {
        this.commons.svgElement.addEventListener(this.commons.events.FEATURE_SELECTED_EVENT, listener);
    };

    public removeResizeListener() {
        window.removeEventListener("resize", this.updateWindow);
    };

    public highlightRegion(region, featureid) {
        let flatted = this.flatten(this.commons.features)
        // features in viewer?
        let feature = flatted.find(i => i.id === featureid);
        if (feature) {
            // find feature in the tree and all its parents
            if (feature.parent) {
                let parents = feature.parent.replace("null_", "").split("_")
                for (let i in parents) {
                    let ptftid = parents[i]
                    // let parentft = flatted.find(i => i.id === ptftid)
                    console.log(this.commons.yData)
                    let parentft = this.commons.yData.find(i => i.id === ptftid)
                    console.log(parentft)
                    this.clickFlagFunction(parentft)
                }
            }
            let regionid = "f_" + featureid + '_' + region.x + '-' + region.y;
            this.tool.colorSelectedFeat(regionid, feature, this.commons.divId);
        } else { this.commons.logger.warn("Selected feature id does not exist!") }
    };

    public highlightPosition(object) {
        let start = this.commons.scaling(object.start)
        let end = this.commons.scaling(object.end)
        // remove selection rectangle if already there
        let selectRect;
        if (d3.select(`#${this.commons.divId}`).select(".selectionRect").node()) {
            selectRect = d3.select(`#${this.commons.divId}`).select(".selectionRect")
        } else {
            // color the background
            let currentContainer = this.commons.svgContainer.node().getBoundingClientRect();
            // create
            selectRect = this.commons.svgContainer
                .select(".brush")
                .append("rect")
                .attr("class", "selectionRect box-shadow")
                // add shadow?
                .attr("height", currentContainer.height)
            // place
            selectRect
                .style("display", "block") // remove display none
                .attr("width", end-start) // - shift from the beginning
                .attr("transform", () => {
                    return "translate(" + start + ",0)"
                })
        }
    }

    // public highlightRegion(object) {
    //
    // }

    // edit: listener of selected flag
    /**
     * @function
     * @methodOf FeatureViewer
     * @name onFeatureSelected
     * @description Expected usage: once flag is selected, addSubFeature()
     * @return {object} Object describing the selected flag */
    public onFeatureSelected(listener) {
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

    public stopFlagLoading = function (id) {
        this.commons.logger.debug("Finished loading subfeatures", {method:'addFeatures',fvId:this.divId})
        d3.select(`#${this.divId}`).select("#fvoverlay").attr("class", null)
    };

    public flagLoading(id) {
        this.commons.logger.debug("Loading subfeatures", {method:'addFeatures',fvId:this.divId})
        d3.select(`#${this.divId}`).select("#fvoverlay").attr("class", "pageoverlay")
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
    private addFeature(object: FeatureObject, flagLevel=1) {

        this.addFeatureCore(object, flagLevel);

        if (object.subfeatures && object.isOpen) {
            flagLevel+=1
            for (const sft of object.subfeatures) {
                this.addFeature(sft, flagLevel)
            }
        };

        return object.id

    }

    public addFeatures(featureList: FeaturesList) {

        // check ids are unique
        const uniqueIds = [...new Set(featureList.map(item => item.id))];
        if (uniqueIds.length !== featureList.length) {

            this.commons.logger.error("Feature ids are not unique", {method:'addFeatures',fvId:this.divId})

        } else {

            // check ids are valid
            let regexIds = new RegExp('^[a-zA-Z]')
            let wrongIds = uniqueIds.filter((i)=>{
                return !regexIds.test(i)
            });
            if (wrongIds.length !== 0) {
                this.commons.logger.error("Some feature ids are not valid, html ids cannot start with digits", {method:'addFeatures',fvId:this.divId,wrongIds:wrongIds})
            } else {

                // add to viewer

                // features already in viewer?
                let unflatted = this.unflatten(
                    featureList,
                    null,
                    null,
                    this.commons.features.length !== 0 ? this.commons.features : null
                );

                // add new structured features to the old ones (if any, else sequence)
                this.commons.features = this.commons.features.concat(unflatted.tree);
                let ftsIds = unflatted.ids;

                // check if features are missing from the tree
                let unprocessedIds = uniqueIds.filter((x)=>{
                    return !(ftsIds.has(x))
                });
                if (unprocessedIds.length !== 0) {
                    this.commons.logger.error("Subfeatures with no known parentId", {method:'addFeatures',fvId:this.divId,features:unprocessedIds})
                }

                // features already in viewer? empty it before drawing
                this.commons.features = this.emptyFeatures()

                // draw the viewer
                this.drawFeatures()

            }

        }

    }

    constructor(sequence: string, div: string, options?: UserOptions, features?: FeaturesList) {

        this.commons = new Commons();

        // init commons
        this.commons.yData = [];
        this.commons.features = [];
        this.commons.YPosition = this.commons.step;

        // read divId
        this.commons.divId = this.divId = div.slice(1).toString();
        this.commons.logger = new FeatureViewerLog(); // TODO this.divId as input

        // sequence and seq length
        this.sequence = sequence;
        this.commons.fvLength = sequence.length;

        // parse user options
        this.parseUserOptions(options);
        // sets width too, new re-set it again but in case of window resize

        this.fillSVG = new FillSVG(this.commons);
        this.subfeaturesTransition = new SubfeaturesTransition(this.commons);
        this.transition = new Transition(this.commons); // extends computingFunctions
        this.calculate = new Calculate(this.commons);
        this.tool = new Tool(this.commons);

        this.init(div);

        // features?
        if (features) {
            this.addFeatures(features)
        }
        this.resizeViewer();
    }
}

export {FeatureViewer};
//export = FeatureViewer;
