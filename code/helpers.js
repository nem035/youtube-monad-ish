const _ = require('ramda');
const $ = require('jquery');
const {
  Bacon
} = require('baconjs');
const Maybe = require('pointfree-fantasy/instances/maybe');
const {
  Left,
  Right
} = require('data.either');

const log = x => {
  console.log(x);
  return x;
};

const fork = _.curry((f, future) => future.fork(log, f));

const setHtml = _.curry((sel, x) => $(sel).html(x));

const listen = _.curry((event, target) => Bacon.fromEvent(target, event));

const getData = _.curry((name, elem) => $(elem).data(name));

const isNotEmpty = _.compose(_.not, _.isEmpty);
const isString = (x) => typeof(x) === 'string';
const isNonEmptyString = (x) => isNotEmpty(x) && isString(x) ? Right(x) : Left(null);

module.exports = {
  log,
  fork,
  setHtml,
  listen,
  getData,
  isNonEmptyString
};