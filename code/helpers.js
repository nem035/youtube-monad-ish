const R = require('ramda');
const {
  Bacon
} = require('baconjs');
const {
  IO,
  Maybe
} = require('ramda-fantasy');

const breakpoint = (x) => {
  debugger;
  return x;
};

const breakpointIO = (x) => IO(() => {
  debugger;
  return x;
});

const log = R.curry((type, x) => {
  console[type](x);
  return x;
});

const fork = R.curry((error, success, future) => {
  future.fork(error, success);
  return future;
});

const listen = R.curry((event, target) => Bacon.fromEvent(target, event));

const isNotEmpty = R.compose(R.not, R.isEmpty);
const isString = (x) => typeof(x) === 'string';
const isNonEmptyString = (x) => (isNotEmpty(x) && isString(x)) ? Maybe(x) : Maybe(null);

const runIO = (io) => io.runIO();
const chainIO2 = (io, ioFunc) => io.chain(ioFunc);
const chainIO = R.curry(
  (firstIO, listOfIOFuncs) => R.reduce(
    chainIO2,
    firstIO,
    listOfIOFuncs
  )
);

module.exports = {
  breakpoint,
  breakpointIO,
  log,
  fork,
  listen,
  isNonEmptyString,
  runIO,
  chainIO
};
