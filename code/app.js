const _ = require('ramda');
const $ = require('jquery');
const {
  map,
  compose,
  chain
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
  getData
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
const eventValue = compose(_.prop('value'), _.prop('target'));

// listen for keyups
const valueStream = compose(map(eventValue), listen('keyup'));

// build the url
const concatYoutubeUrl = _.concat('https://www.googleapis.com/youtube/v3/search?');

const termToQuery = (term) => `part=snippet&q=${term}&key=${apiKey}`;

const termToUrl = compose(concatYoutubeUrl, termToQuery);
const urlStream = compose(map(termToUrl), valueStream);
const getInputStream = compose(map(urlStream), getDomIO);

// const render = ({
//   snippet,
//   id
// }) => {
//   return $('<li/>', {
//     text: snippet.title,
//     'data-youtubeid': id.videoId
//   });
// };

// const videoEntries = compose(map(render), _.prop('items'));
// const search = compose(map(videoEntries), getJSON);

// const clickStream = compose(map(_.prop('target')), listen('click'));

// const idInUrl = compose(_.tail, _.split('/'));

// const youtubeId = compose(map(idInUrl), Maybe, getData('youtubeid'));

// IMPURE /////////////////////////////////////////////////////

getInputStream('#search').runIO().onValue(
  // compose(fork(setHtml('#results')), search)
  log
);

// clickStream(document).onValue(
//   compose(map(compose(setHtml('#player'), Player.create)), youtubeId)
// );