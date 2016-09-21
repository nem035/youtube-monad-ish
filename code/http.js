const $ = require('jquery');
const Future = require('data.future');

const getJSON = (url) => (
  new Future((error, success) => (
    $.ajax({
      dataType: 'json',
      url,
      error,
      success
    })
  ))
);

module.exports = {
  getJSON
};