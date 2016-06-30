'use strict';

var picturesContainer = document.querySelector('.pictures');
module.exports = function(callback) {
  var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';
  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if (xhr.status !== 200) {
      picturesContainer.classList.add('pictures-failure');
    }
  };

  xhr.onreadystatechange = function(evt) {
    if(xhr.readyState === xhr.LOADING) {
      picturesContainer.classList.remove('pictures-loading');
    } else if (xhr.readyState === xhr.DONE) {
      var loadedData = JSON.parse(evt.target.response);
      callback(loadedData);
    }
  };


  picturesContainer.classList.add('pictures-loading');

  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();
};
