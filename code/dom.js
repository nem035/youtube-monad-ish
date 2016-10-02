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

// :: String -> Array(DomElement)
const selectAllIO = (sel) => IO(() => [...document.querySelectorAll(sel)]);

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
const setAttributeIO = R.curry((name, value) => (
  elementIO(
    (elem) => elem.setAttribute(name, value)
  )
));

// :: Array([{ name, value }, ...]) -> Array(Function -> IO)
const setAttributesIOs = R.compose(
  R.map(R.apply(setAttributeIO)),
  R.toPairs
);

// :: String -> IO(DomElement)
const addClassIO = (cls) => elementIO(
  (elem) => elem.className += ` ${cls}`
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

// :: String -> IO(DomElement)
const createAppendableIO = (type) => R.compose(
  R.map(appendChildIO),
  createIO(type)
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
    title: description,
    id: videoId || 'Missing'
  };

  const cls = 'list-item';

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
const createListItemsIO = (items) => chainIO(
  IO.of(items),
  [
    R.traverse(
      IO.of,
      createAppendableListItemFromDataIO
    ),
    chainIO(selectAndClearIO('#results'))
  ]
);

// PLAYER /////////////////////////////////////////////////////////////////////

// :: Any -> IO
const deactivateAllListItemsIO = () => chainIO(
  selectAllIO('.list-item'),
  [
    R.traverse(
      IO.of,
      removeClassIO('active')
    )
  ]
);

// :: DomElement -> IO
const activateListItemIO = (yid) => () => chainIO(
  selectIO(`[id="${yid}"]`),
  [addClassIO('active')]
);

// :: String -> IO
const createPlayerIO = (yid) => chainIO(
  selectIO('#player'),
  [
    setAttributeIO('src', `//www.youtube.com/embed/${yid}`),
    deactivateAllListItemsIO,
    activateListItemIO(yid)
  ]
);

const renderResults = R.compose(
  runIO,
  createListItemsIO
);

const renderPlayer = R.map(
  R.compose(
    runIO,
    createPlayerIO
  )
);

module.exports = {
  selectIO,
  renderResults,
  renderPlayer,
};
