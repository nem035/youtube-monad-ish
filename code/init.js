const app = require('./app');

fetch('https://youtube-shuffle-ejpiaj.herokuapp.com/kljuc-na-ejpiaj')
  .then((res) => res.json())
  .then(({ apiKey }) => {
    app.start(apiKey);
  });
