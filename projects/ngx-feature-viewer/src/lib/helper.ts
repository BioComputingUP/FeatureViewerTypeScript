
import * as d3 from 'd3';
import {event as currentEvent} from 'd3-selection';

class ComputingFunctions {
    public commons;

    public rectWidth2 = (d) => {
      /*if (d.x === d.y) {
            if (this.commons.scaling([d.x + 0.4]) - this.commons.scaling([d.x - 0.4]) < 2) return 2;
            else return this.commons.scaling([d.x + 0.4]) - this.commons.scaling([d.x - 0.4]);
        }*/
      return (this.commons.scaling([d.y + 0.4]) - this.commons.scaling([d.x - 0.4]));
    }

    public rectX = (object) => {
      /*if (object.x === object.y) {
            return this.commons.scaling([object.x - 0.4]);
        }*/
      const scale = this.commons.scaling([object.x - 0.4]);
      // if (scale<0) {scale = 0};
      return scale;
    }

    public arrowPath = (d) => {
      const h = this.commons.elementHeight;
      const w = this.rectWidth2(d);

      // if the feature is too small, just make a small rectangle
      if (w <= h / 2) {
        return `m0 0 h${w} v${h} h${-w}z`;
      }

      if (d.direction === 'left') {
        return `m${w} 0 h${-w + h / 2} l${-h / 2} ${h / 2} l${h / 2} ${h / 2} h${w - h / 2} z`;
      } else {
        return `m0 0 h${w - h / 2} l${h / 2} ${h / 2} l${-h / 2} ${h / 2} h${-w + h / 2} z`;
      }
    }

    protected displaySequence(seq) {
      return this.commons.viewerOptions.width / seq > 5;
    }

    protected gradientColor(stringContent) {
      const percent = Number(stringContent);
      // value from 0 to 100
      // let hue = ((1 - percent) * 120).toString(10);
      let hue;
      if (percent === 0) {
        hue = '#ffffff';
      } else if (percent > 0 && percent <= 15) {
        hue = '#d2d2f8';
      } else if (percent > 15 && percent < 50) {
        hue = '#a6a6f1';
      } else if (percent >= 50 && percent < 100) {
        hue = '#7a7aeb';
      } else if (percent === 100) {
        hue = '#4e4ee4';
      }
      return hue;
      // return ["hsl(", hue, ",100%,50%)"].join("");
    }

    protected forcePropagation(item) {
      item.on('mousedown', () => {
        const new_click_event = new Event('mousedown');
        // @ts-ignore
        new_click_event.pageX = currentEvent.layerX;
        // @ts-ignore
        new_click_event.clientX = currentEvent.clientX;
        // @ts-ignore
        new_click_event.pageY = currentEvent.layerY;
        // @ts-ignore
        new_click_event.clientY = currentEvent.clientY;
      });
    }

    constructor(commons: {}) {
      this.commons = commons;
    }
}

export default ComputingFunctions;
