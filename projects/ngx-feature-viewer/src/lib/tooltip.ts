
import Calculate from './calculate';
import {D3Selection} from './custom-d3';

class Tool extends Calculate {
  public colorSelectedFeat(feat, object, divId) {
    // remove previous selected features
    if (this.commons.featureSelected) {
      D3Selection.select(`#${divId}`).select(`#${this.commons.featureSelected}`).style('fill-opacity', '0.6');
    }
    // color selected rectangle
    if (object.type !== 'path' && object.type !== 'curve' && feat) {
      this.commons.featureSelected = feat;
      const thisfeat = D3Selection.select(`#${divId}`).select(`#${feat}`);
      thisfeat.style('fill-opacity', '1');

      if (object.type !== 'unique') {
        // color the background
        const currentContainer = this.commons.svgContainer.node().getBoundingClientRect();

        let selectRect;
        D3Selection.select(`#${divId}`).selectAll('.selectionRect').remove();
        selectRect = this.commons.svgContainer
            .select('.brush')
            .append('rect')
            .attr('class', 'selectionRect box-shadow')
        // add shadow?
            .attr('height', currentContainer.height);
        const thisy = this.getTransf((thisfeat.node() as HTMLElement).parentElement)[0];
        const myd3node = thisfeat.node();
        const bcr = (myd3node as HTMLElement).getBoundingClientRect().width;
        selectRect
            .style('display', 'block') // remove display none
            .attr('width', bcr) // - shift from the beginning
            .attr('transform', () => {
              return 'translate(' + thisy + ',0)';
            });
      }
    }
  }

  private updateLineTooltip(mouse, pD, scalingFunction, labelTrackWidth) {
    const xP = mouse - labelTrackWidth;
    let elemHover = '';
    for (let l = 1; l < pD.length; l++) {
      const scalingFirst = scalingFunction(pD[l - 1].x);
      const scalingSecond = scalingFunction(pD[l].x);
      const halfway = (scalingSecond - scalingFirst) / 2;
      if (scalingFirst + halfway < xP && scalingSecond + halfway > xP) {
        elemHover = pD[l];
        break;
      }
    }
    return elemHover;
  }

  private clickTagFunction(d) {
    // trigger tag_selected event: buttons clicked
    if (CustomEvent) {
      const event = new CustomEvent(this.commons.events.TAG_SELECTED_EVENT, {
        detail: d
      });
      this.commons.svgElement.dispatchEvent(event);
    } else {
      console.warn('CustomEvent is not defined....');
    }
    if (this.commons.trigger) {
      this.commons.trigger(this.commons.events.TAG_SELECTED_EVENT, event);
    }
  }

  public initTooltip(div, divId) {
    const getMessage = (thing, type= 'default') => {
      // first line
      let tooltip_message = '';

      // case of flags
      if (thing.hasOwnProperty('title')) {
        tooltip_message += '<p style="margin:2px;font-weight:700;">';
        tooltip_message += thing.title;
        tooltip_message += '</p>';
      } else {
        if (thing.hasOwnProperty('x') || thing.hasOwnProperty('y')) {
          tooltip_message += '<p style="margin:2px; font-weight:700;">';
          tooltip_message += (+thing.x).toString();
          if (+thing.y !== +thing.x) {
            if (type == 'curve') {
              tooltip_message += ' - ' + (+thing.y).toFixed(2).toString();
            } else if (type == 'circle') {
              // pass
            } else {
              tooltip_message += ' - ' + (+thing.y).toString();
            }
          }
          tooltip_message += '</p>';
        }
        // case of feature
        // if (thing.hasOwnProperty('tooltip')) {
        //     tooltip_message += '<p style="margin:2px;font-weight:700;">';
        //     tooltip_message += thing.tooltip;
        //     tooltip_message += '</p>';
        // }
      }

      return tooltip_message;
    };

    const scalingFunction = this.commons.scaling;
    const labelTrackWidth = this.commons.viewerOptions.labelTrackWidth;
    const updateLineTooltipFunction = this.updateLineTooltip;

    this.commons.d3helper = {};

    // label tooltip
    this.commons.d3helper.flagTooltip = () => {
      const tooltipDiv = this.commons.tooltipDiv;
      const bodyNode = D3Selection.select(div).node();

      const tooltip = (selection) => {
        let absoluteMousePos;
        const drawMyTooltip = (content) => {
          absoluteMousePos = D3Selection.mouse(bodyNode);
          let left; let top;
          left = absoluteMousePos[0].toString();
          top = absoluteMousePos[1].toString();
          // mobilemode labels overwrite tooltips
          tooltipDiv.transition()
              .duration(200)
              .style('opacity', 1);
          tooltipDiv
              .html(() => {
                if (this.commons.viewerOptions.mobileMode) {
                  return content.label || content.id;
                } else {
                  return content.tooltip;
                }
              })
              .style('left', left + 'px')
              .style('top', top + 'px');
        };

        if (selection) {
          selection
          // tooltip
              .on('mouseover.tooltip', (content) => {
                if (this.commons.viewerOptions.mobileMode || ('tooltip' in content && content.tooltip)) {
                  drawMyTooltip(content);
                }
              })
              .on('mousemove.tooltip', (content) => {
                if (this.commons.viewerOptions.mobileMode || ('tooltip' in content && content.tooltip)) {
                  drawMyTooltip(content);
                }
              })
              .on('mouseout.tooltip', () => {
                // Remove tooltip
                tooltipDiv.transition()
                    .duration(500)
                    .style('opacity', 0);
              });
        }
      };

      return tooltip;
    };

    // tooltip on buttons and objects in right sidebar
    this.commons.d3helper.genericTooltip = (object) => {
      const tooltipDiv = this.commons.tooltipDiv;
      const bodyNode = D3Selection.select(div).node();
      const message = object.tooltip;

      const tooltip = (selection) => {
        let absoluteMousePos;
        const drawMyTooltip = (pD) => {
          absoluteMousePos = D3Selection.mouse(bodyNode);

          let left; let top;
          left = absoluteMousePos[0].toString();
          top = absoluteMousePos[1].toString();

          if (message) {
            tooltipDiv.transition()
                .duration(200)
                .style('opacity', 1);
            tooltipDiv
                .html(message)
                .style('left', left + 'px')
                .style('top', top + 'px');
          }
        };

        selection
        // tooltip
            .on('mouseover', (pD) => {
              drawMyTooltip(pD);
            })
            .on('mousemove', (pD) => {
              drawMyTooltip(pD);
            })
            .on('mouseout', () => {
              // Remove tooltip
              tooltipDiv.transition()
                  .duration(500)
                  .style('opacity', 0);
            })
            .on('click', (pD) => {
              // TODO
              // from message to object with button id too
              this.clickTagFunction(object);
            });
      };

      return tooltip;
    };

    // tooltip on features
    this.commons.d3helper.tooltip = (object) => {
      const tooltipDiv = this.commons.tooltipDiv;
      const customTooltipDiv = this.commons.customTooltipDiv;
      const viewerWidth = this.commons.viewerOptions.width;

      const bodyNode = D3Selection.select(div).node();
      // let tooltipColor = this.commons.viewerOptions.tooltipColor ? this.commons.viewerOptions.tooltipColor : "#fff";

      const tooltip = (selection) => {
        let absoluteMousePos;

        const getPositions = (absoluteMousePos) => {
          const rightSide = (absoluteMousePos[0] > viewerWidth);
          const topshift = 25;
          let left = 0;
          let top = 0;
          if (rightSide) {
            left = absoluteMousePos[0] + 10 - (tooltipDiv.node().getBoundingClientRect().width);
            top = absoluteMousePos[1] - topshift;
          } else {
            left = absoluteMousePos[0] - 15;
            top = absoluteMousePos[1] - topshift;
          }
          const positions = {
            top,
            left
          };
          return positions;
        };

        const getMyMessage = (pD) => {
          let tooltip_message = '';
          if (object.type === 'path') {
            const reformat = {
              x: pD[0].x,
              y: pD[1].x
            };
            tooltip_message = getMessage(reformat);
          } else if (object.type === 'curve') {
            const elemHover = updateLineTooltipFunction(absoluteMousePos[0], pD, scalingFunction, labelTrackWidth);
            tooltip_message = getMessage(elemHover, 'curve');
          } else if (object.type === 'circle') {
            tooltip_message = getMessage(pD, 'circle');
          } else if (object.type === 'button') {
            tooltip_message = getMessage(object);
          } else {
            // e.g. rect, arrow
            tooltip_message = getMessage(pD);
          }
          return tooltip_message;
        };

        const drawMyTooltip = (pD) => {
          if (pD.tooltip || object.tooltip) {
            customTooltipDiv.html('');
            let html = '';
            if (pD.tooltip) {
              html = pD.tooltip;
            } else {
              html = object.tooltip;
            }
            drawCustomTooltip(html);
          } else {
            absoluteMousePos = D3Selection.mouse(bodyNode);
            const positions = getPositions(absoluteMousePos);
            const tooltip_message = getMyMessage(pD);

            tooltipDiv.transition()
                .duration(200)
                .style('opacity', 1);
            tooltipDiv
                .html(tooltip_message)
                .style('left', positions.left + 'px')
                .style('top', positions.top + 'px');
          }
        };

        const drawCustomTooltip = (tooltiphtml) => {
          // remove tooltip div
          tooltipDiv.transition()
              .duration(500)
              .style('opacity', 0);

          // open tooltip if no source or if source is click and status is open
          absoluteMousePos = D3Selection.mouse(bodyNode);
          const clickposition = (this.commons.viewerOptions.width / 2) - absoluteMousePos[0] > 0 ? -1 : 1;
          const positions = getPositions(absoluteMousePos);

          // console.log('Selection:', d3.select(`#customTooltipDivContent`))
          // D3Selection.select(`#customTooltipDivContent`).html(tooltiphtml)

          // now fill it
          customTooltipDiv.transition()
              .duration(200)
              .style('opacity', 1);
          customTooltipDiv
              .style('top', positions.top + 'px')
              .style('left', positions.left + 'px')
              .append('foreignObject') // foreignObject can be styled with no limitation by user
              .attr('width', '100%')
              .attr('height', '100%')
              .html(tooltiphtml);
          // transition if clickposition
          if (clickposition) {
            customTooltipDiv.style('top', (positions.top + 35) + 'px');
          }
          if (clickposition == 1) {
            const transitiondata = customTooltipDiv.node().getBoundingClientRect();
            if (transitiondata) {
              customTooltipDiv.style('left', (positions.left - transitiondata.width + 55) + 'px');
              // customTooltipDiv.transition()
              //     .duration(500)
              //     .style("left", transitiondata.width);
            }
          }
        };

        selection
            .on('mouseover', (pD) => {
              drawMyTooltip(pD);
            })
            .on('mousemove', (pD) => {
              drawMyTooltip(pD);
            })
            .on('mouseout', function(pD) {
              if (pD.tooltip || object.tooltip) {
                // remove custom tooltip
                customTooltipDiv.html('');
                customTooltipDiv.transition()
                    .duration(500)
                    .style('opacity', 0);
              } else {
                // remove normal tooltip
                tooltipDiv.transition()
                    .duration(500)
                    .style('opacity', 0);
              }
            })
            .on('click', (pD) => {
              // not button: feature
              if (object.type !== 'button') { // feature
                // TODO: define data for event exporting when clicking rects
                // TODO: fix exports.event.target.__data__ is undefined

                let xTemp;
                let yTemp;
                let xRect;
                let widthRect;
                let elemHover;

                let forSelection = pD;
                // curve specifics
                if (object.type === 'curve') {
                  elemHover = updateLineTooltipFunction(absoluteMousePos[0], pD, scalingFunction, labelTrackWidth);
                  forSelection = elemHover;
                }

                // path is array of pD, line is elemHover, all the rest is a pD object
                object.selectedRegion = forSelection;
                const feature_detail_object = object;

                this.colorSelectedFeat(pD.id, object, divId);


                // trigger feature_selected event
                if (CustomEvent) {
                  const event = new CustomEvent(this.commons.events.FEATURE_SELECTED_EVENT, {
                    detail: feature_detail_object
                  });
                  this.commons.svgElement.dispatchEvent(event);
                } else {
                  console.warn('CustomEvent is not defined....');
                }
                if (this.commons.trigger) {
                  this.commons.trigger(this.commons.events.FEATURE_SELECTED_EVENT, feature_detail_object);
                }
              } else {
                // button
                this.clickTagFunction(object);
              }
            });
      };

      return tooltip;
    };
  }

  constructor(commons: {}) {
    super(commons);
  }
}

export default Tool;
