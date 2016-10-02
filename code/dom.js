const R = require('ramda');
const {
  IO,
  Tuple,
  Maybe
} = require('ramda-fantasy');
const {
  breakpoint,
  breakpointIO,
  log,
  runIO,
  chainIO
} = require('./helpers');

// :: String -> IO(DomElement)
const selectIO = (sel) => IO(() => document.querySelector(sel));

// :: String -> IO(DomElement)
const createIO = (type) => IO(() => document.createElement(type));

// :: (Function, DomElement) -> IO()
const elementIO = R.curry((fn, elem) => IO(
  () => {
    fn(elem);
    return elem;
  }
));

// :: String -> IO(DomElement)
const setHtmlIO = (html) => elementIO(
  (elem) => elem.innerHTML = html
);

// :: (String, String) -> IO(DomElement)
const setAttributeIO = R.curry((name, value) => {
  debugger;
  return elementIO(
    (elem) => elem.setAttribute(name, value)
  );
});

// :: Array([{ name, value }, ...]) -> Array(Function -> IO)
const setAttributesIOs = R.compose(
  R.map(R.apply(setAttributeIO)),
  R.toPairs
);

// :: String -> IO(DomElement)
const addClassIO = (cls) => elementIO(
  (elem) => elem.className += cls
);

// :: String -> IO(DomElement)
const removeClassIO = (cls) => elementIO(
  (elem) => elem.className = elem.className.replace(cls, '')
);

// :: DomElement -> IO(DomElement)
const appendChildIO = (child) => elementIO(
  (elem) => elem.appendChild(child)
);

// :: DomElement -> IO(DomElement)
const removeAllChildrenIO = elementIO((elem) => {
  (elem) => {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  }
});

// :: String -> IO(DomElement)
const selectAndClearIO = (sel) => chainIO(
  selectIO(sel),
  [removeAllChildrenIO]
);

// :: (String, Object) -> IO(DomElement)
const createFromDataIO = R.curry(
  (type, data) => chainIO(
    createIO(type),
    R.concat([
      setHtmlIO(data.html),
      addClassIO(data.cls)
    ], setAttributesIOs(data.attributes))
  )
);

// :: String -> Function -> IO
const createAppendableFromDataIO = (type) => R.compose(
  R.map(appendChildIO),
  createFromDataIO(type)
);

// :: Object -> Object
const buildDataObject = (youtubeObject) => {
  const { title, description, thumbnails, videoId } = youtubeObject;
  const { width, height, url } = thumbnails.default;

  const html = `
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

  const attributes = {
    'data-youtubeid': videoId,
    title: description
  };

  const cls = '';

  return {
    html,
    attributes,
    cls
  };
};

// :: Object -> Function -> IO
const createAppendableListItemFromDataIO = R.compose(
  createAppendableFromDataIO('li'),
  buildDataObject
);

// :: Array -> IO(DomElement)
const listItemsIO = (items) => chainIO(
  IO.of(items),
  [
    R.traverse(
      IO.of,
      createAppendableListItemFromDataIO
    ),
    chainIO(selectAndClearIO('#results'))
  ]
);

const renderResults = R.compose(
  runIO,
  listItemsIO
);

const findListItem = (target) => {
  if (target.id === 'results') return Maybe(null);
  if (target.nodeName !== 'LI') return findListItem(target.parentElement);
  return target;
}

const activateListItem = addClassIO('active');

const deactivateItems = R.compose(
  R.map(removeClassIO('active')),
  (x) => document.querySelectorAll(x)
);

const deactivateAllListItems = (li) => {
  deactivateItems('li');
  return li;
};

const playerRunner = (tuple) => {
  // const playerDOM = tuple[0].runIO().runIO();
  // const res = tuple[1];
  // res.value(playerDOM);
};

const setPlayerAttributesIO = chainIO(
  // setAttributeIO('width', '320'),
  // setAttributeIO('height', '240'),
  // setAttributeIO('frameborder', '0'),
  // setAttributeIO('allowfullscreen', 'true')
);

const createPlayer = (yid) => {
  // const player = createElement('iframe');
  // setPlayerAttributesIO(player);
  // setAttributeIO('src', `//www.youtube.com/embed/${yid}`, player);
  // return player;
};

const renderPlayer = R.compose(
  playerRunner
  // Tuple(getClearResultsContainer('#player')),
  // R.map(appendChildIO),
  // R.map(createPlayer)
);

module.exports = {
  selectIO,
  renderResults,
  renderPlayer,
  activateListItem,
  findListItem,
  deactivateAllListItems
};
