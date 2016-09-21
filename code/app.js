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

// extract value from a DOM event
const eventValue = compose(_.trim, _.prop('value'), _.prop('target'));

// listen for keyups and extract&trim the event.target.value
const termStream = compose(map(eventValue), listen('keyup'));

// create a stream of search term strings from the DOM
const searchTermStream = compose(map(termStream), getDomIO);

// YouTube query builder
const concatYoutubeUrl = _.concat('https://www.googleapis.com/youtube/v3/search?');
const termToQuery = (term) => `part=snippet&q=${term}&key=${apiKey}`;
const termToUrl = compose(concatYoutubeUrl, termToQuery);

// convert search terms to youtube urls and create futures for their JSON requests
const request = compose(getJSON, termToUrl);

// result parsing
const extractItems = _.prop('items');
const extractItemProps = _.props(['snippet', 'id']);
const extract = compose(map(extractItemProps), extractItems);

const forkOnResult = fork(log('error'), render);
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