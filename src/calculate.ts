import Commons from './commons';

const commons = new Commons();

class Calculate {

    public commons;

    private uniq(a) {
        return a.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        })
    };

    private orderBy(values: any[], orderType: any) {
        return values.sort((a, b) => {
            if (a[orderType] < b[orderType]) {
                return -1;
            }
            if (a[orderType] > b[orderType]) {
                return 1;
            }
            return 0
        });
    }

    public yxPoints(d) {
        let headMargin = 0;
        this.commons.flagsHeight = 18;
        if (d.flagLevel)
            headMargin = 20 * (d.flagLevel - 1);
        return [(headMargin + 5), (d.y - 3), (headMargin + 5), (d.y + this.commons.flagsHeight),
            (this.commons.viewerOptions.margin.left - 15), (d.y + this.commons.flagsHeight),
            (this.commons.viewerOptions.margin.left - 7), (d.y + (this.commons.flagsHeight / 2)),
            (this.commons.viewerOptions.margin.left - 15), (d.y - 3)].join(',');
    };

    public getTransf(el) {
        return [el.transform.baseVal.getItem(0).matrix.e, el.transform.baseVal.getItem(0).matrix.f]
    };

    public addNLines(array) {

        let dataLevels = [];

        // sort array
        array = this.orderBy(array, 'x');
        array.forEach((d) => {

            // init
            if (dataLevels.length === 0) {

                dataLevels[0] = [d];
                d.level = 0;

            } else {

                let pulled = false;
                for (let lv in dataLevels) {
                    // check superimposition, compare with last
                    let last = dataLevels[lv].length - 1;
                    if (d.x > dataLevels[lv][last].y) {
                        // same level
                        dataLevels[lv].push(d);
                        d.level = lv;
                        pulled = true;
                        break;
                    }
                }
                if (!pulled) {
                    let newlv = dataLevels.length
                    dataLevels[newlv] = [d];
                    d.level = newlv;
                };

            }

        });
        return dataLevels.length;
    }

    public getHeightRect(level) {
        return (level-1) * 20 + 15;
    };

    constructor(commons: {}) {
        this.commons = commons;
    }
}

export default Calculate