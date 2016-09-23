const _ = require('ramda');
const $ = require('jquery');
const {
  map,
  compose
} = require('pointfree-fantasy');
const Maybe = require('pointfree-fantasy/instances/maybe');
const {
  log,
  fork,
  setHtml,
  listen,
  getData,
  isNonEmptyString
} = require('./helpers');
const {
  getDomIO,
  render
} = require('./dom');
const Player = require('./player');
const {
  getJSON
} = require('./http');
const {
  apiKey
} = require('./_config');

// eventValue:: Object -> String
// accepts an event object and returns obj.target.value.trim()
const eventValue = compose(_.trim, _.prop('value'), _.prop('target'));

// termStream:: String -> EventStream
// accepts a selector string and returns a stream of event values
const termStream = compose(map(eventValue), listen('keyup'));

// searchTermStream:: String -> EventStream
// accepts a selector string and returns an IO that contains
// a stream of search term strings from the DOM
const searchTermStream = compose(map(termStream), getDomIO);

// YouTube query builder
const concatYoutubeUrl = _.concat('https://www.googleapis.com/youtube/v3/search?');
const termToQuery = (term) => `part=snippet&q=${term}&key=${apiKey}`;
// termToUrl:: String -> String
// accepts a search term and returns a corresponding URL string
const termToUrl = compose(concatYoutubeUrl, termToQuery);

// request:: String -> Future
// accepts a search term string and returns a future for its JSON request)
const request = compose(getJSON, termToUrl);

// result parsing
const extractItems = _.prop('items');
const extractItemProps = _.props(['snippet', 'id']);
// extract:: POJO -> [Object]
// accepts a POJO and returns an array of urls and ids for youtube videos
const extract = compose(map(extractItemProps), extractItems);

// forkOnResult:: Future -> Undefined
// accepts a future that will either resolve with youtube video
// objects and render them, or reject and log the error
const forkOnResult = fork(log('error'), render);

// getResult:: String -> Future([Object])
// accepts a search term string and returns a Future for the YouTube request
const getResult = compose(forkOnResult, map(extract), request);
const getResultOrDoNothing = compose(map(getResult), isNonEmptyString);

// const clickStream = compose(map(_.prop('target')), listen('click'));

// const idInUrl = compose(_.tail, _.split('/'));

// const youtubeId = compose(map(idInUrl), Maybe, getData('youtubeid'));

// IMPURE /////////////////////////////////////////////////////

searchTermStream('#search').runIO().onValue(getResultOrDoNothing);

// clickStream(document).onValue(
//   compose(map(compose(setHtml('#player'), Player.create)), youtubeId)
// );