import * as d3 from 'd3';
import _ from 'lodash';
import eRaw from './data/E/E.csv';
import uRaw from './data/U/U.csv';
import nRaw from './data/N/N.csv';

import e2eRaw from './data/E/E2E.csv';
import e2uRaw from './data/E/E2U.csv';
import e2nRaw from './data/E/E2N.csv';

import u2eRaw from './data/U/U2E.csv';
import u2uRaw from './data/U/U2U.csv';
import u2nRaw from './data/U/U2N.csv';

import n2eRaw from './data/N/N2E.csv';
import n2uRaw from './data/N/N2U.csv';
import n2nRaw from './data/N/N2N.csv';

const year0 = 1991;
const year1 = 2017;
  
var parseTime = d3.timeParse("%d-%b-%Y");
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const mean = (a, b) => (a+b)/2;

const smooth = (a, k) => {
  return _.map(a, (v, i) => {
    let v0 = i > 0 ? a[i-1][k] : v[k];
    let v1 = i < a.length-1 ? a[i+1][k] : v[k];
    // console.log("KEY=%s, v0=%s, v1=%s, v=%s", k, v0, v1, v[k]);
    let trv = mean(mean(v0, v[k]), mean(v1, v[k]));
    trv = !trv ? 0 : trv;
    let tr = _.cloneDeep(v);
    tr[k] = trv;
    return tr;
  });
}

const adaptTotal = (a, key) => {
  _.each(a, d => {
    _.each(d, (v, k) => {
      if (_.isString(v)) {
        d[k] = v.split('(')[0];
        d[k] = +d[k];
      }
    });
    let year = d.Year;
    _.unset(d, 'Year');

    d.values = _.map(d, (v, k) => _.zipObject(
      ['date', 'year', 'month', key],
      [parseTime("01-"+k+"-"+year), year, months.indexOf(k), v]
    ));
    // console.log(d);
  });

  a = _.map(a, d => d.values);
  a = _.flatten(a);

  // console.log(a);

  for (var i = 0; i < 16; i++) a = smooth(a, key);

  // console.log(a);
  // console.log(a[0]);

  return a;
}

let e = adaptTotal(eRaw, 'e');
let u = adaptTotal(uRaw, 'u');
let n = adaptTotal(nRaw, 'n');

let e2e = adaptTotal(e2eRaw, 'e2e');
let e2u = adaptTotal(e2uRaw, 'e2u');
let e2n = adaptTotal(e2nRaw, 'e2n');

let u2e = adaptTotal(u2eRaw, 'u2e');
let u2u = adaptTotal(u2uRaw, 'u2u');
let u2n = adaptTotal(u2nRaw, 'u2n');

let n2e = adaptTotal(n2eRaw, 'n2e');
let n2u = adaptTotal(n2uRaw, 'n2u');
let n2n = adaptTotal(n2nRaw, 'n2n');

// Zip everything together, then reduce each those zipped bundles to a single object by merging them
let data = _.map(
  _.zip(e, u, n, e2e, e2u, e2n, u2e, u2u, u2n, n2e, n2u, n2n),
  a => _.reduce(a, (r, v) => _.merge(r, v), {})
);

_.each(data, d => {
  // d.labor = d.e+d.u;
  // d.negN = -d.n;
  d.total = d.e+d.u+d.n;

  d.eIn = d.u2e+d.n2e;
  d.eOut = d.e2u+d.e2n;
  d.eFlux = d.eIn-d.eOut;

  d.uIn = d.n2u+d.e2u;
  d.uOut = d.u2n+d.u2e;
  d.uFlux = d.uIn-d.uOut;

  d.nIn = d.e2n+d.u2n;
  d.nOut = d.n2e+d.n2u;
  d.nFlux = d.nIn-d.nOut;
})

data = _.filter(data, d => d.year >= year0 && d.year < year1);

console.log(data);

export default data;