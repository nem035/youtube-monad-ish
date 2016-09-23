const _ = require('ramda');
const $ = require('jquery');
const {
  map,
  compose
} = require('pointfree-fantasy');
const {
  extendFunctionPrototype
} = require('./io');

extendFunctionPrototype();

// getDomIO:: Any -> IO(Any) (Wraps the $ into an IO)
const getDomIO = $.toIO();

const setHtml = _.curry((sel, x) => $(sel).html(x));

const li = (props) => $('<li/>', props);

const buildListItem = ([snippet, id]) => {
  return li({
    text: snippet.title,
    'data-youtubeid': id.videoId
  });
};

const renderIntoResultsList = setHtml('#results');

// render:: Future([Object]) -> Undefined
// accepts a Future and renders a <ul> containing an <li>
// for each Object in the [] within the Future
const render = compose(renderIntoResultsList, map(buildListItem));

module.exports = {
  getDomIO,
  render
}