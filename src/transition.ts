import ComputingFunctions from './helper';
import * as d3 from 'd3';

export class SubfeaturesTransition extends ComputingFunctions {

    public area(gElement, newY) {
        gElement
            .attr("transform", "translate(0," + newY +")")
            .transition().duration(500);
    }
    public position(gElement, parentElementRow) {
        gElement
            .attr("position", "element(#"+ parentElementRow +")");
    }
    public Xaxis(axis, newY) {
        axis
            .attr("transform", "translate(0," + newY +")")
            .transition().duration(500);
    }
    public containerH(container, newH) {
        container
            .attr("height", newH)
    }

    constructor(commons: {}) {
        super(commons);
    }
}

export class Transition extends ComputingFunctions {

    public basalLine(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        if (object.type === "unique" || object.type === "circle") {
            container.selectAll(".line" + object.className)
                .attr("d", this.commons.line.x((d) => {
                    return this.commons.scaling(d['x']);
                }))
        } else {
            container.selectAll(".line")
                .attr("d", this.commons.line);
        }

    }

    public rectangle(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        // line does not require transition

        let transit1, transit2;
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
        transit1.attr("transform",  (d) => {
            return "translate(" + this.rectX(d) + ",0)"
        });

        transit2
            .attr("width", this.rectWidth2);

        // transition to text
        container.selectAll("." + object.className + "Text")
            .attr("transform",  (d) => {
                if (d.description && this.commons.scaling(d['x'])<0) {
                    return "translate(" + -this.rectX(d) + ",0)"
                }
            })
            .style("visibility",  (d) => {
                if (d.description && this.commons.scaling(d['x'])>0) {
                    return (this.commons.scaling(d.y) - this.commons.scaling(d['x'])) > d.description.length * 8 && object.height > 11 ? "visible" : "hidden";
                } else return "hidden";
            });
    }

    public multiRec(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        container.selectAll("." + object.className)
            .attr("x",  (d) => {
                return this.commons.scaling(d['x'])
            })
            .attr("width",  (d) => {
                return this.commons.scaling(d.y) - this.commons.scaling(d['x'])
            });

    }

    public unique(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        // line does not require transition

        let transit;
        if (this.commons.animation) {
            transit = container.selectAll(".element")
                .transition()
                .duration(500);
        }
        else {
            transit = container.selectAll(".element");
        }
        transit
            .attr("x", (d) => {
                return this.commons.scaling(d['x'] - 0.4)
            })
            .attr("width", (d) => {
                if (this.commons.scaling(d['x'] + 0.4) - this.commons.scaling(d['x'] - 0.4) < 2) return 2;
                else return this.commons.scaling(d['x'] + 0.4) - this.commons.scaling(d['x'] - 0.4);
            });

    }

    public circle(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        // line does not require transition

        let transit;
        if (this.commons.animation) {
            transit = container.selectAll(".element")
                .transition()
                .duration(500);
        }
        else {
            transit = container.selectAll(".element");
        }
        transit
            .attr("cx", (d) => {
                return this.commons.scaling(d['x'])
            })
            .attr("width", (d) => {
                if (this.commons.scaling(d['x'] + 0.4) - this.commons.scaling(d['x'] - 0.4) < 2) return 2;
                else return this.commons.scaling(d['x'] + 0.4) - this.commons.scaling(d['x'] - 0.4);
            });

    }

    public path(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        container.selectAll(".line" + object.className)
            .attr("d", this.commons.lineBond.x((d) => {
                    return this.commons.scaling(d['x']);
                })
                    .y( (d) => {
                        return -d.y * 10 + object.height;
                    })
            );
        let transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + object.className)
                .transition()
                .duration(0);
        }
        else {
            transit = container.selectAll("." + object.className);
        }
        transit
            .attr("d", this.commons.lineBond.y((d) => {
                return -d.y * 10 + object.height;
            }));
    }

    public lineTransition(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);

        // keep height
        this.commons.lineYScale.range([0, -(object.height)]).domain([0, -(object.level)]);
        container.selectAll(".line " + object.className)
            .attr("d", (d) => {
                return this.commons.lineYScale(-d.y) * 10 + object.shift
            });

        // transit line
        let transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + object.className)
                .transition()
                .duration(0);
        }
        else {
            transit = container.selectAll("." + object.className);
        }

        transit
            .attr("d", this.commons.lineGen.y((d) => {
                    // deprecated with new d3 import
                    /*if (object.interpolation){
                        this.commons.lineGen.curve(d3[object.interpolation]())
                    } else {
                        this.commons.lineGen.curve(d3.curveBasis)
                    }*/
                    return this.commons.lineYScale(-d.y) * 10 + object.shift;
                })
            );
    }

    public text(object, start) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        let transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + object.className)
                .transition()
                .duration(500);
        }
        else {
            transit = container.selectAll("." + object.className);
        }
        transit
            .attr("x", (d, i) => {
                return this.commons.scaling(i + start)
            });
    }

    constructor(commons: {}) {
        super(commons);
    }
};
