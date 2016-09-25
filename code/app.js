const _ = require('ramda');
const {
  Maybe,
  Identity
} = require('ramda-fantasy');
const {
  breakpoint,
  log,
  fork,
  listen,
  isNonEmptyString
} = require('./helpers');
const {
  domSelectorIO,
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
// accepts an event object and returns obj.target.value.trim()
const eventValue = _.compose(_.trim, _.prop('value'), _.prop('target'));

// :: String -> EventStream(String)
// accepts a selector string and returns a stream of event values
const termStream = _.compose(_.map(eventValue), listen('keyup'));

// :: String -> IO(EventString)
// accepts a selector string and returns an IO that contains
// a stream of search term strings from the DOM
const searchTermIOStream = _.compose(_.map(termStream), domSelectorIO);

// :: String -> String
const concatYoutubeUrl = _.concat('https://www.googleapis.com/youtube/v3/search?');

// :: String -> String
const termToQuery = (term) => `part=snippet&q=${term}&key=${apiKey}`;

// :: String -> String
// accepts a search term and returns a corresponding URL string
const termToUrl = _.compose(concatYoutubeUrl, termToQuery);

// :: String -> Future(Object)
// accepts a search term string and returns a future for its JSON request)
const request = _.compose(getJSON, termToUrl);


// :: Object -> Array(Object(title, videoId))
// accepts a Object and returns an extracted array of urls and ids for youtube videos
const extract = _.compose(
  _.map(_.apply(_.merge)),
  _.map(_.props(['snippet', 'id'])),
  _.project(['snippet', 'id']),
  _.prop('items')
);

// :: String -> Future(Array(Array))
// accepts a search term string and returns a Future for the YouTube request
const getResult = _.compose(_.map(extract), request);

// :: Future(Maybe(Array(Array)) -> Undefined
// accepts a future that will either resolve with youtube video
// objects and renderResults them, or reject and log the error
const forkOnResult = fork(log('error'), renderResults);

const showResults = _.compose(
  _.map(forkOnResult),
  _.map(getResult),
  isNonEmptyString
);

// :: String -> EventStream(String)
// accepts a selector string and returns a stream of event values
const clickStream = _.compose(_.map(_.prop('target')), listen('click'));

// :: String -> IO(EventString)
// accepts a selector string and returns an IO that contains
// a stream of search term strings from the DOM
const resultsListClick = _.compose(_.map(clickStream), domSelectorIO);
const youtubeId = _.compose(
  Maybe,
  _.prop('youtubeid'),
  _.prop('dataset')
);

const findListItem = (target) => {
  if (target.id === 'results') return Maybe(null);
  if (target.nodeName !== 'LI') return findListItem(target.parentElement);
  return target;
}

const showPlayerOrDoNothing = _.compose(
  renderPlayer,
  youtubeId,
  findListItem
);

// IMPURE /////////////////////////////////////////////////////

searchTermIOStream('#search').runIO().onValue(showResults);

resultsListClick('#results').runIO().onValue(showPlayerOrDoNothing);
