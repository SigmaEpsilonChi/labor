import * as d3 from 'd3';
import _ from 'lodash';
import './main.css';
import data from './data';
import drawStream from './stream';
import drawFlow from './flow';

var root = d3.select('body')
  .append('div')
    .attr('class', 'root');

var content = root
  .append('div')
    .attr('class', 'content');

var title = content
  .append('div')
    .attr('class', 'title')
    .html('Labor Flows');

var description = content
  .append('div')
    .attr('class', 'description')
    .html(
      "Churn in the US labor force. Work in progress, do not share.<br>"+
      ''
    );

// var flowDiv = root.append('div').attr('class', 'flows');
// var streamDiv = root.append('div').attr('class', 'streams');
var flowDiv = null;
var streamDiv = null;

const draw = () => {
  let flow = drawFlow(flowDiv, _.cloneDeep(data));

  let setTime = t => {
    let datum = _.find(data, d => {
      // console.log("Comparing %s and %s", d.date, t);
      return d.date.getTime() == t.getTime();
    });
    flow.update(datum);
  }

  let stream = drawStream(streamDiv, _.cloneDeep(data), setTime);

  flow.update(data[0]);
  console.log("Data0 date: %s", data[0].date);
  // setTime(data[0].date);
}

const tryDraw = () => {
  if (root.node().clientWidth == 0) {
    window.requestAnimationFrame(tryDraw);
  }
  else draw();
}

const unmount = () => {
  if (flowDiv && streamDiv) {
    flowDiv.remove();
    streamDiv.remove();

    flowDiv = null;
    streamDiv = null;

    return true;
  }
  return false;
}

const mount = () => {
  streamDiv = content.append('div').attr('class', 'streams');
  flowDiv = content.append('div').attr('class', 'flows');

  tryDraw();
}

window.addEventListener('resize', () => {if (unmount()) mount();});

mount();