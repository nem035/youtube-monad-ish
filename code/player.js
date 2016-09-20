const create = (yid) => {
  return `<iframe width="320" 
                  height="240" 
                  src="//www.youtube.com/embed/${yid}" 
                  frameborder="0" 
                  allowfullscreen>
          </iframe>`;
};

module.exports = {
  create
};