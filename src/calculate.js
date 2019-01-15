"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commons_1 = require("./commons");
var commons = new commons_1.default();
var Calculate = (function () {
    function Calculate(commons) {
        this.commons = commons;
    }
    Calculate.prototype.uniq = function (a) {
        return a.sort().filter(function (item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });
    };
    ;
    Calculate.prototype.orderBy = function (values, orderType) {
        return values.sort(function (a, b) {
            if (a[orderType] < b[orderType]) {
                return -1;
            }
            if (a[orderType] > b[orderType]) {
                return 1;
            }
            return 0;
        });
    };
    Calculate.prototype.yxPoints = function (d) {
        var headMargin = 0;
        this.commons.flagsHeight = 18;
        if (d.flagLevel)
            headMargin = 20 * (d.flagLevel - 1);
        return [(headMargin + 5), (d.y - 3), (headMargin + 5), (d.y + this.commons.flagsHeight),
            (this.commons.viewerOptions.margin.left - 15), (d.y + this.commons.flagsHeight),
            (this.commons.viewerOptions.margin.left - 7), (d.y + (this.commons.flagsHeight / 2)),
            (this.commons.viewerOptions.margin.left - 15), (d.y - 3)].join(',');
    };
    ;
    Calculate.prototype.getTransf = function (el) {
        return [el.transform.baseVal.getItem(0).matrix.e, el.transform.baseVal.getItem(0).matrix.f];
    };
    ;
    Calculate.prototype.addNLines = function (array) {
        var dataLevels = [];
        array = this.orderBy(array, 'x');
        array.forEach(function (d) {
            if (dataLevels.length === 0) {
                dataLevels[0] = [d];
                d.level = 0;
            }
            else {
                var pulled = false;
                for (var lv in dataLevels) {
                    var last = dataLevels[lv].length - 1;
                    if (d.x > dataLevels[lv][last].y) {
                        dataLevels[lv].push(d);
                        d.level = lv;
                        pulled = true;
                        break;
                    }
                }
                if (!pulled) {
                    var newlv = dataLevels.length;
                    dataLevels[newlv] = [d];
                    d.level = newlv;
                }
                ;
            }
        });
        return dataLevels.length;
    };
    Calculate.prototype.getHeightRect = function (level) {
        return (level - 1) * 20 + 15;
    };
    ;
    return Calculate;
}());
exports.default = Calculate;
//# sourceMappingURL=calculate.js.map