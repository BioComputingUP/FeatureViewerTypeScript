import ComputingFunctions from './helper';

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
        container.selectAll(".line")
            .attr("d", this.commons.line);

    }

    public rectangle(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        // line does not require transition

        let transit1, transit2;
        // group selection
        transit1 = container.selectAll("." + "rectfv" + "Group")
        transit2 = container.selectAll("." + "rectfv")
        // transition
        if (this.commons.animation) {
            transit1
                .transition()
                .duration(500);
            transit2
                .transition()
                .duration(500);
        }
        // transition
        transit1.attr("transform",  (d) => {
            return "translate(" + this.rectX(d) + ",0)"
        });
        transit2
            .attr("width", this.rectWidth2);

        // transition to text
        container.selectAll("." + object.className + "Text")
            .attr("transform",  (d) => {
                if (d.label && this.commons.scaling(d['x'])<0) {
                    return "translate(" + -this.rectX(d) + ",0)"
                }
            })
            .style("visibility",  (d) => {
                if (d.label && this.commons.scaling(d['x'])>0) {
                    return (this.commons.scaling(d.y) - this.commons.scaling(d['x'])) > d.label.length * 8 && object.height > 11 ? "visible" : "hidden";
                } else return "hidden";
            });
    }

    public multiRec(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        container.selectAll("." + "rectfv")
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

    public lollipop(object) {

        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        // line does not require transition

        let transit1, transit2;
        if (this.commons.animation) {
            transit1 = container.selectAll(".element")
                .transition()
                .duration(500);
            transit2 = container.selectAll(".lineElement")
                .transition()
                .duration(500);
        }
        else {
            transit1 = container.selectAll(".element");
            transit2 = container.selectAll(".lineElement");
        }
        transit1
            .attr("cx", (d) => {
                return this.commons.scaling(d.x)
            });
        transit2
            .attr("x1", (d) => {
                return this.commons.scaling(d.x)
            })
            .attr("x2", (d) => {
                return this.commons.scaling(d.x)
            })
        // .attr("y2", (d) => {
        //     let w = this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4);
        //     if (this.commons.scaling(d.x + 0.4) - this.commons.scaling(d.x - 0.4) < 2) w = 2;
        //     return w + 4;
        // });

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
        container.selectAll(".line")
            .attr("d", this.commons.lineBond.x((d) => {
                    return this.commons.scaling(d['x']);
                })
                    .y( (d) => {
                        return -d['y'] * 10 + object.height;
                    })
            );
        let transit;
        if (this.commons.animation) {
            transit = container.selectAll("." + "pathfv")
                .transition()
                .duration(0);
        }
        else {
            transit = container.selectAll("." + "pathfv");
        }
        transit
            .attr("d", this.commons.lineBond.y((d) => {
                return -1 * d['y'] * 10 + object.height;
            }));
    }

    public lineTransition(object) {
        let container = this.commons.svgContainer.select(`#c${object.id}_container`);
        const yScores = object.data.map(o => o.y);
        const maxScore = Math.max(...yScores);
        const minScore = Math.min(...yScores);
        // keep height
        this.commons.lineYScale.domain([minScore, maxScore]).range([0, this.commons.step/11]);
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
