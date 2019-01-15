
import * as d3 from 'd3';
import {event as currentEvent} from 'd3-selection';

class ComputingFunctions {

    public commons;

    public rectWidth2 = (d) => {
        /*if (d.x === d.y) {
            if (this.commons.scaling([d.x + 0.4]) - this.commons.scaling([d.x - 0.4]) < 2) return 2;
            else return this.commons.scaling([d.x + 0.4]) - this.commons.scaling([d.x - 0.4]);
        }*/
        return (this.commons.scaling([d.y + 0.4])- this.commons.scaling([d.x - 0.4]));
    };

    public rectX = (object) => {
        /*if (object.x === object.y) {
            return this.commons.scaling([object.x - 0.4]);
        }*/
        let scale = this.commons.scaling([object.x - 0.4]);
        //if (scale<0) {scale = 0};
        return scale
    };

    protected displaySequence(seq) {
        return this.commons.viewerOptions.width / seq > 5;
    }

    protected gradientColor(stringContent) {
        let percent = Number(stringContent);
        //value from 0 to 100
        //let hue = ((1 - percent) * 120).toString(10);
        let hue;
        if (percent === 0) {
            hue = 'white'
        } else if (percent > 0 && percent <= 15) {
            hue = 'lightgreen'
        } else if (percent > 15 && percent < 50) {
            hue = 'yellow'
        } else if (percent >= 50 && percent < 100) {
            hue = 'red'
        } else if (percent === 100) {
            hue = 'black'
        }
        return hue;
        //return ["hsl(", hue, ",100%,50%)"].join("");
    };

    protected forcePropagation(item) {
        item.on('mousedown', () => {
            let new_click_event = new Event('mousedown');
            new_click_event['pageX'] = currentEvent.layerX;
            new_click_event['clientX'] = currentEvent.clientX;
            new_click_event['pageY'] = currentEvent.layerY;
            new_click_event['clientY'] = currentEvent.clientY;
        });
    }

    constructor(commons: {}) {
        this.commons = commons;
    }
}

export default ComputingFunctions