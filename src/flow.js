import * as d3 from 'd3';
import _ from 'lodash';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const draw = (div, data) => {
  let arrowKeys = [
    /*'e2e',*/ 'e2u', 'e2n',
    'u2e', /*'u2u',*/ 'u2n',
    'n2e', 'n2u', /*'n2n',*/
  ];
  // let arrowDomains = _.zipObject(arrowKeys, _.map(arrowKeys, k => [0, d3.max(data, d => d[k])]));
  let arrowDomains = _.map(arrowKeys, k => [d3.min(data, d => d[k]), d3.max(data, d => d[k])])
  let masterArrowDomain = [d3.min(arrowDomains, d => d[0]), d3.max(arrowDomains, d => d[1])];
  
  arrowDomains = _.zipObject(arrowKeys, arrowDomains);

  let keyPairs = [
    ['e2u', 'u2e'],
    ['u2n', 'n2u'],
    ['n2e', 'e2n'],
  ];

  let pairDomains = _.map(keyPairs, p => [
    Math.min(arrowDomains[p[0]][0], arrowDomains[p[1]][0]),
    Math.max(arrowDomains[p[0]][1], arrowDomains[p[1]][1]),
  ]);

  pairDomains = _.zipObject(
    _.flatten(_.unzip(keyPairs)),
    _.concat(pairDomains, pairDomains)
  );

  var arrowData = [];

  var flowWidth = div.node().clientWidth;
  var flowHeight = flowWidth;

  var adj = flowWidth/1000;

  var ringMid = flowWidth*3/7;
  var nodeRadius = flowWidth/14;
  var nodeWidth = 8*adj;

  var arrowMin = 1;
  var arrowMax = 32*adj;
  var arrowRange = [arrowMin, arrowMax];

  var arrowWidth = 4*adj;
  var arrowGap = 8*adj;
  var arrowInset = 8*adj;

  var pi = Math.PI;
  var tau = Math.PI*2;

  var flowDateSize = 36*adj;
  var flowDescriptionSize = 24*adj;
  var nodeTitleSize = 20*adj;

  var cool = d3.interpolateCool;
  var warm = d3.interpolateWarm;
  var rainbow = d3.interpolateRainbow;

  var svg = div.append('svg')
    .attr('width', flowWidth)
    .attr('height', flowHeight);

  var defs = svg.append('defs');

  defs.append("marker")
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 50)
      .attr('markerHeight', 50)
      .attr('orient', 90)//'auto')
      .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class","arrowHead");

  var arrowShape = d3.arc()
    // .startAngle(function(d) { return d.node0.index/3*tau-tau/12 + (d.clockwise ? 0 : tau*2/3); })
    // .endAngle(function(d) { return d.node0.index/3*tau-tau/12+tau/3 + (d.clockwise ? 0 : tau*2/3); })
    .startAngle(function(d) { return tau/12 + (d.clockwise ? 0 : tau*2/3+tau/24); })
    .endAngle(function(d) { return tau/12+tau/3 + (d.clockwise ? -tau/24 : tau*2/3); })
    .innerRadius(function(d) {return (d.clockwise ? ringMid+arrowGap+d.offset : ringMid-d.width-arrowGap-d.offset) - arrowInset; })
    .outerRadius(function(d) { return (d.clockwise ? ringMid+d.width+arrowGap+d.offset : ringMid-arrowGap-d.offset) - arrowInset; })
    .cornerRadius(0);

  var arrowBackgroundShape = d3.arc()
    // .startAngle(function(d) { return d.node0.index/3*tau-tau/12; })
    // .endAngle(function(d) { return d.node0.index/3*tau-tau/12+tau/3; })
    .startAngle(function(d) { return tau/12 + (d.clockwise ? 0 : tau*2/3+tau/24); })
    .endAngle(function(d) { return tau/12+tau/3 + (d.clockwise ? -tau/24 : tau*2/3); })
    .innerRadius(function(d) {return (d.clockwise ? ringMid+arrowGap : ringMid-arrowMax-arrowGap) - arrowInset; })
    .outerRadius(function(d) { return (d.clockwise ? ringMid+arrowMax+arrowGap : ringMid-arrowGap) - arrowInset; })
    .cornerRadius(0);

  var flowGroup = svg.append('g')
    .attr("transform", "translate("+flowWidth/2+","+flowHeight/2+")");

  var flowDateText = flowGroup
    .append('text')
      .attr('class', 'flowDateText')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'baseline')
      .attr('font-size', flowDateSize)
      .text('Yo');

  var flowDescriptionText = flowGroup
    .append('text')
      .attr('class', 'flowDescriptionText')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .attr('font-size', flowDescriptionSize)
      .attr('y', 8);

  var employmentDescriptionText = flowDescriptionText
    .append('tspan')
      .attr('x', 0)
      .attr('dy', flowDescriptionSize*1.1);
      
  var unemploymentDescriptionText = flowDescriptionText
    .append('tspan')
      .attr('x', 0)
      .attr('dy', flowDescriptionSize*1.1);
      
  var nonlaborDescriptionText = flowDescriptionText
    .append('tspan')
      .attr('x', 0)
      .attr('dy', flowDescriptionSize*1.1);

  var arrowGroup = flowGroup.append('g')
    .attr('class', 'arrows');

  var nodeGroup = flowGroup.append('g')
    .attr('class', 'nodes');

  var arrowScale = d3.scaleLinear()
    .range(arrowRange);

  return {
    update: (datum) => {

      var flowNodes = [
        {
          index: 0,
          key: 'n',
          name: 'Non-Labor',
          radius: nodeRadius,
        },
        {
          index: 1,
          key: 'u',
          name: 'Unemployed',
          radius: nodeRadius,
        },
        {
          index: 2,
          key: 'e',
          name: 'Employed',
          radius: nodeRadius,
        },
      ];

      _.each(flowNodes, (v) => {
        v.color = rainbow(((v.index+1/2+2)%3)/3);

      });

      let makeArrow = (node0, node1, clockwise) => {
        let key = node0.key+'2'+node1.key;
        let value = datum[key];

        // console.log("Domain for %s is %s", key, ''+pairDomains[key]);

        let scale = d3.scaleLinear()
          .domain(pairDomains[key])
          // .domain(masterArrowDomain)
          // .domain(arrowDomains[key])
          .range(arrowRange);

        let width = scale(value);

        let tipRadius = ringMid + (clockwise ? arrowGap+arrowMax/2 : -(arrowGap+arrowMax/2)) - arrowInset;

        let offset = (arrowMax-width)/2;

        return {
          node0,
          node1,
          clockwise,
          key,
          value,
          width,
          tipRadius,
          offset
        }
      };

      let flowArrows = [];

      _.each(flowNodes, (n, i, a) => {
        flowArrows.push(makeArrow(n, a[(i+1)%a.length], true));
        flowArrows.push(makeArrow(a[(i+1)%a.length], n, false));
      });

      let node = nodeGroup.selectAll('.node').data(flowNodes);
      
      let newNode = node
        .enter()
          .append('g')
            .attr('class', 'node')
            .attr('transform', (d, i) => "translate("+ringMid*Math.cos(i/3*tau)+","+ringMid*Math.sin(i/3*tau)+")")
      
      newNode.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color);

      newNode.append('circle')
        .attr('r', d => d.radius-nodeWidth)
        .attr('fill', 'white');

      newNode.append('text')
        .attr('class', 'nodeName')
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('font-size', nodeTitleSize)
        .text(d => d.name);

      // newNode.merge(node);

      node.exit().remove();

      console.log(flowArrows);

      arrowGroup.selectAll('.arrow').data([]).exit().remove();

      let arrow = arrowGroup.selectAll('.arrow').data(flowArrows);
      // let arrow = arrowGroup.selectAll('.arrow').data(flowArrows, d => {console.log("KEY: %s", d.key); return d});

      let newArrow = arrow
        .enter()
          .append('g')
            .attr('class', 'arrow')
            .attr('transform', d => 'rotate('+(d.node0.index*120+60)+')');
      
      newArrow.append('path')
          .attr('class', 'arrowBackground')
          // .attr('marker-start', 'url(#arrow)')
          // .attr('marker-start', 'url(#arrow)')
          // .attr(d => (d.clockwise ? 'marker-start' : 'marker-end'), 'url(#arrow)')
          .attr('fill', '#eee')
          .attr('d', d => arrowBackgroundShape(d));
          // .attr('d', d => {console.log("drawing path for: %s, %s", d.key, JSON.stringify(d)); return arrowShape(d)});

      // let triPathString = 'M0,-'+arrowMax+'L'+(arrowMax/2)+',-'+(arrowMax/2)+'L0,0';//+arrowMax;
      // let triPathString = 'M0,-32L16,-16L0,0';
      // "M0,-5L10,0L0,5"

      newArrow.append('g')
          .attr('transform', d => 'rotate('+(d.clockwise ? 45 : 195)+')')
        .append('g')
          .attr('transform', d => 'translate('+d.tipRadius+'),rotate('+(d.clockwise ? 90 : -90)+')')
        .append('path')
          .attr('d', arrowTipString(arrowMax*5/6))
          .attr('fill', '#eee');

      newArrow.append('g')
          .attr('transform', d => 'rotate('+(d.clockwise ? 45 : 195)+')')
        .append('g')
          .attr('transform', d => 'translate('+d.tipRadius+'),rotate('+(d.clockwise ? 90 : -90)+')')
        .append('path')
          .attr('d', d => arrowTipString(d.width*5/6))
          .attr('fill', d => d.node1.color);
      
      newArrow.append('path')
          .attr('class', 'arrowPath')
          .attr('fill', d => d.node1.color)
          .attr('d', d => arrowShape(d));

      flowDateText.text(monthNames[datum.date.getMonth()]+' '+datum.date.getFullYear());

      employmentDescriptionText.text('Unemployed '+(datum.u2e > datum.e2u ? '→' : '←')+' Employed');
      unemploymentDescriptionText.text('Employed '+(datum.e2n > datum.n2e ? '→' : '←')+' Non-Labor');
      nonlaborDescriptionText.text('Non-Labor '+(datum.n2u > datum.u2n ? '→' : '←')+' Unemployed');

      // employmentDescriptionText.text('Employment was '+(datum.eFlux > 0 ? 'rising +' : 'falling -'));
      // unemploymentDescriptionText.text('Unemployment was '+(datum.uFlux > 0 ? 'rising +' : 'falling -'));
      // nonlaborDescriptionText.text('Non-Labor was '+(datum.nFlux > 0 ? 'rising +' : 'falling -'));

      console.log("Updated flow");
    },
  }
}

const arrowTipString = size => {
  // return "M0,-32L32,0L0,32";
  return 'M0,-'+size+'L'+size+',0L0,'+size;
}

export default draw;