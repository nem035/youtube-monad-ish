const _ = require('ramda');
const $ = require('jquery');
const {
  Bacon
} = require('baconjs');

const log = x => {
  console.log(x);
  return x;
};

const fork = _.curry((f, future) => {
  return future.fork(log, f);
});

const setHtml = _.curry((sel, x) => {
  return $(sel).html(x);
});

const listen = _.curry((event, target) => {
  return Bacon.fromEvent(target, event);
});

const getData = _.curry((name, elem) => {
  return $(elem).data(name);
});

module.exports = {
  log,
  fork,
  setHtml,
  listen,
  getData
};