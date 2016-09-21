const _ = require('ramda');
const $ = require('jquery');
const {
  map,
  compose
} = require('pointfree-fantasy');
const Maybe = require('pointfree-fantasy/instances/maybe');
const {
  extendFunctionPrototype
} = require('./io');
const {
  log,
  fork,
  setHtml,
  listen,
  getData,
  isNonEmptyString
} = require('./helpers');
const Player = require('./player');
const {
  getJSON
} = require('./http');
const {
  apiKey
} = require('./_config');

extendFunctionPrototype();

// PURE /////////////////////////////////////////////////////

// extract DOM IO
const getDomIO = $.toIO();

// extract value from a DOM event
const eventValue = compose(_.trim, _.prop('value'), _.prop('target'));

// listen for keyups and extract&trim the event.target.value
const termStream = compose(map(eventValue), listen('keyup'));

const getInputStream = compose(map(termStream), getDomIO);

// DOM
const li = (props) => $('<li/>', props);

const render = ({
  snippet,
  id
}) => li({
  text: snippet.title,
  'data-youtubeid': id.videoId
});

const videoEntries = compose(map(render), _.prop('items'));

// Youtube API

// build the url
const concatYoutubeUrl = _.concat('https://www.googleapis.com/youtube/v3/search?');
const termToQuery = (term) => `part=snippet&q=${term}&key=${apiKey}`;
const termToUrl = compose(concatYoutubeUrl, termToQuery);

const search = compose(map(videoEntries), getJSON, termToUrl);

const showResult = compose(fork(setHtml('#results')), search);
const showResultOrDoNothing = compose(map(showResult), isNonEmptyString);

// const clickStream = compose(map(_.prop('target')), listen('click'));

// const idInUrl = compose(_.tail, _.split('/'));

// const youtubeId = compose(map(idInUrl), Maybe, getData('youtubeid'));

// IMPURE /////////////////////////////////////////////////////

getInputStream('#search').runIO().onValue(showResultOrDoNothing);

// clickStream(document).onValue(
//   compose(map(compose(setHtml('#player'), Player.create)), youtubeId)
// );