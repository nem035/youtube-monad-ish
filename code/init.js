const app = require('./app');

fetch('https://youtube-shuffle-ejpiaj.herokuapp.com')
  .then((res) => res.json())
  .then(({ apiKey }) => {
    debugger;
    app.start(apiKey);
  });
