import ComputingFunctions from "./helper";
import Calculate from "./calculate";
import * as d3 from './custom-d3';

class PreComputing {

    private commons;
    private calculate: Calculate;

    public path(object) {

        let height;
        if (object.height) { height = object.height } else { height = 3 }
        object.data.sort((a, b) => {
            return a.x - b.x;
        });
        this.commons.level = this.calculate.addNLines(object.data);
        object.data = object.data.map((d) => {
            return [{
                x: d.x,
                y: 0,
                id: d.id,
                description: d.label || '',
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
            }]
        });
        // object.pathLevel = this.commons.level * height + 5; // changed this according to Necci's last commit
        object.pathLevel = (this.commons.level * height) / 2 + 5;
        this.commons.pathLevel = this.commons.level * height + 5;
        object.height = this.commons.level * height + 5;

    };

    public preComputingLine(object) {
        const yScores = object.data[0].map(o => o.y);
        const maxScore = Math.max(...yScores);
        const minScore = Math.min(...yScores);

        if (!object.height) { object.height = this.commons.step / 2 }
        let shift = parseInt(object.height);
        let level = 0;

        for (const i of object.data.keys()) {
            object.data[i].sort((a, b) => {
                return a.x - b.x;
            });
            if (object.data[i][0].y !== 0) {
                object.data[i].unshift({
                    x: object.data[i][0].x - 1,
                    y: 0
                })
            }
            if (object.data[i][object.data[i].length - 1].y !== 0) {
                object.data[i].push({
                    x: object.data[i][object.data[i].length - 1].x + 1,
                    y: 0
                })
            }
            let maxValue = Math.max.apply(Math, object.data[i].map((o) => {
                //return Math.abs(o.y);
                //return Math.round(Math.abs(o.y))+1;
                return 1;
            }));
            // overwrite this value if given option ymax
            if ('yLim' in object) {
                // maxValue = maxScore
                maxValue = object['yLim'];
            }
            level = maxValue > level ? maxValue : level;

            object.data[i] = [object.data[i].map((d) => {
                let yValue = d.y;
                if (d.y > maxValue) {
                    yValue = maxValue;
                }
                return {
                    x: d.x ,
                    y: yValue,
                    id: d.id,
                    description: d.label || '',
                    tooltip: d.tooltip || ''
                }
            })
            ]
        }

        // this.commons.lineYScale.range([0, -(shift)]).domain([0, -(level)]);
        this.commons.lineYScale.range([minScore, maxScore]).domain([0, this.commons.step/50]);

        object.pathLevel = shift * 10 + 5;
        object.level = level;
        object.shift = shift * 10 + 5;

    };

    public multipleRect(object) {
        object.data.sort((a, b) => {
            return a.x - b.x;
        });
        object.level = this.calculate.addNLines(object.data);
        object.pathLevel = this.commons.level * 10 + 5;

        this.commons.level = object.level;
        this.commons.pathLevel = object.pathLevel;

    };

    constructor(commons) {
        this.commons = commons;
        this.calculate = new Calculate(commons);
    }
}

class FillSVG extends ComputingFunctions {

    private preComputing: PreComputing;
    private calculate: Calculate;
    private storeData;

    private hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    private isLight(mycolor) {
        let color = mycolor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        let r = color[1];
        let g = color[2];
        let b = color[3];
        // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
        let hsp = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        );
        // Using the HSP value, determine whether the color is light or dark
        if (hsp>127.5) {
            return true;
        }
        else {
            return false;
        }
    }

    private sbcRip(d, i, r) {
        let l = d.length, RGB = {};
        if (l > 9) {
            d = d.split(",");
            if (d.length < 3 || d.length > 4) return null;//ErrorCheck
            RGB[0] = i(d[0].slice(4));
            RGB[1] = i(d[1]);
            RGB[2] = i(d[2]);
            RGB[3] = d[3] ? parseFloat(d[3]) : -1;
        } else {
            if (l === 8 || l === 6 || l < 4) return null; //ErrorCheck
            if (l < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? d[4] + "" + d[4] : ""); //3 digit
            d = i(d.slice(1), 16);
            RGB[0] = d >> 16 & 255;
            RGB[1] = d >> 8 & 255;
            RGB[2] = d & 255;
            RGB[3] = l === 9 || l === 5 ? r(((d >> 24 & 255) / 255) * 10000) / 10000 : -1;
        }
        return RGB;
    };

    private shadeBlendConvert(p, from="#000", to=null) {
        if (typeof(p) !== "number" ||
            p < -1 ||
            p > 1 ||
            typeof(from) !== "string" ||
            (from[0] !== 'r' && from[0] !== '#') ||
            (typeof(to) !== "string" && typeof(to) !== "undefined")) return null; //ErrorCheck
        let i = parseInt;
        let r = Math.round;
        let h = from.length > 9;
        h = typeof(to) === "string" ? to.length > 9 ? true : to === "c" ? !h : false : h;
        let b = p < 0;
        p = b ? p * -1 : p;
        to = to && to !== "c" ? to : b ? "#000000" : "#FFFFFF";
        let f = this.sbcRip(from, i, r);
        let t = this.sbcRip(to, i, r);
        if (!f || !t) return null; //ErrorCheck
        if (h) return "rgb(" + r((t[0] - f[0]) * p + f[0]) + "," + r((t[1] - f[1]) * p + f[1]) + "," + r((t[2] - f[2]) * p + f[2]) + (f[3] < 0 && t[3] < 0 ? ")" : "," + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 10000) / 10000 : t[3] < 0 ? f[3] : t[3]) + ")");
        else return "#" + (0x100000000 + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 255) : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255) * 0x1000000 + r((t[0] - f[0]) * p + f[0]) * 0x10000 + r((t[1] - f[1]) * p + f[1]) * 0x100 + r((t[2] - f[2]) * p + f[2])).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3);
    }

    public typeIdentifier(feature) {
        let thisYPosition;
        if (feature.type === "curve") {
            if (!feature.height) { feature.height = 10 }
            let shift = parseInt(feature.height);

            thisYPosition = this.commons.YPosition //+ shift * 10  ;
        } else {
            thisYPosition = this.commons.YPosition;
        }

        this.tagArea(feature, thisYPosition);
        // yData is data for flags, this.rectangle etc. draw the actual objects

        this.commons.yData.push({
            hasSubFeatures: feature.subfeatures ? true: false,
            tooltip: feature.tooltip,
            label: feature.label,
            id: feature.id,
            y: thisYPosition,
            flagColor: feature.flagColor,
            flagLevel: feature.flagLevel,
            isOpen: feature.isOpen,
            ladderColor: feature.ladderColor? feature.ladderColor : null,
            ladderLabel: feature.ladderLabel? feature.ladderLabel : null,
            yMin: feature.yMin? feature.yMin : null,
            yMax: feature.yMax? feature.yMax : null
        });

        if (feature.type === "rect") {

            if ('variant' in feature && feature.variant == "overlap") {
                this.rectangle(feature, this.commons.YPosition);
            } else {
                this.preComputing.multipleRect(feature);
                this.rectangle(feature, this.commons.YPosition);
            }
        }
        else if (feature.type === "arrow") {
          this.arrow(feature, this.commons.YPosition);
        }
        else if (feature.type === "text") {

            this.commons.scaling.range([5, this.commons.viewerOptions.width - 5]);
            let seq = this.displaySequence(this.commons.current_extend.length);
            if (seq === false) {
                this.sequenceLine();
            }
            else if (seq === true) {
                this.sequence(feature.data, this.commons.YPosition);
            }
            //fillSVG.sequence(object.data, YPosition);

        }
        else if (feature.type === "unique") {

            this.unique(feature, this.commons.YPosition);
            // this.commons.YPosition += 5;

        }
        else if (feature.type === "circle") {

            this.circle(feature, this.commons.YPosition);
            // this.commons.YPosition += 5;

        }
        else if (feature.type === "multipleRect") {

            this.preComputing.multipleRect(feature);
            this.multipleRect(feature, this.commons.YPosition, this.commons.level);
            this.commons.YPosition += (this.commons.level - 1) * 10;

        }
        else if (feature.type === "path") {

            // this type of object overwrites object data, after fillSVG go back to original
            this.storeData = feature.data;
            this.preComputing.path(feature);
            this.path(feature, this.commons.YPosition - 8);
            feature.data = this.storeData;
            // this.commons.YPosition += this.commons.pathLevel;

        }
        else if (feature.type === "curve") {

            // this type of object overwrites object data, after fillSVG go back to original
            this.storeData = feature.data;
            if (!(Array.isArray(feature.data[0]))) feature.data = [feature.data];
            if (!(Array.isArray(feature.color))) feature.color = [feature.color];
            let negativeNumbers = false;
            feature.data.forEach((d) => {
                if (d.filter((l) => {
                        return l.y < 0
                    }).length) negativeNumbers = true;
            });
            this.preComputing.preComputingLine(feature);

            this.fillSVGLine(feature, this.commons.YPosition);
            feature.data = this.storeData;
            this.commons.YPosition += 7 // this.commons.step // feature.pathLevel;
            // this.commons.YPosition += negativeNumbers ? feature.pathLevel - 5 : 0;

        }
        else if (feature.type === "lollipop") {
            this.commons.YPosition += 7;
            this.lollipop(feature, this.commons.YPosition);

        }
    }

    public tagArea(object, thisYPosition) {

        // var threeArray = [showDisorderContentTag, showViewerTag, showLinkTag];

        // adjust height not triangle
        if (object.type !== 'rect') {thisYPosition -= 5}

        let id = 't' + object.id + "_tagarea";
        let featureArea = this.commons.tagsContainer.append("g")
            .attr("class", "tagGroup")
            .attr("id", id)
            .attr("transform", "translate(0," + thisYPosition + ")");

        // ad areas in any case
        if (object.sidebar) {

            let objectPos = 0;
            // check type and add html elements accordingly
            for (const bt of object.sidebar) {
                if (bt.type) {
                    if (bt.type !== "button" && bt.type !== "percentage" && bt.type !== "link" && bt.type !== "icon") {
                        this.commons.logger.error("Unknown type of button", {method:'addFeatures',fvId:this.commons.divId,featureId:object.id,buttonId:bt.buttonId})
                    } else {

                        let gButton = featureArea
                            .append('g')
                            .attr("id", id + '_button_' + bt.id)
                            .attr("transform", "translate(" + objectPos + ",0)")
                            .data([{
                                label: object.label,
                                featureId: object.id,
                                data: object,
                                type: "button",
                                id: bt.id,
                                tooltip: bt.tooltip
                            }]);

                        let content;
                        if (bt.type == "button") {
                            let cl = this.hexToRgb(this.commons.viewerOptions.flagColor);
                            let col = 'rgba(' + [cl.b, cl.g, cl.r].join(',') + ')'
                            let colalph = 'rgba(' + [cl.b, cl.g, cl.r].join(',') + ',0.8)'
                            let coltext = this.isLight(col) ? 'black' : 'white';
                            content = `<button class="mybutton" id="${bt.id}" style="background-color: ${colalph}; border:2px solid ${col}">${bt.label}</button>`
                        }
                        else if (bt.type == "percentage") {
                            let disordersString = bt.label.toString() + '%';
                            let colorrgb = this.hexToRgb(this.gradientColor(bt.label));
                            let color = 'rgba(' + [colorrgb.r, colorrgb.g, colorrgb.b].join(',') + ')';
                            let textColor = this.isLight(color) ? "black" : "white";
                            content = `<button id="${bt.id}" class="mybutton mybutton-disabled" style="background-color: ${color.replace(')', ',0.8)')}; color: ${textColor}; border: 2px solid ${color}"><span style="font-size: small">${disordersString}</span></button>`
                        }
                        else if (bt.type == "link") {
                            let linkicon = "M9.26 13c-0.167-0.286-0.266-0.63-0.266-0.996 0-0.374 0.103-0.724 0.281-1.023l-0.005 0.009c1.549-0.13 2.757-1.419 2.757-2.99 0-1.657-1.343-3-3-3-0.009 0-0.019 0-0.028 0l0.001-0h-4c-1.657 0-3 1.343-3 3s1.343 3 3 3v0h0.080c-0.053 0.301-0.083 0.647-0.083 1s0.030 0.699 0.088 1.036l-0.005-0.036h-0.080c-2.761 0-5-2.239-5-5s2.239-5 5-5v0h4c0.039-0.001 0.084-0.002 0.13-0.002 2.762 0 5.002 2.239 5.002 5.002 0 2.717-2.166 4.927-4.865 5l-0.007 0zM10.74 7c0.167 0.286 0.266 0.63 0.266 0.996 0 0.374-0.103 0.724-0.281 1.023l0.005-0.009c-1.549 0.13-2.757 1.419-2.757 2.99 0 1.657 1.343 3 3 3 0.009 0 0.019-0 0.028-0l-0.001 0h4c1.657 0 3-1.343 3-3s-1.343-3-3-3v0h-0.080c0.053-0.301 0.083-0.647 0.083-1s-0.030-0.699-0.088-1.036l0.005 0.036h0.080c2.761 0 5 2.239 5 5s-2.239 5-5 5v0h-4c-0.039 0.001-0.084 0.002-0.13 0.002-2.762 0-5.002-2.239-5.002-5.002 0-2.717 2.166-4.927 4.865-5l0.007-0z"
                            content = `<button class="mybutton" id="${bt.id}"><svg class="helperButton"><path d="${linkicon}"></path></svg></button>`
                        }
                        else if (bt.type == "icon") {
                            content = `<button class="mybutton" id="${bt.id}"><svg class="helperButton"><path d="${bt.label}"></path></svg></button>`
                        }

                        gButton
                            .append('foreignObject') // foreignObject can be styled with no limitation by user
                            .attr("width", "100%")
                            .attr("height", "100%")
                            .attr("y",-6)
                            .html(content)

                        if (bt.type !== "percentage") {
                            gButton.call(this.commons.d3helper.genericTooltip(bt));
                        }

                        // update object position
                        objectPos += (<HTMLElement>d3.select('#'+bt.id).node()).getBoundingClientRect().width + 3;

                    }
                }
                else if (bt.content) {

                    let gHtml = featureArea
                        .append('g')
                        .attr("id", id + '_button_' + bt.id)
                        .attr("transform", "translate(" + (objectPos + 3) + ",0)")
                        .data([{
                            label: object.label,
                            featureId: object.id,
                            data: object,
                            type: "button",
                            id: bt.id
                        }]);

                    gHtml
                        .append('foreignObject')
                        .attr("y", -6)
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .attr("height", "100%")
                        .append('xhtml:body')
                        .style("margin", "0")
                        .attr("id", bt.id)
                        .html(bt.content)
                        .call(this.commons.d3helper.genericTooltip(bt));

                    // objectPos += 50;
                    // get width of the drawn object
                    try {
                        let contentwidth = (<HTMLElement>d3.select(`#${bt.id}`).select('*').node()).getBoundingClientRect().width
                        objectPos += contentwidth + 5;
                    } catch (e) {
                        objectPos += 100;
                    }

                } else {
                    this.commons.logger.error("Neither html content nor type of button is specified", {method:'addFeatures',fvId:this.commons.divId,featureId:object.id,buttonId:bt.buttonId})
                }
            }

        }
    }

    public sequence(seq, start = 0) {
        // remove eventual sequence still there (in transitions)
        this.commons.svgContainer.selectAll(".mySequence").remove();
        //Create group of sequence
        let sequenceAAs = this.commons.svgContainer.append("g")
            .attr("class", "mySequence sequenceGroup");
        sequenceAAs
            .selectAll(".AA")
            .data(seq)
            .enter()
            .append("text")
            //.attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("class", "AA")
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => {
                // index starts from 0
                return this.commons.scaling.range([2, this.commons.viewerOptions.width - 2])(i + start)
            })
            .attr("y", this.commons.step)
            .attr("font-size", "12px")
            .attr("font-family", "monospace")
            .text((d) => {
                return d
            })
    }

    public sequenceLine() {
        // remove eventual sequence already there (in transitions)
        this.commons.svgContainer.selectAll(".mySequence").remove();
        //Create line to represent the sequence
        if (this.commons.viewerOptions.dottedSequence) {
            let dottedSeqLine = this.commons.svgContainer.selectAll(".sequenceLine")
                .data([[{x: 1, y: this.commons.step - this.commons.elementHeight / 2}, {
                    x: this.commons.fvLength,
                    y: this.commons.step - this.commons.elementHeight / 2
                }]])
                //.scale(scaling)
                .enter()
                .append("path")
                // .attr("clip-path", "url(#clip)") // firefox compatibility
                .attr("d", this.commons.line)
                .attr("class", "mySequence sequenceLine")
                .style("z-index", "0")
                .style("stroke", "grey")
                .style("stroke-dasharray", "1,3")
                .style("stroke-width", "1px")
                .style("stroke-opacity", 1);

            // dottedSeqLine
            //     .transition()
            //     .duration(500)
            //     .style("stroke-opacity", 1);
        }
    }

    public rectangle(object, position) {

        //var rectShift = 20;
        if (!object.height) object.height = this.commons.elementHeight;
        let rectHeight = this.commons.elementHeight;

        let rectShift = rectHeight + rectHeight / 3;
        let lineShift = rectHeight / 2 - 6;
        position = Number(position) + 3; // center line

        let rectsPro = this.commons.svgContainer.append("g")
            .attr("class", "rectangle featureLine")
            //.attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                return 'c' + object.id + '_container'
            });
        // commenting to dist

        let dataLine = [];
        // case with empty data
        if (!this.commons.level) {
            this.commons.level = 1
        }
        for (let i = 0; i < this.commons.level; i++) {
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
            .attr("class", () => {
                return "line " + object.className
            })
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");


        let rectsProGroup = rectsPro.selectAll("." + object.className + "Group")
            .data(object.data)
            .enter()
            .append("g")
            .attr("class", object.className + "Group")
            .attr("transform", (d) => {
                return "translate(" + this.rectX(d) + ",0)"
            });

        rectsProGroup
            .append("rect")
            .attr("class", (d) => {
                if (!d.className) {
                    return "element " + object.className
                } else {
                    return "element " + object.className + " " + d.className
                }
            })
            .attr("id", (d) => {
                // add id to object
                let id = "f_" + object.id + '_' + d.x + '-' + d.y;
                d.id = id;
                return id;
            })
            .attr("y", (d) => {
                return d.level * rectShift
            })
            .attr("ry", (d) => {
                return this.commons.radius;
            })
            .attr("rx", (d) => {
                return this.commons.radius;
            })
            .attr("width", (d) => {
                return this.rectWidth2(d)
            })
            .attr("height", this.commons.elementHeight)
            .style("fill", (d) => {
               return d.color || object.color
            })
            .style("fill-opacity", (d) => {
                if (d.opacity) {
                    return d.opacity
                } else if (object.opacity) {
                    return object.opacity
                } else {
                    return "0.6"
                }
            })
            .style("stroke", (d) => {
                if ("stroke" in d) {
                    return d.stroke
                } else if ("stroke" in object) {
                    return object.stroke
                } else {
                    return d.color
                }
            })
            .style("z-index", "13")
            .call(this.commons.d3helper.tooltip(object));


        rectsProGroup
            .append("text")
            .attr("class", "element " + object.className + "Text")
            .attr("y", (d) => {
                return d.level * rectShift + rectHeight / 2
            })
            .attr("dy", "0.35em")
            .style("font-size", "10px")
            .text((d) => {
                return d.label
            })
            .style("fill", "rgba(39, 37, 37, 0.9)")
            .style("z-index", "15")
            .style("visibility",  (d) => {
                if (d.label) {
                    return (this.commons.scaling(d.y) - this.commons.scaling(d.x)) > d.label.length * 8 && object.height > 11 ? "visible" : "hidden";
                } else return "hidden";
            })
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(rectsProGroup);
        let uniqueShift = rectHeight > 12 ? rectHeight - 6 : 0;
        this.commons.YPosition += this.commons.level < 2 ? uniqueShift : (this.commons.level - 1) * rectShift + uniqueShift;

    }

    public unique(object, position) {

        let rectsPro = this.commons.svgContainer.append("g")
            .attr("class", "uniquePosition featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string'
                return 'c' + object.id + '_container'
            });

        let dataLine = [];
        // case with empty data
        if (!this.commons.level) {
            this.commons.level = 1
        }
        for (let i = 0; i < this.commons.level; i++) {
            dataLine.push([{
                x: 1,
                y: 0,
            }, {
                x: this.commons.fvLength,
                y: 0
            }]);
        }

        rectsPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", () => {
                return "line " + object.className
            })
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");

        let readyData = [...object.data];

        rectsPro.selectAll("." + object.className + 'Unique')
            .data(readyData)
            .enter()
            .append("rect")
            // .attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                let id = "f_" + object.id + '_' + d.x + '-' + d.y;
                d.id = id;
                return id;
            })
            .attr("x", (d) => {
                return this.commons.scaling(d.x - 0.4)
            })
            .attr("width", (d) => {
                if (this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4) < 2) return 2;
                else return this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4);
            })
            .attr("height", this.commons.elementHeight)
            .style("fill", (d) => {
                return d.color || object.color
            })
            .style("z-index", "3")
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(rectsPro);
    }

    public lollipop(object, position) {
        let circlesPro = this.commons.svgContainer.append("g")
            .attr("class", "pointPosition featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                return 'c' + object.id + '_container'
            });

        let dataLine = [];
        dataLine.push([{
            x: 1,
            y: 0
        }, {
            x: this.commons.fvLength,
            y: 0
        }]);

        // basal line
        circlesPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", () => {
                return "line " + object.className
            })
            .style("z-index", "0")
            .style("stroke", 'gray')
            .style("stroke-width", "0.5px");

        let readyData = [...object.data];

        // lollipop base
        circlesPro.selectAll("." + object.className + 'Lollipop')
            .data(readyData)
            .enter()
            .append("line")
            .attr("x1", (d) => {return this.commons.scaling(d.x)})
            .attr("x2", (d) => {return this.commons.scaling(d.x)})
            .attr("y2", (d) => {
                let w = this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4);
                if (this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4) < 2) w = 2;
                return w + 2;
            })
            .attr("y1", -8)
            .attr("class", "lineElement " + object.className)
            .style("stroke", (d) => {
                return d.color || object.color
            })
            .style("stroke-width", 1)

        // lollipop head
        circlesPro.selectAll("." + object.className + 'Lollipop')
            .data(readyData)
            .enter()
            .append("circle")
            //.attr("clip-path", "url(#clip)")
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                return "f_" + object.id;
            })
            // circle dimensions
            .attr("cx", (d) => {
                return this.commons.scaling(d.x)
            })
            .attr("cy", "-8") // same as height
            // circle radius
            .attr("r", (d) => {
                if (d.y<=1) {
                    return d.y*this.commons.elementHeight*0.5
                } else {
                    this.commons.logger.warn("Maximum circle radius is 1", {method:'addFeatures',fvId:this.commons.divId,featureId:object.id})
                    return this.commons.elementHeight*0.5
                }
            })
            .attr("width", (d) => {
                let w = this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4);
                if (this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4) < 2) w = 2;
                return w;
            })
            .style("fill", (d) => {
                return d.color || object.color
            })
            .style("fill-opacity", (d) => {
                if (d.opacity) {
                    return d.opacity
                } else if (object.opacity) {
                    return object.opacity
                } else {
                    return "1"
                }
            })
            .style("stroke", (d) => {
                if ("stroke" in d) {
                    return d.stroke
                } else if ("stroke" in object) {
                    return object.stroke
                } else {
                    return d.color
                }
            })
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(circlesPro);
    }

    public circle(object, position) {
        let circlesPro = this.commons.svgContainer.append("g")
            .attr("class", "pointPosition featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                return 'c' + object.id + '_container'
            });

        let dataLine = [];
        dataLine.push([{
            x: 1,
            y: 0
        }, {
            x: this.commons.fvLength,
            y: 0
        }]);

        // basal line
        circlesPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", 'grey')
            .style("stroke-width", "0.5px");

        let readyData = [...object.data];

        circlesPro.selectAll("." + object.className + 'Circle')
            .data(readyData)
            .enter()
            .append("circle")
            //.attr("clip-path", "url(#clip)")
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                return "f_" + object.id;
            })
            // circle dimensions
            .attr("cx", (d) => {
                return this.commons.scaling(d.x)
            })
            .attr("cy", "5") // same as height
            // circle radius
            .attr("r", (d) => {
                if (d.y<=1) {
                    return d.y*this.commons.elementHeight
                } else {
                    this.commons.logger.warn("Maximum circle radius is 1", {method:'addFeatures',fvId:this.commons.divId,featureId:object.id})
                    return this.commons.elementHeight
                }
            })
            .attr("width", (d) => {
                if (this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4) < 2) return 2;
                else return this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4);
            })
            .style("fill", (d) => {
                return d.color || object.color
            })
            .style("fill-opacity", (d) => {
              if (d.opacity) {
                return d.opacity
              } else if (object.opacity) {
                return object.opacity
              } else {
                return "1"
              }
            })
            .style("stroke", (d) => {
              if ("stroke" in d) {
                return d.stroke
              } else if ("stroke" in object) {
                return object.stroke
              } else {
                return d.color
              }
            })
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(circlesPro);
    }

    public path(object, position) {

        if (!object.height) object.height = this.commons.elementHeight;
        let pathHeight = this.commons.elementHeight;

        let pathsDB = this.commons.svgContainer.append("g")
            .attr("class", "pathing featureLine")
            //.attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                return 'c' + object.id + '_container'
            });

        let dataLine = [];
        dataLine.push([{
            x: 1,
            y: 0
        }, {
            x: this.commons.fvLength,
            y: 0
        }]);

        pathsDB.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", 'grey')
            .style("stroke-width", "0.5px");

        pathsDB.selectAll(".path" + object.className)
            .data(object.data)
            .enter()
            .append("path")
            //.attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                return "f_" + d[0].id + Math.random().toString(36).substring(7);
            })
            .attr("d", this.commons.lineBond)
            .style("fill", "none")
            .style("stroke", (d) => {
                return d[0].color || object.color
            })
            .style("z-index", "3")
            .style("stroke-width", (d) => {
                return d[0].opacity || object.opacity
            })
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(pathsDB);
        // re-init object.heigth
        object.height = this.commons.step / 2;

    }

    public arrow(object, position) {
        //var rectShift = 20;
        if (!object.height) object.height = this.commons.elementHeight;
        let rectHeight = this.commons.elementHeight;

        let rectShift = rectHeight + rectHeight / 3;
        let lineShift = rectHeight / 2 - 6;
        position = Number(position) + 3; // center line

        let rectsPro = this.commons.svgContainer.append("g")
            .attr("class", "arrow featureLine")
            //.attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                return 'c' + object.id + '_container'
            });
        // commenting to dist

        let dataLine = [];
        // case with empty data
        if (!this.commons.level) {
            this.commons.level = 1
        }
        for (let i = 0; i < this.commons.level; i++) {
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
            .attr("y", 0)
            .attr("d", this.commons.line)
            .attr("class", () => {
                return "line " + object.className
            })
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");

        let rectsProGroup = rectsPro.selectAll("." + object.className + "Group")
            .data(object.data)
            .enter()
            .append("g")
            .attr("class", object.className + "Group")
            .attr("transform", (d) => {
                var transform = "translate(" + this.rectX(d) + ",0)";
                if (d.direction === "left") {
                    transform += " scale(-1, 1)";
                };
                return transform
            });

        rectsProGroup
            .append("path")
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                let id = "f_" + object.id + '_' + d.x + '-' + d.y;
                d.id = id;
                return id;
            })
            .attr("y", 0)
            .attr("ry", (d) => this.commons.radius)
            .attr("rx", (d) => this.commons.radius)

            .attr("d", (d) => this.arrowPath(d))
            .style("z-index", "13")
            .style("fill-opacity", (d) => {
                if (d.opacity) {
                    return d.opacity
                } else if (object.opacity) {
                    return object.opacity
                } else {
                    return "0.6"
                }
            })
            .style("fill", (d) => {
                return d.color || object.color
            })
            .style("stroke", (d) => {
                if ("stroke" in d) {
                    return d.stroke
                } else if ("stroke" in object) {
                    return object.stroke
                } else {
                    return d.color
                }
            })
            .call(this.commons.d3helper.tooltip(object));

        rectsProGroup
            .append("text")
            .attr("class", "element " + object.className + "Text")
            .attr("y", (d) => rectHeight / 2)
            .attr("dy", "0.35em")
            .style("font-size", "10px")
            .text((d) => d.label)
            .style("fill", "rgba(39, 37, 37, 0.9)")
            .style("z-index", "15")
            .style("visibility",  (d) => {
                if (d.label) {
                    return (this.commons.scaling(d.y) - this.commons.scaling(d.x)) > d.label.length * 8 && object.height > 11 ? "visible" : "hidden";
                } else return "hidden";
            })
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(rectsProGroup);
        let uniqueShift = rectHeight > 12 ? rectHeight - 6 : 0;
        this.commons.YPosition += this.commons.level < 2 ? uniqueShift : (this.commons.level - 1) * rectShift + uniqueShift;

    }

    public fillSVGLine(object, position = 0) {
        // if (!object.interpolation) object.interpolation = "curveBasis"; // TODO: not sensitive to interpolation now
        if (object.fill === undefined) object.fill = true;
        let histoG = this.commons.svgContainer.append("g")
        // necessary id to get height when placing tags
            .attr("id", () => {return 'c' + object.id + '_container'})
            .attr("class", "lining featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("heigth", object.curveHeight);

        let dataLine = [];
        dataLine.push([{
            x: 1,
            y: 0
        }, {
            x: this.commons.fvLength,
            y: 0
        }]);

        /*histoG.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("clip-path", "url(#clip)")
            .attr("d", this.commons.lineBond)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", "black")
            .style("stroke-width", "1px");*/
        // interpolate
        //this.commons.lineGen().curve(object.interpolation)

        object.data.forEach((dd, i) => {

            histoG.selectAll("." + object.className + i)
                .data(dd)
                .enter()
                .append("path")
                //.attr("clip-path", "url(#clip)") // firefox compatibility
                .attr("class", "element " + object.className + " " + object.className + i)
                // d3 v4
                .attr("d", this.commons.lineGen.y((d) => {
                        return this.commons.lineYScale(-d.y) * 10 + object.shift;
                    })
                )
                //.style("fill", object.fill ? this.shadeBlendConvert(0.6, object.color[i]) || this.shadeBlendConvert(0.6, "#000") : "none")
                .style("fill", object.color)
                .style("fill-opacity", "0.8")
                .style("stroke", object.color[i] || "#000")
                .style("z-index", "3")
                .style("stroke-width", "2px")
                .call(this.commons.d3helper.tooltip(object));

        });

        this.forcePropagation(histoG);
    }

    public multipleRect(object, position = 0, level = this.commons.level) {
        let rectHeight = 8;
        let rectShift = 10;

        let rects = this.commons.svgContainer.append("g")
            .attr("class", "multipleRects featureLine")
            .attr("transform", "translate(0," + position + ")");

        for (let i = 0; i < level; i++) {
            rects.append("path")
                .attr("d", this.fillSVGLine([{
                    x: 1,
                    y: (i * rectShift - 2)
                }, {
                    x: this.commons.fvLength,
                    y: (i * rectShift - 2)
                }]))
                .attr("class", () => {
                    return "line " + object.className
                })
                .style("z-index", "0")
                .style("stroke", object.color)
                .style("stroke-width", "1px");
        }

        rects.selectAll("." + object.className)
            .data(object.data)
            .enter()
            .append("rect")
            //.attr("clip-path", "url(#clip)") // firefox compatibility
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                return "f_" + object.id + Math.random().toString(36).substring(7);
            })
            .attr("x", (d) => {
                return this.commons.scaling(d.x);
            })
            .attr("y", (d) => {
                return d.level * rectShift;
            })
            .attr("ry", (d) => {
                return this.commons.radius;
            })
            .attr("rx", (d) => {
                return this.commons.radius;
            })
            .attr("width", (d) => {
                return (this.commons.scaling(d.y) - this.commons.scaling(d.x));
            })
            .attr("height", rectHeight)
            .style("fill", (d) => {
                return d.color || object.color
            })
            .style("z-index", "13")
            .call(this.commons.d3helper.tooltip(object));

        this.forcePropagation(rects);
    }

    // AXIS FUNCTIONS
    public reset_axis() {
        if (this.commons.animation) {
            this.commons.svgContainer.transition().duration(500);
        }
        this.commons.svgContainer
            .select(".x.axis")
            .call(this.commons.xAxis);
    }

    public addXAxis(position) {
        this.commons.svgContainer.append("g")
            .attr("class", "x axis XAxis")
            .attr("transform", "translate(0," + (position + 20) + ")")
            .call(this.commons.xAxis);
        if (!this.commons.viewerOptions.showAxis) {
            d3.select(`#${this.commons.divId}`).selectAll(".tick")
                .attr("display", "none")
        }
    };

    public updateXAxis(position) {
        this.commons.svgContainer.selectAll(".XAxis")
            .attr("transform", "translate(0," + (position + this.commons.step) + ")");
    };

    // BRUSH FUNCTION

    public resizeBrush() {

        if (this.commons.svgContainer) {
            if (this.commons.svgContainer.node() !== null) {
                let rectArea = this.commons.svgContainer.node().getBoundingClientRect();
                let thisbrush = this.commons.svgContainer.select(".brush");
                thisbrush.select("rect")
                    .attr('height', rectArea.height)
                    .attr('width', rectArea.width);
            }
        }
    };

    public addBrush() {

        this.commons.svgContainer
            .append("g")
            .attr("class", "brush")
            .attr("id", "fvbrush")
            .call(this.commons.brush)
        //.call(this.commons.brush.move, this.commons.scaling());
        this.resizeBrush()

    };

    // TOOLBAR ON TOP

    public showHelp() {

        /*let helpContent = "<div><strong>To zoom in :</strong> Left click to select area of interest</div>" +
            "<div><strong>To zoom out :</strong> Right click to reset the scale</div>" +
            "<div><strong>Zoom max  :</strong> Limited to <strong>" + this.commons.zoomMax.toString() + " " + this.commons.viewerOptions.unit + "</strong></div>";*/
        let helpContent = "To zoom in : Left click to select area of interest\n To zoom out : Right click to reset the scale\n Zoom max : Limited to " +
            this.commons.viewerOptions.zoomMax.toString();

        alert(helpContent)
    }


    constructor(commons: {}) {
        super(commons);
        this.preComputing = new PreComputing(commons);
    }
}

export default FillSVG;
