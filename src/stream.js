import * as d3 from 'd3';
import _ from 'lodash';

const colors = {
  e: 'green',
  u: 'red',
  n: 'blue',
}
colors.negN = colors.n;

const expandKey = (data, key) => {
  let vals = _.map(data, d => d[key])
  let min = d3.min(vals);
  let max = d3.max(vals);
  // let min = _.reduce(data, (r, v) => v[key] < r ? v[key] : r, Number.POSITIVE_INFINITY);
  // let max = _.reduce(data, (r, v) => v[key] > r ? v[key] : r, Number.NEGATIVE_INFINITY);
  data = _.each(data, d => d[key] = (d[key]-min));// /(max-min));
  return data;
}

const drawStream = (div, data, setTime) => {
  var streamWidth = div.node().clientWidth;
  var streamHeight = Math.min(streamWidth/1000, 1)*120;

  var axisHeight = 20;

  var pi = Math.PI;
  var tau = Math.PI*2;

  var cool = d3.interpolateCool;
  var warm = d3.interpolateWarm;
  var rainbow = d3.interpolateRainbow;


  var minE = d3.max(data, d => d.e);
  var maxE = d3.max(data, d => d.e);
  var eRange = [minE, maxE];

  var minU = d3.max(data, d => d.u);
  var maxU = d3.max(data, d => d.u);
  var uRange = [minU, maxU];

  var minN = d3.max(data, d => d.n);
  var maxN = d3.max(data, d => d.n);
  var nRange = [minN, maxN];

  var maxTotal = d3.max(data, d => d.e+d.u+d.n);
  var maxLabor = d3.max(data, d => d.e+d.u);


  _.each(data, d => {
    // d.labor = d.e+d.u;
    d.total = d.e+d.u+d.n;

    d.e /= d.total;
    d.u /= d.total;
    d.n /= d.total;

    // d.negN = -d.n;
  });

  data = expandKey(data, 'u');
  data = expandKey(data, 'e');
  data = expandKey(data, 'n');

  // div.style('height', streamHeight+'px');

  var chartDiv = div.append('div')
    .attr('class', 'chart')
    .style('height', streamHeight+'px');

  var axisDiv = div.append('div')
    .attr('class', 'axis');
    // .style('height', axisHeight+'px');

  var axisSvg = div.append('svg')
    .attr('width', streamWidth)
    .attr('height', axisHeight);

  var svg = chartDiv.append('svg')
    .attr('width', streamWidth)
    .attr('height', streamHeight);

  var stack = d3.stack()
    .offset(d3.stackOffsetExpand)
    // .offset(d3.stackOffsetDiverging)
    .keys(['e', 'u', 'n']);

  var stackData = stack(data);

  console.log(stackData);

  var streamScaleX = d3.scaleTime()
    .range([0, streamWidth])
    .domain(d3.extent(data, d => d.date));

  var streamScaleY = d3.scaleLinear()
    // .domain([-maxN, 0, maxLabor])
    // .domain([-maxN, maxLabor])
    .range([streamHeight, 0]);

  // var streamScaleZ = d3.scaleOrdinal(d3.schemeCategory10);

  var area = d3.area()
    .x(d => streamScaleX(d.data.date))
    .y0(d => streamScaleY(d[0]))
    .y1(d => streamScaleY(d[1]));

  var layer = svg.selectAll('.layer')
    .data(stackData)
    .enter().append('g')
      .attr('class', 'layer');
    // .attr('transform', 'translate(0, '+ringHeight+')');
    // .attr('width', fullWidth)
    // .attr('height', 200);

  axisSvg.append("g")
      .attr("class", "axis axis--x")
      // .attr("transform", "translate(0," + axisHeight + ")")
      .call(d3.axisBottom(streamScaleX));

  layer.append('path')
    .attr('fill', (d, i) => rainbow((((2-i)+1/2+2)%3)/3))
    .attr('d', area);

  let hover = false;

  let nowBar = svg.append('g')
    .attr('class', 'nowBar')
    .append('path')
      .attr('stroke-width', 4)
      .attr('stroke', 'black')
      .attr('d', 'M0,'+streamHeight+'L0,0');

  /*
  return {
    update: function(datum){
      now
    },
  }
  */

  svg.on('mousemove', (d, i) => {
    let m = d3.mouse(svg.node())[0];
    let t = streamScaleX.invert(m);
    t = new Date(t.getFullYear(), t.getMonth());
    // t.setDate(1);
    console.log("Mouse: %s", t);
    nowBar.attr('transform', 'translate('+m+', 0)');
    setTime(t);
  }).on('mouseout', (d, i) => {
    // setTime(null);
  });

  svg.call(d3.drag().on('drag', (d, i) => {
    let m = (d3.touch(svg.node()) ? d3.touch(svg.node()) : d3.mouse(svg.node()))[0];
    let t = streamScaleX.invert(m);
    t = new Date(t.getFullYear(), t.getMonth());
    // t.setDate(1);
    console.log("Drag: %s", t);
    nowBar.attr('transform', 'translate('+m+', 0)');
    setTime(t);
  }));
  
}

export default drawStream;