const R = require('ramda');
const {
  Maybe,
  Identity
} = require('ramda-fantasy');
const {
  breakpoint,
  log,
  fork,
  listen,
  isNonEmptyString,
  chainIO
} = require('./helpers');
const {
  selectIO,
  renderResults,
  renderPlayer
} = require('./dom');
const {
  getJSON
} = require('./http');
const {
  apiKey
} = require('./_config');

// :: Object(Event) -> String
const eventValue = R.compose(R.trim, R.path(['target', 'value']));

// :: String -> EventStream(String)
const termStream = R.compose(R.map(eventValue), listen('keyup'));

// :: String -> IO(EventString)
const searchTermIOStream = R.compose(R.map(termStream), selectIO);

// :: String -> String
const concatYoutubeUrl = R.concat('https://www.googleapis.com/youtube/v3/search?');

// :: String -> String
const termToQuery = (term) => `part=snippet&q=${term}&key=${apiKey}`;

// :: String -> String
const termToUrl = R.compose(concatYoutubeUrl, termToQuery);

// :: String -> Future(Object)
const request = R.compose(getJSON, termToUrl);

// :: Object -> Array(Object(title, videoId))
const extract = R.compose(
  R.map(R.apply(R.merge)),
  R.map(R.props(['snippet', 'id'])),
  R.project(['snippet', 'id']),
  R.prop('items')
);

// :: String -> Future(Array(Array))
// accepts a search term string and returns a Future for the YouTube request
const getResult = R.compose(R.map(extract), request);

// :: Future(Maybe(Array(Array)) -> Undefined
// accepts a future that will either resolve with youtube video
// objects and renderResults them, or reject and log the error
const forkOnResult = fork(log('error'), renderResults);

// :: String -> EventStream(String)
// accepts a selector string and returns a stream of event values
const clickStream = R.compose(R.map(R.prop('target')), listen('click'));

// :: String -> IO(EventString)
// accepts a selector string and returns an IO that contains
// a stream of search term strings from the DOM
const resultsListClick = R.compose(R.map(clickStream), selectIO);

// :: DomElement -> DomElement
const findListItem = (target) => {
  while (target.parentElement && target.nodeName !== 'LI') {
    target = target.parentElement;
  }
  return Maybe(target);
}

const showResults = R.compose(
  R.map(forkOnResult),
  R.map(getResult),
  isNonEmptyString
);

const showPlayer = R.compose(
  renderPlayer,
  R.map(R.prop('id')),
  findListItem
);

// IMPURE /////////////////////////////////////////////////////

searchTermIOStream('#search').runIO().onValue(showResults);

resultsListClick('#results').runIO().onValue(showPlayer);
