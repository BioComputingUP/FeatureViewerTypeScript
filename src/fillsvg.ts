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
            }]
        });
        // object.pathLevel = this.commons.level * height + 5; // changed this according to Necci's last commit
        object.pathLevel = (this.commons.level * height) / 2 + 5;
        this.commons.pathLevel = this.commons.level * height + 5;
        object.height = this.commons.level * height + 5;

    };

    public preComputingLine(object) {

        if (!object.height) { object.height = 10 };
        let shift = parseInt(object.height);
        let level = 0;

        for (let i in object.data) {
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
            if ('yMax' in object) {
                maxValue = object['yMax'];
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
                    description: d.description || '',
                    tooltip: d.tooltip || ''
                }
            })
            ]
        }

        this.commons.lineYScale.range([0, -(shift)]).domain([0, -(level)]);

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
    private storeData;

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

    public typeIdentifier(object) {

        // add tags after updating y position
        /*if (this.commons.viewerOptions.showDisorderContentTag || this.commons.viewerOptions.showLinkTag) {
            this.tagArea(object);
        }*/
        this.tagArea(object);
        // yData is data for flags, this.rectangle etc. draw the actual objects

        let thisYPosition;
        if (object.type === "curve") {
            if (!object.height) { object.height = 10 };
            let shift = parseInt(object.height);
            thisYPosition = this.commons.YPosition + shift * 10 - 4 ;
        } else {
            thisYPosition = this.commons.YPosition;
        }

        this.commons.yData.push({
            hasSubFeatures: object.hasSubFeatures,
            tooltip: object.tooltip,
            title: object.name,
            id: object.id,
            y: thisYPosition,
            filter: object.filter,
            flagColor: object.flagColor,
            flagLevel: object.flagLevel
        });

        if (object.type === "rect") {

            this.preComputing.multipleRect(object);
            this.rectangle(object, this.commons.YPosition);

        } else if (object.type === "text") {

            this.commons.scaling.range([5, this.commons.viewerOptions.width - 5]);
            let seq = this.displaySequence(this.commons.current_extend.length);
            if (seq === false) {
                this.sequenceLine();
            }
            else if (seq === true) {
                this.sequence(object.data, this.commons.YPosition);
            }
            //fillSVG.sequence(object.data, YPosition);

        } else if (object.type === "unique") {

            this.unique(object, this.commons.YPosition);
            this.commons.YPosition += 5;

        } else if (object.type === "circle") {

            this.circle(object, this.commons.YPosition);
            this.commons.YPosition += 5;

        } else if (object.type === "multipleRect") {

            this.preComputing.multipleRect(object);
            this.multipleRect(object, this.commons.YPosition, this.commons.level);
            this.commons.YPosition += (this.commons.level - 1) * 10;

        } else if (object.type === "path") {

            // this type of object overwrites object data, after fillSVG go back to original
            this.storeData = object.data;
            this.preComputing.path(object);
            this.path(object, this.commons.YPosition);
            object.data = this.storeData;
            this.commons.YPosition += this.commons.pathLevel;

        } else if (object.type === "curve") {

            // this type of object overwrites object data, after fillSVG go back to original
            this.storeData = object.data;
            if (!(Array.isArray(object.data[0]))) object.data = [object.data];
            if (!(Array.isArray(object.color))) object.color = [object.color];
            let negativeNumbers = false;
            object.data.forEach((d) => {
                if (d.filter((l) => {
                        return l.y < 0
                    }).length) negativeNumbers = true;
            });
            this.preComputing.preComputingLine(object);

            this.fillSVGLine(object, this.commons.YPosition);
            object.data = this.storeData;
            this.commons.YPosition += object.pathLevel;
            this.commons.YPosition += negativeNumbers ? object.pathLevel - 5 : 0;

        }
    }

    public tagArea(object) {

        let thisYPosition;
        if (object.type === "curve" || object.type === "path") {
            if (!object.height) { object.height = 10 };
            let shift = parseInt(object.height);
            thisYPosition = this.commons.YPosition + shift * 10 - 4 ;
        } else {
            thisYPosition = this.commons.YPosition;
        }

        // var threeArray = [showDisorderContentTag, showViewerTag, showLinkTag];

        let id = 't' + object.id + "_tagarea";
        this.commons.tagsContainer.append("g")
            .attr("class", "tagGroup")
            .attr("id", id)
            .attr("transform", "translate(0," + thisYPosition + ")");

        // ad areas in any case

        // add disorder content and button areas
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
            // one g for each button
            for (let i = 0; i < object.links.length; i++) {
                // add featureDetail in object.links
                let detailObj = {
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
                        //featureDetails: object
                    }]);
            }
        }

        // disorder
        let contentLength = 90;
        if (!this.commons.viewerOptions.showDisorderContentTag) {
            contentLength = 0;
        }

        if (object.disorderContent && this.commons.viewerOptions.showDisorderContentTag && this.commons.viewerOptions.buttonTrack) {

            let disordersString = object.disorderContent.toString() + '%';
            let color = this.gradientColor(object.disorderContent);
            let textColor = (color === "black") ? "white": "black";
            let disId = id + "_disorderContainer";

            var disorderContentTag = '<g style="padding-left:3px; padding-right:3px" id="' + disId + 
            '""><button class="mybutton mybutton--square" style="margin-left:4px; font-family: \'sans-serif\'; font-size: 13px; background-color:' +
            color + '"">' + '<span style="color:' + textColor + '">' + disordersString + '</span></button></g>'

            this.commons.tagsContainer.selectAll("#" + id + "_disorder")
                .append('foreignObject')
                .attr("y", -6)
                .attr("width", "100%")
                .attr("height", "100%")
                .append('xhtml:body')
                .style("margin", "0")
                .html(disorderContentTag)
                .call(this.commons.d3helper.genericTooltip("Disorder content"));

            // contentLength = d3.select(`#${disId}`).node().getBoundingClientRect().width + 10;
            let myd3node = d3.select(`#${disId}`).node();
            contentLength = (<HTMLElement>myd3node).getBoundingClientRect().width + 10;
        }

        // link buttons
        if (object.links) {

            let tagStart = contentLength;
            let size;

            for (let i = 0; i < object.links.length; i++) {

                //this.commons.tagsContainer.select("#" + id + '_button_' + object.links[i].name).attr("transform", "translate(" + size + ",0)")

                // translation of following length
                let obj = object.links[i];
                obj.type = 'button';
                let myid;

                this.commons.tagsContainer.selectAll("#" + id + "_button_" + obj.name)
                    .append('foreignObject')
                    .attr("id", () => {
                        myid = id + "_button_" + obj.name + "_foreingObject"
                        return myid
                    })
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("y",-9)
                    .attr("transform", "translate(" + tagStart + ",0)")
                    .append('xhtml:body')
                    .style("margin", "0")
                    .html(obj.html)
                    .call(this.commons.d3helper.tooltip(obj));

                // get size
                if (d3.select(`#${myid}`).select('.fvlink').node()) {
                    // container
                    d3.select(`#${myid}`).select('.fvlink').style("padding-left", "6px");
                    d3.select(`#${myid}`).select('.fvlink').style("padding-right", "6px");
                    //size = d3.select(`#${myid}`).select('.mybutton').node().getBoundingClientRect().width;
                } /*else {
                    size = 30;
                }*/
                size = 40;
                if (d3.select(`#${myid}`).select('button').node()) {
                    d3.select(`#${myid}`).select('button').attr("class", "mybutton mybutton--circle")
                }

                tagStart += size;

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
            .attr("clip-path", "url(#clip)")
            .attr("class", "AA")
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => {
                // index starts from 0
                let position =  this.commons.scaling.range([2, this.commons.viewerOptions.width - 2])(i + start)
                return position
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
            .attr("clip-path", "url(#clip)")
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
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                // add id to object
                let id = "f_" + object.id + Math.random().toString(36).substring(7);
                d.id = id;
                d.tooltip = d.tooltip;
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
                return d.description
            })
            .style("fill", "black")
            .style("z-index", "15")
            .style("visibility",  (d) => {
                if (d.description) {
                    return (this.commons.scaling(d.y) - this.commons.scaling(d.x)) > d.description.length * 8 && object.height > 11 ? "visible" : "hidden";
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
            .attr("id", (d) => {
                return "f_" + object.id + Math.random().toString(36).substring(7);
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

        circlesPro.selectAll(".line " + object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("d", this.commons.line)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", object.color)
            .style("stroke-width", "1px");

        let readyData = [ ...[{}], ...object.data];

        circlesPro.selectAll("." + object.className)
            .data(readyData)
            .enter()
            .append("circle")
            //.attr("clip-path", "url(#clip)")
            .attr("class", "element " + object.className)
            .attr("id", (d) => {
                return "f_" + object.id + Math.random().toString(36).substring(7);
            })
            // circle dimensions
            .attr("cx", (d) => {
                return this.commons.scaling(d.x)
            })
            .attr("cy", "5") // same as height
            // circle radius
            .attr("r", (d) => {return d.y*this.commons.elementHeight})
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
        let pathsDB = this.commons.svgContainer.append("g")
            .attr("class", "pathing featureLine")
            .attr("transform", "translate(0," + position + ")")
            .attr("id", () => {
                // random string
                // return divId + '_' + d.title.split(" ").join("_") + '_g'
                return 'c' + object.id + '_container'
            });

        let dataLine = [{
            x: 1,
            y: 0
        }, {
            x: this.commons.fvLength,
            y: 0
        }];

        // basal line
        /*pathsDB.selectAll(".line"+object.className)
            .data(dataLine)
            .enter()
            .append("path")
            .attr("clip-path", "url(#clip)")
            .attr("d", this.commons.lineBond)
            .attr("class", "line " + object.className)
            .style("z-index", "0")
            .style("stroke", 'grey')
            .style("fill", "none")
            .style("stroke-width", "1px");*/

        pathsDB.selectAll("." + object.className)
            .data(object.data)
            .enter()
            .append("path")
            .attr("clip-path", "url(#clip)")
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
                .attr("clip-path", "url(#clip)")
                .attr("class", "element " + object.className + " " + object.className + i)
                // d3 v4
                .attr("d", (object) => {
                    if (object.interpolation){
                        this.commons.lineGen.curve(d3[object.interpolation]())
                    } else {
                        this.commons.lineGen.curve(d3.curveBasis)
                    }
                })
                //.style("fill", object.fill ? this.shadeBlendConvert(0.6, object.color[i]) || this.shadeBlendConvert(0.6, "#000") : "none")
                .style("fill", object.color)
                .style("fill-opacity", "0.8")
                .style("stroke", object.color[i] || "#000")
                .style("z-index", "3")
                .style("stroke-width", "2px")
                .call(this.commons.d3helper.tooltip(object));

        });

        // for tooltips
        /*let toolContainer = histoG
            .append("g")
            .attr("class", "tooltip-group-container")
            .attr("heigth", object.curveHeight);
        for (let i = 1; i < this.commons.stringSequence.length; i++) {
            let tooltipObject = {
                x: i
            };
            console.log(i, histoG)
            toolContainer
                .append("g")
                .attr("class", "tooltip-container")
                .attr("transform", () => {
                    return "translate(" + this.rectX(tooltipObject) + ",5)"
                })
                .attr("height", this.commons.elementHeight)
                .append("rect")
                .attr("class", "tooltip-rect")
                .attr("width", (d) => {
                    return 10
                })
                .attr("height", () => {
                    console.log(object.curveHeight)
                    return object.curveHeight
                })
                .style("fill", (d) => {
                    return "red"
                })
                .style("fill-opacity", "0.6")
                .call(d3.helper.tooltip(object));
        }*/

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
            .attr("clip-path", "url(#clip)")
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

    constructor(commons: {}) {
        super(commons);
        this.preComputing = new PreComputing(commons);
    }
}

export default FillSVG;
