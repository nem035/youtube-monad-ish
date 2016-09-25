const _ = require('ramda');
const {
  IO
} = require('ramda-fantasy');
const {
  breakpoint,
  log,
  runIO
} = require('./helpers');

// :: String -> IO(DomElement)
const domSelectorIO = (sel) => IO(() => document.querySelector(sel));

// :: DomElement -> IO(DomElement)
const removeAllChildren = (elem) => IO(() => {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
  return elem;
});

// :: String -> IO //TODO:?
const getClearResultsContainer = _.compose(
  _.map(removeAllChildren),
  domSelectorIO
);

// :: (DomElement, DomElement) -> DomElement
const appendChild = _.curry((child, elem) => {
  elem.appendChild(child);
  return elem;
});

// :: (DomElement, String, Any) -> Undefined
const setAttribute = _.curry((name, value, elem) => {
  elem.setAttribute(name, value);
  return elem;
});

// :: String -> DomElement
const createElement = (type) => document.createElement(type);

const createListItem = ({ title, description, thumbnails, videoId }) => {
  const li = createElement('li');
  setAttribute('data-youtubeid', videoId, li);
  setAttribute('title', description, li);

  const { width, height, url } = thumbnails.default;
  li.innerHTML = `
    <div class="avatar">
      <img height=${height} width=${width} src=${url} alt="avatar">
    </div>
    <div class="meta">
      <span class="title">${title}</span>
      <p class="description">
        ${description}
      </p>
    </div>
  `;
  return li;
};

// ::
const runner = _.reduce(
  (prev, curr) => prev === null ? curr.runIO().runIO() : curr(prev),
  null
);

// :: Array(Object(String(title), String(videoId))) -> Undefined
const render = _.compose(
  runner,
  _.prepend(getClearResultsContainer('#results')),
  _.map(appendChild),
  _.map(createListItem)
);


module.exports = {
  domSelectorIO,
  render
};
