"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commons_1 = require("./commons");
const _ = require("underscore");
const commons = new commons_1.default();
class Calculate {
    constructor(commons) {
        this.unflatten = function (array, parent = null, processedIds = null, tree = null) {
            tree = tree !== null ? tree : [];
            parent = parent !== null ? parent : { id: 0 };
            processedIds = processedIds !== null ? processedIds : new Set();
            var children = _.filter(array, (child) => {
                if (child.parentId === undefined) {
                    child.parentId = 0;
                }
                if (child.parentId === parent.id) {
                    processedIds.add(child.id);
                }
                return child.parentId == parent.id;
            });
            if (!_.isEmpty(children)) {
                if (parent.id == 0) {
                    tree = children;
                }
                else {
                    parent['subfeatures'] = children;
                }
                _.each(children, (child) => { this.unflatten(array, child, processedIds); });
            }
            let res = {
                tree: tree,
                ids: processedIds
            };
            return res;
        };
        this.displaySequence = function (seq) {
            return this.commons.viewerOptions.width / seq > 5;
        };
        this.commons = commons;
    }
    uniq(a) {
        return a.sort().filter(function (item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });
    }
    ;
    orderBy(values, orderType) {
        return values.sort((a, b) => {
            if (a[orderType] < b[orderType]) {
                return -1;
            }
            if (a[orderType] > b[orderType]) {
                return 1;
            }
            return 0;
        });
    }
    yxPoints(d) {
        this.commons.flagsHeight = 18;
        let h = d.y + this.commons.flagsHeight;
        let htail = d.y + (this.commons.flagsHeight / 2);
        let w = (this.commons.viewerOptions.margin.left - 15) - (20 * (d.flagLevel - 1));
        let wtail = (this.commons.viewerOptions.margin.left - 7) - (20 * (d.flagLevel - 1));
        let poligon = [5, (d.y - 3), (5), (h), (w), (h), (wtail), (htail), (w), (d.y - 3)].join(',');
        return poligon;
    }
    ;
    getTransf(el) {
        return [el.transform.baseVal.getItem(0).matrix.e, el.transform.baseVal.getItem(0).matrix.f];
    }
    ;
    getMarginLeft() {
        let flagwidht = this.commons.yAxisSVG.select(".flagBackground").node();
        let marginleft = flagwidht.getBoundingClientRect().width;
        return marginleft;
    }
    addNLines(array) {
        let dataLevels = [];
        array = this.orderBy(array, 'x');
        array.forEach((d) => {
            if (dataLevels.length === 0) {
                dataLevels[0] = [d];
                d.level = 0;
            }
            else {
                let pulled = false;
                for (let lv in dataLevels) {
                    let last = dataLevels[lv].length - 1;
                    if (d.x > dataLevels[lv][last].y) {
                        dataLevels[lv].push(d);
                        d.level = lv;
                        pulled = true;
                        break;
                    }
                }
                if (!pulled) {
                    let newlv = dataLevels.length;
                    dataLevels[newlv] = [d];
                    d.level = newlv;
                }
                ;
            }
        });
        return dataLevels.length;
    }
    getHeightRect(level) {
        return (level - 1) * 20 + 15;
    }
    ;
    searchTree(element, matchingId) {
        if (element.id == matchingId) {
            return element;
        }
        else if (element.subfeatures) {
            var i;
            var result = null;
            for (i = 0; result == null && i < element.subfeatures.length; i++) {
                result = this.searchTree(element.subfeatures[i], matchingId);
            }
            return result;
        }
        return null;
    }
    flatten(features, flatted = [], parent = null) {
        for (let i in features) {
            let ft = features[i];
            if (!parent) {
                ft.parent = [];
            }
            else {
                if (ft.parent) {
                    ft.parent.concat(parent);
                }
                else {
                    ft.parent = parent;
                }
            }
            flatted.push(ft);
            if (ft.subfeatures) {
                this.flatten(ft.subfeatures, flatted = flatted, parent = ft.parent.concat(ft.id));
            }
        }
        return flatted;
    }
    updateSVGHeight(position) {
        this.commons.svg.attr("height", position + 60 + "px");
        this.commons.svg.select("clipPath rect").attr("height", position + 60 + "px");
    }
    ;
}
exports.default = Calculate;
//# sourceMappingURL=calculate.js.map