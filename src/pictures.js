'use strict';
var IMAGE_SIZE = 182;
var formFilters = document.querySelector('.filters');
formFilters.classList.add('hidden');



var picturesContainer = document.querySelector('.pictures');
var templateElement = document.querySelector('template');
var pictureClone;

if ('content' in templateElement) {
  pictureClone = templateElement.content.querySelector('.picture');
} else {
  pictureClone = templateElement.querySelector('.picture');
}

var jsonpQuery = function(url, callback) {
  var tagScript = document.createElement('script');
  tagScript.src = url;
  document.body.appendChild(tagScript);

  tagScript.onload = function() {
    callback();
  };
};

window.__picturesLoadCallback = function() {
  var pictures = arguments[0] || [];
  pictures.forEach(function(picture) {
    getPictureElement(picture, picturesContainer);
  });
};

var getPictureElement = function(data, container) {
  var element = pictureClone.cloneNode(true);

  var image = new Image();
  var imgElem = element.querySelector('img');
  image.onload = function() {
    imgElem.src = image.src;
    imgElem.width = IMAGE_SIZE;
    imgElem.height = IMAGE_SIZE;
  };
  image.onerror = function() {
    element.classList.add('picture-load-failure');
  };
  image.src = data.url;

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  container.appendChild(element);
  return element;
};

jsonpQuery('//up.htmlacademy.ru/assets/js_intensive/jsonp/pictures.js', window.__picturesLoadCallback);

formFilters.classList.remove('hidden');
