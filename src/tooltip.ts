
import Calculate from "./calculate";
import * as d3 from './custom-d3';

class Tool extends Calculate {

    private calculate: Calculate;

    private colorSelectedFeat(feat, object, divId) {
        // remove previous selected features
        if (this.commons.featureSelected) {
            d3.select(`#${divId}`).select(`#${this.commons.featureSelected}`).style("fill-opacity", "0.6");
        }

        // color selected rectangle
        if (object.type !== "path" && object.type !== "curve" && feat) {

            this.commons.featureSelected = feat.id;
            let thisfeat = d3.select(`#${divId}`).select(`#${feat}`);
            thisfeat.style("fill-opacity", "1");

            // color the background
            let currentContainer = this.commons.svgContainer.node().getBoundingClientRect();

            let selectRect;
            if (d3.select(`#${divId}`).select(".selectionRect").node()) {
                selectRect = d3.select(`#${divId}`).select(".selectionRect")
            } else {
                selectRect = this.commons.svgContainer
                    .select(".brush")
                    .append("rect")
                    .attr("class", "selectionRect box-shadow")
                    // add shadow?
                    .attr("height", currentContainer.height)
            }
            let thisy = this.getTransf((<HTMLElement>thisfeat.node()).parentElement)[0];

            let myd3node = thisfeat.node();
            let bcr = (<HTMLElement>myd3node).getBoundingClientRect().width;
            selectRect
                .style("display", "block") // remove display none
                .attr("width", bcr) // - shift from the beginning
                .attr("transform", () => {
                    return "translate(" + thisy + ",0)"
                })
        }
    };

    private updateLineTooltip(mouse, pD, scalingFunction, labelTrackWidth) {
        let xP = mouse - labelTrackWidth;
        let elemHover = "";
        for (let l = 1; l < pD.length; l++) {
            let scalingFirst = scalingFunction(pD[l - 1].x);
            let scalingSecond = scalingFunction(pD[l].x);
            let halfway = (scalingSecond-scalingFirst)/2;
            if (scalingFirst+halfway < xP && scalingSecond+halfway > xP) {
                elemHover = pD[l];
                break;
            }
        }
        return elemHover;
    };

    private clickTagFunction(d) {
        // trigger tag_selected event: buttons clicked
        if (CustomEvent) {
            let event = new CustomEvent(this.commons.events.TAG_SELECTED_EVENT, {
                detail: d
            });
            this.commons.svgElement.dispatchEvent(event);
        } else {
            console.warn("CustomEvent is not defined....");
        }
        if (this.commons.trigger) this.commons.trigger(this.commons.events.TAG_SELECTED_EVENT, event);
    };

    public initTooltip(div, divId) {

        let getMessage = (thing, type='default') => {

            // first line
            let tooltip_message = '';

            // case of flags
            if (thing.hasOwnProperty('title')) {
                tooltip_message += '<p style="margin:2px;font-weight:700;">';
                tooltip_message += thing.title;
                tooltip_message += '</p>';

            } else {

                if (thing.hasOwnProperty('x') || thing.hasOwnProperty('y')) {
                    tooltip_message += '<p style="margin:2px; font-weight:700;">';
                    tooltip_message += (+thing.x).toString();
                    if (+thing.y !== +thing.x) {
                        if (type =='curve') {
                            tooltip_message += ' - ' + (+thing.y).toFixed(2).toString()
                        } else if (type == 'circle') {
                            // pass
                        } else {
                            tooltip_message += ' - ' + (+thing.y).toString()
                        }
                    }
                    tooltip_message += '</p>';
                }
                // case of button
                if (thing.hasOwnProperty('message')) {
                    tooltip_message += '<p style="margin:2px;font-weight:700;">';
                    tooltip_message += thing.message;
                    tooltip_message += '</p>';
                }

            }

            if (thing.hasOwnProperty('tooltip')) {
                // second line
                let second_line_text = '';
                if (thing.hasOwnProperty('tooltip')) {
                    second_line_text += thing.tooltip
                }
                if (second_line_text && second_line_text !== '' && second_line_text !== 'undefined') {
                    tooltip_message += '<p style="margin:2px; font-weight:700;">';
                    tooltip_message += second_line_text;
                    tooltip_message += '</p>';
                }
            }

            return tooltip_message
        };
        let drawTooltip = (tooltipDiv, absoluteMousePos) => {
            // angular material tooltip
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
                .style('position', 'absolute') // don't change this for compatibility to angular2
                .style('z-index', 45)
                .style('box-shadow', '0 1px 2px 0 #656565')
                .style('fontWeight', '500');
        };

        let scalingFunction = this.commons.scaling;
        let labelTrackWidth = this.commons.viewerOptions.labelTrackWidth;
        let updateLineTooltipFunction = this.updateLineTooltip;

        this.commons.d3helper = {};
        // d3['helper'] = {};

        this.commons.d3helper.flagTooltip = () => {

            let tooltipDiv = this.commons.tooltipDiv;
            let bodyNode = d3.select(div).node();

            let tooltip = (selection) => {

                let absoluteMousePos;
                let drawMyTooltip = (pD) => {

                    absoluteMousePos = d3.mouse(bodyNode);

                    let left, top;
                    left = absoluteMousePos[0].toString();
                    top = absoluteMousePos[1].toString();

                    if ('tooltip' in pD && pD['tooltip']) {
                        tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltipDiv
                            .html(pD['tooltip'])
                            .style("left", left+'px')
                            .style("top", top+'px');
                    } else if (this.commons.viewerOptions.mobileMode) {
                        tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltipDiv
                            .html(pD['title'])
                            .style("left", left+'px')
                            .style("top", top+'px');
                    }
                };

                selection
                // tooltip
                    .on('mouseover.tooltip', (pD) => {
                        drawMyTooltip(pD);
                    })
                    .on('mousemove.tooltip', (pD) => {
                        drawMyTooltip(pD);
                    })
                    .on('mouseout.tooltip', () => {
                        // Remove tooltip
                        tooltipDiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
            };

            return tooltip;

        };

        this.commons.d3helper.genericTooltip = (message) => {

            let tooltipDiv = this.commons.tooltipDiv;
            let bodyNode = d3.select(div).node();

            let tooltip = (selection) => {

                let absoluteMousePos;
                let drawMyTooltip = (pD) => {

                    absoluteMousePos = d3.mouse(bodyNode);

                    let left, top;
                    left = absoluteMousePos[0].toString();
                    top = absoluteMousePos[1].toString();

                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltipDiv
                        .html(message)
                        .style("left", left+'px')
                        .style("top", top+'px');
                };

                selection
                // tooltip
                    .on('mouseover', (pD) => {
                        drawMyTooltip(pD);
                    })
                    .on('mousemove', (pD) => {
                        drawMyTooltip(pD);
                    })
                    .on('mouseout', () => {
                        // Remove tooltip
                        tooltipDiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
            };

            return tooltip;

        };

        this.commons.d3helper.tooltip = (object) => {

            let tooltipDiv = this.commons.tooltipDiv;
            let viewerWidth = this.commons.viewerOptions.width;

            let bodyNode = d3.select(div).node();
            // TODO: use this
            let tooltipColor = this.commons.viewerOptions.tooltipColor ? this.commons.viewerOptions.tooltipColor : "#fff";

            let tooltip = (selection) => {

                let absoluteMousePos;

                let getPositions = (absoluteMousePos) => {
                    let rightSide = (absoluteMousePos[0] > viewerWidth);
                    let left = 0,
                        top = 0;
                    if (rightSide) {
                        left = absoluteMousePos[0] + 10 - (tooltipDiv.node().getBoundingClientRect().width);
                        top = absoluteMousePos[1] - 55;
                    } else {
                        left = absoluteMousePos[0] - 15;
                        top = absoluteMousePos[1] - 55;
                    }
                    let positions = {
                        left: left,
                        top: top
                    };
                    return positions
                };

                let getMyMessage = (pD) => {
                    let tooltip_message = '';
                    if (object.type === "path") {
                        tooltip_message = getMessage(pD[0]);
                    }
                    else if (object.type === "curve") {
                        let elemHover = updateLineTooltipFunction(absoluteMousePos[0], pD, scalingFunction, labelTrackWidth);
                        tooltip_message = getMessage(elemHover, 'curve');
                    }
                    else if (object.type === "circle") {
                        tooltip_message = getMessage(pD, 'circle');
                    }
                    else if (object.type === "button") {
                        tooltip_message = getMessage(object);
                    } else {
                        tooltip_message = getMessage(pD);
                    }
                    return tooltip_message
                };

                let drawMyTooltip = (pD) => {
                    absoluteMousePos = d3.mouse(bodyNode);
                    let positions = getPositions(absoluteMousePos);
                    let tooltip_message = getMyMessage(pD);

                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltipDiv
                        .html(tooltip_message)
                        .style("left", positions['left']+'px')
                        .style("top", positions['top']+'px');
                };

                selection
                // tooltip
                    .on("mouseover", (pD) => {
                        drawMyTooltip(pD);
                    })
                    .on('mousemove', (pD) => {
                        drawMyTooltip(pD);
                    })
                    .on("mouseout", function(d) {
                        tooltipDiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .on('click', (pD) => {

                        if (object.type !== "button") { // rect

                            // TODO: define data for event exporting when clicking rects
                            // TODO: fix exports.event.target.__data__ is undefined

                            let xTemp;
                            let yTemp;
                            let xRect;
                            let widthRect;
                            let elemHover;

                            let forSelection = pD;
                            if (object.type === "curve") {
                                elemHover = updateLineTooltipFunction(absoluteMousePos[0], pD, scalingFunction, labelTrackWidth);
                                forSelection = elemHover;
                            };

                            // path is array of pD, line is elemHover, all the rest is a pD object
                            object['selectedFeature'] = forSelection;
                            let feature_detail_object = object;

                            this.colorSelectedFeat(pD.id, object, divId);


                            // trigger feature_selected event
                            if (CustomEvent) {
                                let event = new CustomEvent(this.commons.events.FEATURE_SELECTED_EVENT, {
                                    detail: feature_detail_object
                                });
                                this.commons.svgElement.dispatchEvent(event);
                            } else {
                                console.warn("CustomEvent is not defined....");
                            }
                            if (this.commons.trigger) this.commons.trigger(this.commons.events.FEATURE_SELECTED_EVENT, feature_detail_object);

                        } else {

                            // button
                            this.clickTagFunction(object)
                        }
                    });
            };

            return tooltip;
        };
    }

    constructor(commons: {}) {
        super(commons);
    }
}

export default Tool