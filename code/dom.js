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

const render = compose(renderIntoResultsList, map(buildListItem));

module.exports = {
  getDomIO,
  render
}