const _ = require('ramda');
const {
  Bacon
} = require('baconjs');
const {
  Maybe
} = require('ramda-fantasy');

const breakpoint = (x) => {
  debugger;
  return x;
};

const log = _.curry((type, x) => {
  console[type](x);
  return x;
});

const fork = _.curry((error, success, future) => {
  future.fork(error, success);
  return future;
});

const listen = _.curry((event, target) => Bacon.fromEvent(target, event));

const isNotEmpty = _.compose(_.not, _.isEmpty);
const isString = (x) => typeof(x) === 'string';
const isNonEmptyString = (x) => (isNotEmpty(x) && isString(x)) ? Maybe(x) : Maybe(null);

const runIO = (io) => io.runIO();

module.exports = {
  breakpoint,
  log,
  fork,
  listen,
  isNonEmptyString,
  runIO
};
