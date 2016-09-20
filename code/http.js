const $ = require('jquery');
const Future = require('data.future');

const getJSON = (url) => {
  return new Future((rej, res) => {
    $.getJSON(url, res);
  });
};

module.exports = {
  getJSON
};