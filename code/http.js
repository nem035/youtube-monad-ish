const {
  Future
} = require('ramda-fantasy');

const getJSON = (url) => (
  Future(
    (error, success) => (
      fetch(url)
        .then((response) => response.json())
        .then(success)
        .catch(error)
    )
  )
);

module.exports = {
  getJSON
};
