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

const log = _.curry((type, x) => {
  console[type](x);
  return x;
});

const fork = _.curry((error, success, future) => future.fork(error, success));

const listen = _.curry((event, target) => Bacon.fromEvent(target, event));

const getData = _.curry((name, elem) => $(elem).data(name));

const isNotEmpty = _.compose(_.not, _.isEmpty);
const isString = (x) => typeof(x) === 'string';
const isNonEmptyString = (x) => isNotEmpty(x) && isString(x) ? Right(x) : Left(null);

module.exports = {
  log,
  fork,
  listen,
  getData,
  isNonEmptyString
};