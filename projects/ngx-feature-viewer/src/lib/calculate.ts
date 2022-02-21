import Commons from './commons';
import {FeaturesList} from './interfaces';
import * as _ from 'underscore';

const commons = new Commons();

class Calculate {
    public commons;

    private uniq(a) {
      return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
      });
    }

    private orderBy(values: any[], orderType: any) {
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

    public yxPoints(d) {
      this.commons.flagsHeight = 18;
      const h = d.y + this.commons.flagsHeight;
      const htail = d.y + (this.commons.flagsHeight / 2);
      const w = (this.commons.viewerOptions.margin.left - 15) - (20 * (d.flagLevel - 1));
      const wtail = (this.commons.viewerOptions.margin.left - 7) - (20 * (d.flagLevel - 1));
      const poligon = [5, (d.y - 3), (5), (h), (w), (h), (wtail), (htail), (w), (d.y - 3)].join(',');
      return poligon;
      // return "5,57,5,78,25,78,33,69,25,57";
    }

    public getTransf(el) {
      return [el.transform.baseVal.getItem(0).matrix.e, el.transform.baseVal.getItem(0).matrix.f];
    }

    public getMarginLeft() {
      const flagwidht = this.commons.yAxisSVG.select('.flagBackground').node();
      const marginleft = (flagwidht as HTMLElement).getBoundingClientRect().width;
      return marginleft;
    }

    public addNLines(array) {
      const dataLevels = [];

      // sort array
      array = this.orderBy(array, 'x');
      array.forEach((d) => {
        // init
        if (dataLevels.length === 0) {
          dataLevels[0] = [d];
          d.level = 0;
        } else {
          let pulled = false;
          for (const lv in dataLevels) {
            // check superimposition, compare with last
            const last = dataLevels[lv].length - 1;
            if (d.x > dataLevels[lv][last].y) {
              // same level
              dataLevels[lv].push(d);
              d.level = lv;
              pulled = true;
              break;
            }
          }
          if (!pulled) {
            const newlv = dataLevels.length;
            dataLevels[newlv] = [d];
            d.level = newlv;
          }
        }
      });
      return dataLevels.length;
    }

    public getHeightRect(level) {
      return (level - 1) * 20 + 15;
    }

    public searchTree(element, matchingId) {
      if (element.id == matchingId) {
        return element;
      } else if (element.subfeatures) {
        let i;
        let result = null;
        for (i = 0; result == null && i < element.subfeatures.length; i++) {
          result = this.searchTree(element.subfeatures[i], matchingId);
        }
        return result;
      }
      return null;
    }

    public unflatten = ( array: FeaturesList, parent= null, processedIds= null, tree= null ) => {
      tree = tree !== null ? tree : [];
      parent = parent !== null ? parent : {id: 0};
      processedIds = processedIds !== null ? processedIds : new Set();

      const children = _.filter( array, (child) => {
        if (child.parentId === undefined) {
          child.parentId = 0;
        }
        if (child.parentId === parent.id) {
          processedIds.add(child.id);
        }
        return child.parentId === parent.id;
      });

      if ( !_.isEmpty( children ) ) {
        if ( parent.id === 0 ) {
          tree = children;
        } else {
          parent.subfeatures = children;
        }
        _.each( children, ( child ) => this.unflatten( array, child, processedIds)  );
      }

      const res = {
        tree,
        ids: processedIds
      };

      return res;
    };

    public flatten(features, flatted= [], parent= null) {
      for (const i in features) {
        const ft = features[i];
        if (!parent) {
          ft.parent = [];
        } else {
          if (ft.parent) {
            ft.parent.concat(parent);
          } else {
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

    public displaySequence(seq) {
      // checks if dotted sequence or letters
      return this.commons.viewerOptions.width / seq > 5;
    }

    public updateSVGHeight(position) {
      this.commons.svg.attr('height', position + 60 + 'px');
      this.commons.svg.select('clipPath rect').attr('height', position + 60 + 'px');
    }

    constructor(commons: {}) {
      this.commons = commons;
    }
}

export default Calculate;
