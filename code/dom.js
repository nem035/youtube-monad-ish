const _ = require('ramda');
const {
  IO,
  Tuple,
  Maybe
} = require('ramda-fantasy');
const {
  breakpoint,
  log,
  runIO,
  wrapInIO,
  chainIO
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

// :: (DomElement, String) -> DomElement
const addClass = _.curry((cls, elem) => {
  elem.className += cls
  return elem;
});

// :: (DomElement, String) -> DomElement
const removeClass = _.curry((cls, elem) => {
  elem.className = elem.className.replace(cls, '');
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

const findListItem = (target) => {
  if (target.id === 'results') return Maybe(null);
  if (target.nodeName !== 'LI') return findListItem(target.parentElement);
  return target;
}

const activateListItem = addClass('active');

const deactivateItems = _.compose(
  _.map(removeClass('active')),
  (x) => document.querySelectorAll(x)
);

const deactivateAllListItems = (li) => {
  deactivateItems('li');
  return li;
};

const playerRunner = (tuple) => {
  const playerDOM = tuple[0].runIO().runIO();
  const res = tuple[1];
  res.value(playerDOM);
};

// :: Object(YoutubeData) -> () => IO((elem) => appendChild(DomElement(li), elem)
const listItemCreateAndAppendIO = _.compose(
  wrapInIO,
  appendChild,
  createListItem
);

// :: Array(Object(YoutubeData)) -> Undefined
const renderResults = _.compose(
  runIO,
  // an IO chain that appends elements to the body
  _.reduce(chainIO, domSelectorIO('#results')),
  // Array(() => IO((e) => appendChild(DomElement(li), e))
  _.map(listItemCreateAndAppendIO)
);

const setPlayerAttributes = _.compose(
  setAttribute('width', '320'),
  setAttribute('height', '240'),
  setAttribute('frameborder', '0'),
  setAttribute('allowfullscreen', 'true')
);

const createPlayer = (yid) => {
  const player = createElement('iframe');
  setPlayerAttributes(player);
  setAttribute('src', `//www.youtube.com/embed/${yid}`, player);
  return player;
};

const renderPlayer = _.compose(
  playerRunner,
  Tuple(getClearResultsContainer('#player')),
  _.map(appendChild),
  _.map(createPlayer)
);

module.exports = {
  domSelectorIO,
  renderResults,
  renderPlayer,
  activateListItem,
  findListItem,
  deactivateAllListItems
};
